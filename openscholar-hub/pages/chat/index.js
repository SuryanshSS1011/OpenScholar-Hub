// @/pages/chat/index.js
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
import { Loader } from 'lucide-react';

const ChatPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading of chat resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Layout>
      <Head>
        <title>Chat - OpenScholar Hub</title>
        <meta name="description" content="Collaborate with researchers and project members in real-time" />
      </Head>
      
      <div className="flex h-[calc(100vh-4rem)] pt-16 pb-0 overflow-hidden">
        {/* Chat Sidebar */}
        <ChatSidebar />
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading chat...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Welcome screen when no channel is selected */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to OpenScholar Chat</h2>
                <p className="text-gray-600 max-w-md mb-8">
                  Collaborate with researchers and team members in real-time. Select a channel from the sidebar or create a new one to get started.
                </p>
                <div className="space-x-4">
                  <button 
                    onClick={() => document.getElementById('create-channel-button')?.click()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create a Channel
                  </button>
                  <button 
                    onClick={() => document.getElementById('direct-message-button')?.click()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Start a Direct Message
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(ChatPage);