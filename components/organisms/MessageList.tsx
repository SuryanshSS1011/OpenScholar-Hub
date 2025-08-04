// @/components/organisms/MessageList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';
import Message from '@/components/molecules/Message';
import { Message as MessageType, Reaction, MessageFile } from '@/types';

interface MessageListProps {
  channelId?: string;
  dmId?: string;
}

interface MessageUser {
  id: string;
  name: string;
  avatar?: string;
}

interface ExtendedMessage extends Omit<MessageType, 'user'> {
  user: MessageUser;
}

/**
 * Component to display the list of messages in a conversation
 */
const MessageList: React.FC<MessageListProps> = ({ channelId, dmId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to bottom
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Fetch messages for the specified channel or DM
  useEffect(() => {
    const fetchMessages = async (): Promise<void> => {
      const conversationId = channelId || dmId;
      
      if (!conversationId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real implementation, this would call your API
        // For demo, simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock messages data
        const mockMessages: ExtendedMessage[] = [
          {
            id: '1',
            text: 'Hello team! I just uploaded the latest research findings.',
            user: {
              id: 'U001',
              name: 'Jane Smith',
              avatar: '/avatars/jane.jpg'
            },
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            reactions: [
              { name: 'thumbsup', count: 3, users: ['U002', 'U003', 'U004'] }
            ],
            files: [],
            isBot: false
          },
          {
            id: '2',
            text: 'Thanks for sharing! I\'ll take a look at it right away.',
            user: {
              id: 'U002',
              name: 'Robert Johnson',
              avatar: '/avatars/robert.jpg'
            },
            timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
            reactions: [],
            files: [],
            isBot: false
          },
          {
            id: '3',
            text: 'I have some questions about the methodology. Can we schedule a quick call?',
            user: {
              id: 'U003',
              name: 'Emma Williams',
              avatar: '/avatars/emma.jpg'
            },
            timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            reactions: [],
            files: [],
            isBot: false
          },
          {
            id: '4',
            text: 'Sure, how about tomorrow at 10am?',
            user: {
              id: 'U001',
              name: 'Jane Smith',
              avatar: '/avatars/jane.jpg'
            },
            timestamp: new Date(Date.now() - 1500000).toISOString(), // 25 minutes ago
            reactions: [
              { name: 'white_check_mark', count: 2, users: ['U002', 'U003'] }
            ],
            files: [],
            isBot: false
          },
          {
            id: '5',
            text: 'That works for me!',
            user: {
              id: 'U003',
              name: 'Emma Williams',
              avatar: '/avatars/emma.jpg'
            },
            timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
            reactions: [],
            files: [],
            isBot: false
          }
        ];
        
        setMessages(mockMessages);
        setHasMore(false); // For demo, no more messages to load
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [channelId, dmId]);
  
  // Scroll to bottom when messages are loaded
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom();
    }
  }, [isLoading, messages.length]);
  
  // Function to load more messages (pagination)
  const loadMoreMessages = async (): Promise<void> => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      // In a real implementation, this would call your API with pagination
      // For demo, simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock older messages
      const olderMessages: ExtendedMessage[] = [
        // Add mock older messages here
      ];
      
      setMessages(prev => [...olderMessages, ...prev]);
      
      // For demo, no more messages after loading once
      setHasMore(false);
    } catch (err) {
      console.error('Error loading more messages:', err);
      // Show error toast or notification
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Handle scroll to implement infinite scrolling for older messages
  const handleScroll = (): void => {
    if (!containerRef.current) return;
    
    // If scrolled near the top and we have more messages, load them
    if (
      containerRef.current.scrollTop < 100 && 
      hasMore && 
      !loadingMore && 
      !isLoading
    ) {
      loadMoreMessages();
    }
  };

  const handleRetry = (): void => {
    window.location.reload();
  };
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
    >
      {/* Loading indicator at top when loading more messages */}
      {loadingMore && (
        <div className="flex justify-center py-2">
          <Loader className="h-5 w-5 text-gray-400 animate-spin" />
        </div>
      )}
      
      {/* Main loading state */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center h-full">
          <Loader className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button 
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Message list */}
          {messages.map((message, index) => (
            <Message 
              key={message.id} 
              message={message}
              showAvatar={index === 0 || messages[index - 1].user.id !== message.user.id}
              isLastInGroup={
                index === messages.length - 1 || 
                messages[index + 1].user.id !== message.user.id
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;