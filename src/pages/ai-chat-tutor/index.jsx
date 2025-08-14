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
    messages, 
    isLoading, 
    sendMessage,
    isVoiceInputOpen,
    openVoiceInput,
    closeVoiceInput
  } = useChat();
  
  const [inputText, setInputText] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);


  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (transcript) => {
    sendMessage(transcript, "voice");
    closeVoiceInput();
  };

  const handleTextExtracted = (text) => {
    setInputText(prev => prev ? `${prev}\n${text}` : text);
    setShowImageUpload(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex h-screen pt-14 pb-16">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Bot" size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">AI Tutor</h1>
                <p className="text-sm text-muted-foreground">
                  Always here to help you learn
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSidebar(true)}
              className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center lg:hidden"
            >
              <Icon name="Menu" size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                isUser={message.isUser}
              />
            ))}
            
            {isLoading && (
              <MessageBubble isTyping isUser={false} />
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 0 && <QuickSuggestions />}

          {/* Input Area */}
          <div className="border-t border-border bg-card p-4 safe-area-pb">
        <div className="flex items-end gap-2">
          <AutoResizeTextarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            maxRows={8} // Adjust based on needs
            className="flex-1"
          />
          
          <div className="flex gap-2 ml-2">
            <button
              onClick={openVoiceInput}
              className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Icon name="Mic" size={20} className="text-secondary-foreground" />
            </button>
            
            <button
              onClick={() => setShowImageUpload(true)}
              className="w-11 h-11 bg-accent rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Icon name="Camera" size={20} className="text-accent-foreground" />
            </button>
            
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-11 h-11 bg-primary rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-muted"
            >
              <Icon name="Send" size={20} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
          </div>
        

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <ConversationSidebar
            isOpen
            onClose={() => {}}
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <ConversationSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
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
        onTextExtracted={handleTextExtracted}
        
      />

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