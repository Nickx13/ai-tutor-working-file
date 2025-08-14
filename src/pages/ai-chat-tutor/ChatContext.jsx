import { createContext, useState, useContext } from 'react';
import { sendMessage as apiSendMessage } from './ApiService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);

  const sendMessage = async (content, type = "text") => {
    if (!content.trim()) return;
    
    setMessages(prev => [...prev, {
      text: content,
      type,
      isUser: true,
      timestamp: new Date().toISOString(),
      isVoice: type === "voice"
    }]);
    
    setIsLoading(true);
    
    try {
      const aiResponse = await apiSendMessage(content);
      
      setMessages(prev => [...prev, {
        text: aiResponse,
        type: "text",
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, {
        text: "Buddy is resting! Try again soon 😴",
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      isLoading,
       
      sendMessage,
      isVoiceInputOpen,
      openVoiceInput: () => setIsVoiceInputOpen(true),
      closeVoiceInput: () => setIsVoiceInputOpen(false)
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);