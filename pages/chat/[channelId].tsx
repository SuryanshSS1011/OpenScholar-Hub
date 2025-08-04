// @/pages/chat/[channelId].tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/page-templates/Layout';
import ChatContainer from '@/components/organisms/ChatContainer';
import ChatSidebar from '@/components/organisms/ChatSidebar';
import ChatHeader from '@/components/molecules/ChatHeader';
import MessageList from '@/components/organisms/MessageList';
import MessageInput from '@/components/molecules/MessageInput';
import { useAuth } from '@/context/AuthContext';
import { Loader, AlertCircle } from 'lucide-react';
import type { Channel } from '@/types';

const ChannelChatPage: NextPage = () => {
  const router = useRouter();
  const channelId = Array.isArray(router.query.channelId) 
    ? router.query.channelId[0] 
    : router.query.channelId;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch channel information
  useEffect(() => {
    const fetchChannelInfo = async () => {
      if (!channelId) return;
      
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch from your API
        // For demo, simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock channel data
        setChannel({
          id: channelId,
          name: `channel-${channelId}`,
          topic: 'Research collaboration channel',
          memberCount: 5,
          isPrivate: false,
          isArchived: false,
          createdAt: new Date().toISOString()
        });
        
      } catch (err) {
        console.error('Error fetching channel:', err);
        setError('Failed to load channel information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (channelId) {
      fetchChannelInfo();
    }
  }, [channelId]);

  const handleBackToChat = () => {
    router.push('/chat');
  };
  
  return (
    <Layout>
      <Head>
        <title>{channel ? `#${channel.name} - Chat` : 'Channel - Chat'} - OpenScholar Hub</title>
        <meta name="description" content="Collaborate with researchers and project members in real-time" />
      </Head>
      
      <div className="flex h-[calc(100vh-4rem)] pt-16 pb-0 overflow-hidden">
        {/* Chat Sidebar */}
        <ChatSidebar activeChannelId={channelId} />
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading channel...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={handleBackToChat}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Back to Chat
                </button>
              </div>
            </div>
          ) : channel ? (
            <ChatContainer>
              <ChatHeader
                title={`#${channel.name}`}
                description={channel.topic || 'No topic set'}
                memberCount={channel.memberCount}
                isPrivate={channel.isPrivate}
              />
              
              <MessageList channelId={channelId} />
              
              <MessageInput channelId={channelId} />
            </ChatContainer>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500">Channel not found</p>
                <button
                  onClick={handleBackToChat}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Back to Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(ChannelChatPage);
