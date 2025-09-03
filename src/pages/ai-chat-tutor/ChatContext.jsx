import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { sendMessage as apiSendMessage, sendMessageWithImages } from './ApiService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);
  const [attachedImages, setAttachedImages] = useState([]);
  const [savedExplanations, setSavedExplanations] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('chatConversations');
    const savedExplanationsData = localStorage.getItem('savedExplanations');
    
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
    
    if (savedExplanationsData) {
      setSavedExplanations(JSON.parse(savedExplanationsData));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatConversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('savedExplanations', JSON.stringify(savedExplanations));
  }, [savedExplanations]);

  // Add highlight to messages
  useEffect(() => {
    if (highlightedMessageId) {
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          isHighlighted: msg.id === highlightedMessageId
        }))
      );
    }
  }, [highlightedMessageId, messages]);

  const attachImages = (images) => {
    setAttachedImages(images.slice(0, 2));
  };

  const clearAttachments = () => {
    setAttachedImages([]);
  };

  const startNewConversation = () => {
    const newConversationId = Date.now().toString();
    setCurrentConversationId(newConversationId);
    setMessages([]);
    setAttachedImages([]);
    setHighlightedMessageId(null);
    return newConversationId;
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages || []);
      setHighlightedMessageId(null);
    }
  };

  const saveExplanation = (message) => {
  // Create a COMPOUND ID using conversationId + messageId
  const compoundId = `${currentConversationId}_${message.id}`;
  
  const isAlreadySaved = savedExplanations.some(exp => exp.id === compoundId);
  
  if (isAlreadySaved) {
    // Remove the explanation if it's already saved
    setSavedExplanations(prev => prev.filter(exp => exp.id !== compoundId));
    return null;
  } else {
    // Add the explanation if it's not saved
    const newExplanation = {
      id: compoundId, // UNIQUE ID combining conversation + message
      messageId: message.id, // Original message ID for reference
      conversationId: currentConversationId,
      title: message.text.substring(0, 30) + (message.text.length > 30 ? '...' : ''),
      content: message.text,
      subject: 'General',
      savedAt: new Date().toISOString()
    };
    
    setSavedExplanations(prev => [...prev, newExplanation]);
    return newExplanation;
  }
};

  const deleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      startNewConversation();
    }
  };

  const deleteSavedExplanation = (explanationId) => {
    setSavedExplanations(prev => prev.filter(e => e.id !== explanationId));
  };

  const exportConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return null;
    
    const dataStr = JSON.stringify(conversation, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    return dataUri;
  };

  const importConversation = (jsonData) => {
    try {
      const conversation = JSON.parse(jsonData);
      // Validate it has the right structure
      if (conversation && conversation.id && conversation.messages) {
        setConversations(prev => [...prev, conversation]);
        return conversation.id;
      }
    } catch (error) {
      console.error('Invalid conversation data:', error);
    }
    return null;
  };

  const clearAllHistory = () => {
    setConversations([]);
    setSavedExplanations([]);
    startNewConversation();
    localStorage.removeItem('chatConversations');
    localStorage.removeItem('savedExplanations');
  };

  const highlightMessage = (messageId) => {
    setHighlightedMessageId(messageId);
  };

  const clearHighlight = useCallback(() => {
    setHighlightedMessageId(null);
    setMessages(prevMessages => 
      prevMessages.map(msg => ({ ...msg, isHighlighted: false }))
    );
  }, []);

  const simulateTyping = async (response) => {
    setIsLoading(true);
    
    // Calculate typing time based on response length (approx 50ms per character)
    const typingTime = Math.min(response.length * 50, 3000);
    await new Promise(resolve => setTimeout(resolve, typingTime));
    
    return response;
  };

  const sendMessage = async (content, type = "text", images = [], retryCount = 0) => {
    if (isAIResponding) {
      console.log("Buddy is still responding. Please wait...");
      return;
    }

    if (!content.trim() && images.length === 0) return;

    // Set the flag to indicate AI is responding
    setIsAIResponding(true);

    // If no current conversation, start a new one
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = startNewConversation();
    }

    // Convert images to base64 for persistent storage
    let imageData = null;
    if (images.length > 0) {
      const imagePromises = images.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target.result); // This will be a data URL
          };
          reader.readAsDataURL(file);
        });
      });

      imageData = await Promise.all(imagePromises);
    }

    const userMessage = {
      id: Date.now().toString(),
      text: content,
      type,
      isUser: true,
      timestamp: new Date().toISOString(),
      isVoice: type === "voice",
      images: imageData
    };

    // Add user message to chat
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    setIsLoading(true);

    try {
      let aiResponse;

      // Prepare conversation history for API
      const conversationHistory = messages
        .filter(msg => !msg.images || msg.images.length === 0)
        .map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text
        }));

      if (images.length > 0) {
        // Extract base64 data from data URLs for API call
        const imageBase64Array = imageData.map(dataUrl => dataUrl.split(',')[1]);
        aiResponse = await sendMessageWithImages(content, imageBase64Array, conversationHistory);
      } else {
        aiResponse = await apiSendMessage(content, conversationHistory);
      }

      // Simulate typing after getting the response
      aiResponse = await simulateTyping(aiResponse);

      const aiMessage = {
        id: (Date.now() + 1).toString(), // Different ID from user message
        text: aiResponse,
        type: "text",
        isUser: false,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      // Update conversations list
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === conversationId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            messages: finalMessages,
            lastMessage: content,
            timestamp: new Date().toISOString(),
            messageCount: finalMessages.length
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: conversationId,
              title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
              lastMessage: content,
              timestamp: new Date().toISOString(),
              messages: finalMessages,
              messageCount: finalMessages.length
            }
          ];
        }
      });

    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = {
        id: Date.now().toString(),
        text: "Buddy is resting! Try again soon 😴",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsAIResponding(false);
      // Don't clear input or attachments here as they're already cleared
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversationId,
      messages,
      isLoading,
      isAIResponding,
      sendMessage,
      attachedImages,
      attachImages,
      clearAttachments,
      isVoiceInputOpen,
      openVoiceInput: () => setIsVoiceInputOpen(true),
      closeVoiceInput: () => setIsVoiceInputOpen(false),
      startNewConversation,
      loadConversation,
      deleteConversation,
      deleteSavedExplanation,
      savedExplanations,
      saveExplanation,
      exportConversation,
      importConversation,
      clearAllHistory,
      highlightMessage,
      clearHighlight
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);