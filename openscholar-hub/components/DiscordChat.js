// @/components/DiscordChat.js
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Send, Loader, RefreshCw, User, Link as LinkIcon, Paperclip, Info } from 'lucide-react';

const DiscordChat = ({ projectId, projectTitle }) => {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const refreshInterval = useRef(null);

  // Fetch available channels for this project
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/discord/channels?projectId=${projectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch Discord channels');
        }
        
        const data = await response.json();
        setChannels(data.channels);
        
        // Select first channel by default
        if (data.channels.length > 0 && !selectedChannel) {
          setSelectedChannel(data.channels[0].id);
        }
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Could not load chat channels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChannels();
  }, [projectId, selectedChannel]);

  // Fetch messages when channel is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChannel) return;
      
      try {
        setRefreshing(true);
        const response = await fetch(`/api/discord/messages?channelId=${selectedChannel}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data.messages.reverse()); // Show newest at the bottom
      } catch (err) {
        console.error('Error fetching messages:', err);
        if (!messages.length) {
          setError('Could not load messages. Please try again later.');
        }
      } finally {
        setRefreshing(false);
      }
    };
    
    fetchMessages();
    
    // Set up polling for new messages every 10 seconds
    refreshInterval.current = setInterval(fetchMessages, 10000);
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [selectedChannel, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRefresh = async () => {
    if (!selectedChannel) return;
    
    try {
      setRefreshing(true);
      const response = await fetch(`/api/discord/messages?channelId=${selectedChannel}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.messages.reverse());
    } catch (err) {
      console.error('Error refreshing messages:', err);
      setError('Could not refresh messages. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChannel) return;
    
    try {
      const response = await fetch('/api/discord/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: selectedChannel,
          content: newMessage,
          userName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous User'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Clear input field
      setNewMessage('');
      
      // Refresh messages
      handleRefresh();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatChannelName = (name) => {
    // Remove project ID prefix (e.g., "project-123-general" to "general")
    const match = name.match(new RegExp(`project-${projectId}-(.*)`));
    return match ? match[1].replace(/-/g, ' ') : name;
  };

  if (loading && channels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
        <Loader className="animate-spin h-6 w-6 text-blue-500 mr-2" />
        <span className="text-gray-600">Loading chat...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Project Discussion</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          title="Refresh messages"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Channel Sidebar */}
        <div className="w-1/4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="px-3 py-2 text-sm font-medium text-gray-500">Channels</div>
          <div className="space-y-1 px-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  selectedChannel === channel.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                # {formatChannelName(channel.name)}
              </button>
            ))}
          </div>
          <div className="px-3 py-2 mt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 flex items-start mb-2">
              <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
              <span>Messages are synchronized with Discord in real-time</span>
            </div>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
                {error}
                <button
                  onClick={handleRefresh}
                  className="ml-2 text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {loading ? (
                  <div className="flex justify-center items-center">
                    <Loader className="animate-spin h-5 w-5 text-gray-400 mr-2" />
                    <span>Loading messages...</span>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex">
                  <div 
                    className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mr-3"
                    style={{ backgroundImage: message.author.avatar ? `url(${message.author.avatar})` : 'none' }}
                  >
                    {!message.author.avatar && (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                        {message.author.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline">
                      <span className="font-medium text-gray-900">{message.author.username}</span>
                      <span className="ml-2 text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{message.content}</div>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="border border-gray-200 rounded p-2 bg-gray-50">
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center"
                            >
                              <Paperclip className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{attachment.name}</span>
                              <span className="ml-1 text-xs text-gray-500">
                                ({(attachment.size / 1024).toFixed(1)} KB)
                              </span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-l-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>Posting as: {user?.displayName || user?.email?.split('@')[0] || 'Anonymous User'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordChat;