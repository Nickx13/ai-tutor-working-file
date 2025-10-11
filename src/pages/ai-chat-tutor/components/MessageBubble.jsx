import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useChat } from '../ChatContext';

// Simple markdown parser for basic formatting
const formatMessageText = (text) => {
  if (!text) return '';
  
  // Replace markdown with HTML elements
  let formattedText = text
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Headers (##, ###)
    .replace(/### (.*?)(?:\n|$)/g, '<h3 class="text-lg font-semibold mt-3 mb-1">$1</h3>')
    .replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    // Bullet points
    .replace(/^- (.*?)(?:\n|$)/g, '<li class="ml-4">$1</li>')
    // Numbered lists
    .replace(/^(\d+)\. (.*?)(?:\n|$)/g, '<li class="ml-4">$2</li>')
    // Line breaks
    .replace(/\n/g, '<br />');
  
  // Wrap lists in proper tags
  if (formattedText.includes('<li')) {
    formattedText = formattedText.replace(/(<li.*?<\/li>)+/g, '<ul class="list-disc pl-5 my-2">$&</ul>');
  }
  
  return formattedText;
};

const MessageBubble = ({ message, isUser, isTyping, onSave, isSaved }) => {
  const { isLoading } = useChat();

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShareMessage = async (text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Tutor Message',
          text: text
        });
      } catch (error) {
        console.error('Sharing failed:', error);
      }
    }
  };

  // Typing indicator for AI responses
  if (!isUser && isLoading && isTyping) {
    return (
      <div className="flex items-end space-x-2 mb-4">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Icon name="Bot" size={16} className="text-primary-foreground" />
        </div>
        <div className="bg-muted rounded-bl-md rounded-2xl px-4 py-3">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-muted-foreground ml-2">Buddy is thinking...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end space-x-2 mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="Bot" size={16} className="text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
        <div
          className={`rounded-2xl px-4 py-3 relative group ${
            isUser
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          }`}
        >
          {/* Message actions */}
          {!isUser && onSave && (
            <div className="absolute -top-2 -right-8 opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity duration-150">
              <button
                onClick={() => handleCopyMessage(message.text)}
                className="p-1 bg-muted rounded hover:bg-muted/80"
                title="Copy message"
              >
                <Icon name="Copy" size={12} />
              </button>
<button
  onClick={() => onSave(message)}
  className={`p-1 rounded hover:bg-muted/80 transition-colors ${
    isSaved ? "text-blue-500" : "text-muted-foreground"
  }`}
  title={isSaved ? "Remove from saved" : "Save explanation"}
>
  <Icon 
    name="Bookmark" 
    size={12} 
    className={isSaved ? "text-blue-500 fill-blue-500" : ""}
  />
</button>  
              {navigator.share && (
                <button
                  onClick={() => handleShareMessage(message.text)}
                  className="p-1 bg-muted rounded hover:bg-muted/80"
                  title="Share message"
                >
                  <Icon name="Share" size={12} />
                </button>
              )}
            </div>
          )}
          
          {/* Voice message indicator */}
          {message.isVoice && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Icon name="Mic" size={12} className="mr-1" />
              <span>Voice message</span>
            </div>
          )}
          
          <div className="space-y-2">
            {/* Image display */}
            {message.images && (
              <div className="flex gap-2 mt-2">
                {message.images.map((img, index) => (
                  <div key={index} className="rounded-lg overflow-hidden max-w-xs">
                    <Image 
                      src={img} 
                      alt={`Attached ${index}`} 
                      className="w-full h-auto object-cover max-h-48"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Main content with formatted text */}
            {message.text && (
              <div 
                className={`prose prose-sm max-w-none font-sans ${
                  isUser ? 'text-white' : 'text-foreground'
                }`}
                dangerouslySetInnerHTML={{ 
                  __html: formatMessageText(message.text) 
                }}
              />
            )}
          </div>
        </div>
        
        {/* Timestamp */}
        <div className={`flex items-center mt-1 space-x-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-muted-foreground">
            {/* {formatTimestamp(message.timestamp)} */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;