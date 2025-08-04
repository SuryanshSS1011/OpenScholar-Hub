// @/components/organisms/ArticleChatWidget.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, MessageSquare, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types';

interface ArticleChatWidgetProps {
  articleId: string;
  articleTitle?: string;
}

interface MockMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

/**
 * Component to display chat integration for a research article
 */
const ArticleChatWidget: React.FC<ArticleChatWidgetProps> = ({ articleId, articleTitle }) => {
  const { user } = useAuth();
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recentMessages, setRecentMessages] = useState<MockMessage[]>([]);
  const [participantCount, setParticipantCount] = useState<number>(0);
  
  // Fetch chat channel for this article
  useEffect(() => {
    const fetchChannelInfo = async (): Promise<void> => {
      if (!articleId) return;
      
      try {
        setIsLoading(true);
        
        // In a real implementation, this would call your API
        // For demo, simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock channel data - in reality would be fetched or created on demand
        const mockChannelId = `article-${articleId}`.substring(0, 12);
        setChannelId(mockChannelId);
        setParticipantCount(Math.floor(Math.random() * 7) + 2); // Random 2-8 participants
        
        // Mock recent messages
        setRecentMessages([
          {
            id: '1',
            user: 'Jane Smith',
            text: 'This paper has some interesting methodologies',
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            id: '2',
            user: 'Robert Johnson',
            text: 'I found the analysis in section 3 particularly insightful',
            timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
          }
        ]);
      } catch (error) {
        console.error('Error fetching channel info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannelInfo();
  }, [articleId]);
  
  // Format timestamp to readable time
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours === 1) {
      return '1 hour ago';
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleStartDiscussion = (): void => {
    // In a real implementation, this would create a new channel
    // For demo, just set a mock channel ID
    setChannelId(`article-${articleId}`.substring(0, 12));
    setParticipantCount(1);
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
          Article Discussion
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          <span>{participantCount} participants</span>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : channelId ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Join the conversation about this research paper with other scholars.
              </p>
            </div>
            
            {/* Recent messages preview */}
            {recentMessages.length > 0 && (
              <div className="mb-4 border border-gray-200 rounded-md divide-y divide-gray-200">
                {recentMessages.map(message => (
                  <div key={message.id} className="p-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{message.user}</span>
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{message.text}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Action buttons */}
            <Link 
              href={`/chat/${channelId}`}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Join Discussion
            </Link>
          </>
        ) : (
          <div className="text-center py-6">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No discussion yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to start a conversation about this paper.
            </p>
            <div className="mt-6">
              <button
                onClick={handleStartDiscussion}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Discussion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleChatWidget;