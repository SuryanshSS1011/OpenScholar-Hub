// @/components/organisms/ChatContainer.tsx
import React from 'react';

interface ChatContainerProps {
  children: React.ReactNode;
}

/**
 * Main wrapper component for chat interface
 * Provides the layout structure for the chat UI
 */
const ChatContainer: React.FC<ChatContainerProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {children}
    </div>
  );
};

export default ChatContainer;