import React, { useState, useEffect, useRef } from 'react';
import { ChatProvider, useChat } from './ChatContext';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Icon from '../../components/AppIcon';
import MessageBubble from './components/MessageBubble';
import QuickSuggestions from './components/QuickSuggestions';
import VoiceInput from './components/VoiceInput';
import ImageUpload from './components/ImageUpload';
import ConversationSidebar from './components/ConversationSidebar';
import AutoResizeTextarea from './components/AutoResizeTextarea';

const AIChatTutor = () => {
  const { 
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
    openVoiceInput,
    closeVoiceInput,
    startNewConversation,
    loadConversation,
    deleteConversation,
    savedExplanations,
    saveExplanation,
    deleteSavedExplanation,
    highlightMessage,
    clearHighlight
  } = useChat();
  
  const [inputText, setInputText] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const highlightedMessageRef = useRef(null);

  // Effect to manage URL lifecycle and prevent memory leaks
  useEffect(() => {
    const newUrls = attachedImages.map(file => URL.createObjectURL(file));
    setImageUrls(newUrls);
    
    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [attachedImages]);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightedMessageRef.current) {
      highlightedMessageRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      // Remove highlight after scrolling
      setTimeout(() => clearHighlight(), 2000);
    }
  }, [messages, clearHighlight]);

  const handleNewChat = () => {
    startNewConversation();
    setInputText('');
    clearHighlight();
  };

  const handleSend = async () => {
    if (!inputText.trim() && attachedImages.length === 0) return;
    
    // Save the current input and images
    const currentInput = inputText;
    const currentImages = [...attachedImages];
    
    // Clear the input immediately after user sends (BEFORE the API call)
    setInputText('');
    clearAttachments();
    clearHighlight();
    
    await sendMessage(currentInput, "text", currentImages);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (transcript) => {
    sendMessage(transcript, "voice");
    closeVoiceInput();
    clearHighlight();
  };

  const handleImagesSelected = (images) => {
    attachImages(images);
  };

  const removeImage = (index) => {
    const newImages = [...attachedImages];
    newImages.splice(index, 1);
    attachImages(newImages);
  };

  const handleSaveExplanation = (message) => {
    saveExplanation(message);
  };



  const handleSelectSavedExplanation = (explanation) => {
    // Load the conversation that contains this saved explanation
    loadConversation(explanation.conversationId);
    
    // Highlight the specific message
    highlightMessage(explanation.messageId);
    
    // Close sidebar on mobile
    setShowSidebar(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Main content area with proper spacing for header and bottom nav */}
      <div className="flex flex-1 pt-14 pb-16 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chat Header with New Chat button */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Bot" size={20} className="text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">AI Tutor</h1>
                <p className="text-sm text-muted-foreground truncate">
                  {currentConversationId ? `Conversation • ${messages.length} messages` : 'Start a new conversation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={handleNewChat}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center"
              >
                <Icon name="Plus" size={16} className="mr-1" />
                New Chat
              </button>
              
              <button
                onClick={() => setShowSidebar(true)}
                className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center lg:hidden flex-shrink-0"
              >
                <Icon name="Menu" size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          <div 
            ref={messagesContainerRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ maxHeight: 'calc(100vh - 250px)' }}
          >
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <Icon name="MessageCircle" size={50} className="mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Start a conversation</h3>
                <p className="text-s">Ask a question or use one of the quick suggestions below</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  // Check if this specific message is saved in the current conversation
                  const isMessageSaved = savedExplanations.some(
                    exp => exp.messageId === message.id && exp.conversationId === currentConversationId
                  );

                  return (
                    <div
                      key={message.id || index}
                      ref={message.isHighlighted ? highlightedMessageRef : null}
                      className={message.isHighlighted ? 'ring-2 ring-blue-400 rounded-lg' : ''}
                    >
                      <MessageBubble
                        message={message}
                        isUser={message.isUser}
                        isSaved={isMessageSaved}
                        onSave={() => handleSaveExplanation(message)}
                      />
                    </div>
                  );
                })}
                
                {isLoading && (
                  <MessageBubble isTyping isUser={false} />
                )}
              </>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions - Only show when no messages */}
          {messages.length === 0 && <QuickSuggestions />}

          {/* Input Area */}
          <div className="border-t border-border bg-card p-4 flex-shrink-0">
            {/* Attached images preview */}
            {attachedImages.length > 0 && (
              <div className="flex gap-3 mb-3 items-center flex-wrap" style={{ overflow: 'visible' }}>
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg border bg-white flex-shrink-0"
                    style={{ overflow: 'visible' }}
                  >
                    <img 
                      src={url}
                      alt={`Attached ${index}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      type="button"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-sm leading-none flex items-center justify-center shadow ring-2 ring-white"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <AutoResizeTextarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={attachedImages.length > 0 ? "Add text (optional)..." : "Ask me anything..."}
                maxRows={8}
                className="flex-1 min-w-0"
              />
              
              <div className="flex gap-2 ml-2 flex-shrink-0">
                <button
                  onClick={openVoiceInput}
                  className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 hover:bg-secondary/90 transition-colors"
                  type="button"
                >
                  <Icon name="Mic" size={20} className="text-secondary-foreground" />
                </button>

                <button
                  onClick={() => setShowImageUpload(true)}
                  type="button"
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 relative transition-colors ${
                    attachedImages.length > 0 ? 'bg-primary hover:bg-primary/90' : 'bg-accent hover:bg-accent/90'
                  }`}
                >
                  <Icon 
                    name="Image" 
                    size={20} 
                    className={attachedImages.length > 0 ? 'text-primary-foreground' : 'text-accent-foreground'}
                  />
                  {attachedImages.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {attachedImages.length}
                    </span>
                  )}
                </button>
              
                <button
                  onClick={handleSend}
                  disabled={(!inputText.trim() && attachedImages.length === 0) || isLoading || isAIResponding}
                  className="w-11 h-11 bg-primary rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-muted disabled:opacity-50 transition-all duration-200"
                  type="button"
                >
                  {isLoading || isAIResponding ? (
                    <div className="animate-spin">
                      <Icon name="Loader2" size={20} className="text-primary-foreground" />
                    </div>
                  ) : (
                    <Icon name="Send" size={20} className="text-primary-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 border-l border-border flex-shrink-0 overflow-hidden">
          <ConversationSidebar
            isOpen={true}
            onClose={() => {}}
            conversations={conversations}
            savedExplanations={savedExplanations}
            onSelectConversation={loadConversation}
            onSelectSavedExplanation={handleSelectSavedExplanation}
            onDeleteConversation={deleteConversation}
            onDeleteSavedExplanation={deleteSavedExplanation}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Mobile Sidebar */}
        <ConversationSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          conversations={conversations}
          savedExplanations={savedExplanations}
          onSelectConversation={loadConversation}
          onSelectSavedExplanation={handleSelectSavedExplanation}
          onDeleteConversation={deleteConversation}
          onDeleteSavedExplanation={deleteSavedExplanation}
          onNewChat={handleNewChat}
        />

        {/* Modals */}
        <VoiceInput
          isActive={isVoiceInputOpen}
          onTranscript={handleVoiceTranscript}
          onClose={closeVoiceInput}
        />
        
        <ImageUpload
          isOpen={showImageUpload}
          onClose={() => setShowImageUpload(false)}
          onImagesSelected={handleImagesSelected}
        />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default function AIChatTutorWrapper() {
  return (
    <ChatProvider>
      <AIChatTutor />
    </ChatProvider>
  );
}