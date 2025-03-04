// @/components/chat/ChatContainer.js
import React from 'react';

/**
 * Main wrapper component for chat interface
 * Provides the layout structure for the chat UI
 */
const ChatContainer = ({ children }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {children}
    </div>
  );
};

export default ChatContainer;