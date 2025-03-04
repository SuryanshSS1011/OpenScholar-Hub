// @/pages/chat/dm/[userId].js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/Layout';
import ChatContainer from '@/components/chat/ChatContainer';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useAuth } from '@/context/AuthContext';
import { Loader, AlertCircle } from 'lucide-react';

const DirectMessageChatPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dmInfo, setDmInfo] = useState(null);
  const [error, setError] = useState(null);
  
  // Fetch DM information
  useEffect(() => {
    const fetchDmInfo = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch from your API
        // For demo, simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock DM data
        setDmInfo({
          id: userId,
          name: 'Jane Smith',
          status: 'active',
          avatar: null,
          email: 'jane.smith@example.com'
        });
        
      } catch (err) {
        console.error('Error fetching DM information:', err);
        setError('Failed to load direct message information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDmInfo();
  }, [userId]);
  
  return (
    <Layout>
      <Head>
        <title>{dmInfo ? `Chat with ${dmInfo.name}` : 'Direct Message'} - OpenScholar Hub</title>
        <meta name="description" content="Direct message with a collaborator on OpenScholar Hub" />
      </Head>
      
      <div className="flex h-[calc(100vh-4rem)] pt-16 pb-0 overflow-hidden">
        {/* Chat Sidebar */}
        <ChatSidebar activeDmId={userId} />
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading conversation...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => router.push('/chat')}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Back to Chat
                </button>
              </div>
            </div>
          ) : dmInfo ? (
            <ChatContainer>
              <ChatHeader
                title={dmInfo.name}
                userStatus={dmInfo.status}
                isDM={true}
              />
              
              <MessageList dmId={userId} />
              
              <MessageInput dmId={userId} />
            </ChatContainer>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500">User not found</p>
                <button
                  onClick={() => router.push('/chat')}
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

export default withAuth(DirectMessageChatPage);