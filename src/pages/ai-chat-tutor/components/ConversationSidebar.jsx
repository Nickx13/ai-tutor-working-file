import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ConversationSidebar = ({ 
  isOpen, 
  onClose, 
  conversations = [], 
  savedExplanations = [], 
  onSelectConversation,
  onSelectSavedExplanation, // Add this new prop
  onDeleteConversation,
  onNewChat,
  onDeleteSavedExplanation
}) => {
  const [activeTab, setActiveTab] = useState('history');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations based on search term in title, last message, or any message content
  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Check title and last message first
    if (conv.title.toLowerCase().includes(searchLower) ||
        conv.lastMessage.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check all messages in the conversation
    if (conv.messages && conv.messages.length > 0) {
      return conv.messages.some(message => 
        message.text && message.text.toLowerCase().includes(searchLower)
      );
    }
    
    return false;
  });

  const filteredSaved = savedExplanations.filter(saved =>
    saved.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    saved.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteSavedExplanation = (explanationId, e) => {
    e.stopPropagation(); // Prevent triggering any parent click events
    if (window.confirm("Are you sure you want to delete this saved explanation?")) {
      onDeleteSavedExplanation(explanationId);
    }
  };

  const handleSelectSavedExplanation = (explanation) => {
    onSelectSavedExplanation(explanation);
    onClose(); // Close sidebar on mobile after selection
  };
  

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now - messageTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return messageTime.toLocaleDateString();
  };

  const tabs = [
    { id: 'history', label: 'History', icon: 'Clock' },
    { id: 'saved', label: 'Saved', icon: 'Bookmark' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed top-14 right-0 bottom-16 w-80 bg-card border-l border-border z-50
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:top-0 lg:bottom-0 lg:z-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Search Bar */}
        <div className="p-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Icon name="X" size={16} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-sm font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content - Fixed height with scrolling */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {activeTab === 'history' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-card-foreground">
                  Recent Conversations
                </h4>
                <span className="text-xs text-muted-foreground">
                  {filteredConversations.length} items
                </span>
              </div>
              
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="MessageCircle" size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                  {searchTerm && (
                    <p className="text-xs mt-1">No results for "{searchTerm}"</p>
                  )}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="group p-3 rounded-lg hover:bg-muted transition-colors duration-150 border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <button
                        onClick={() => onSelectConversation(conversation.id)}
                        className="flex-1 text-left min-w-0"
                      >
                        <h5 className="font-medium text-card-foreground text-sm truncate">
                          {conversation.title}
                        </h5>
                      </button>
                      <button
                        onClick={() => onDeleteConversation(conversation.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all duration-150 flex-shrink-0"
                        title="Delete conversation"
                      >
                        <Icon name="Trash2" size={14} className="text-destructive" />
                      </button>
                    </div>
                    <button
                      onClick={() => onSelectConversation(conversation.id)}
                      className="text-left w-full"
                    >
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Icon name="MessageCircle" size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {conversation.messageCount} messages
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(conversation.timestamp)}
                        </span>
                      </div>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'saved' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-card-foreground">
              Saved Explanations
            </h4>
            <span className="text-xs text-muted-foreground">
              {filteredSaved.length} items
            </span>
          </div>
          
          {filteredSaved.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Bookmark" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved explanations found</p>
              {searchTerm && (
                <p className="text-xs mt-1">No results for "{searchTerm}"</p>
              )}
            </div>
          ) : (
            filteredSaved.map((explanation) => (
              <div
                key={explanation.id}
                onClick={() => handleSelectSavedExplanation(explanation)}
                className="group p-3 rounded-lg hover:bg-muted transition-colors duration-150 border border-border cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-card-foreground text-sm flex-1 mr-2">
                    {explanation.title}
                  </h5>
                  <div className="flex items-center">
                    <Icon name="Bookmark" size={12} className="text-primary flex-shrink-0 mr-1" />
                    <button
                      onClick={(e) => handleDeleteSavedExplanation(explanation.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all duration-150 flex-shrink-0"
                      title="Delete saved explanation"
                    >
                      <Icon name="Trash2" size={14} className="text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {explanation.content}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {explanation.subject}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(explanation.savedAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

          {activeTab === 'topics' && (
            <div className="p-4 space-y-3">
              <h4 className="text-sm font-medium text-card-foreground mb-3">
                Related Topics
              </h4>
              {relatedTopics.map((topic) => (
                <button
                  key={topic.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors duration-150 border border-border"
                >
                  <h5 className="font-medium text-card-foreground text-sm mb-1">
                    {topic.title}
                  </h5>
                  <span className="text-xs text-muted-foreground">
                    {topic.subject}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ConversationSidebar;