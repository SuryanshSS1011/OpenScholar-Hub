// @/components/chat/ChatSidebar.js - Improved version
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Hash, 
  Lock, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  UserPlus, 
  User, 
  Settings,
  MessageCircle,
  Search 
} from 'lucide-react';

/**
 * Sidebar component for chat navigation
 * Lists channels and direct messages
 */
const ChatSidebar = ({ activeChannelId, activeDmId }) => {
  const router = useRouter();
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isDmsOpen, setIsDmsOpen] = useState(true);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelIsPrivate, setNewChannelIsPrivate] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [createChannelError, setCreateChannelError] = useState(null);
  
  const toggleChannels = () => setIsChannelsOpen(!isChannelsOpen);
  const toggleDms = () => setIsDmsOpen(!isDmsOpen);
  
  // Mock channels for demo
  const channels = [
    { id: 'C0123', name: 'general', isPrivate: false, unreadCount: 0 },
    { id: 'C0124', name: 'research-collaboration', isPrivate: false, unreadCount: 3 },
    { id: 'C0125', name: 'project-updates', isPrivate: true, unreadCount: 0 },
    { id: 'C0126', name: 'random', isPrivate: false, unreadCount: 0 },
  ];
  
  // Mock direct messages for demo
  const directMessages = [
    { id: 'D0123', name: 'Jane Smith', status: 'active', unreadCount: 2 },
    { id: 'D0124', name: 'Robert Johnson', status: 'away', unreadCount: 0 },
    { id: 'D0125', name: 'Emma Williams', status: 'active', unreadCount: 0 },
  ];
  
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    
    if (!newChannelName.trim()) {
      setCreateChannelError("Channel name is required");
      return;
    }
    
    setIsCreatingChannel(true);
    setCreateChannelError(null);
    
    try {
      console.log('Creating channel:', {
        name: newChannelName,
        isPrivate: newChannelIsPrivate,
      });
      
      // In a real implementation, this would call your API
      // For demo, simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock channel ID
      const newChannelId = 'C' + Math.random().toString(36).substring(2, 10);
      
      // Reset form and close dialog
      setNewChannelName('');
      setNewChannelIsPrivate(false);
      setShowCreateChannel(false);
      
      // Navigate to the new channel
      router.push(`/chat/${newChannelId}`);
    } catch (error) {
      console.error('Error creating channel:', error);
      setCreateChannelError(error.message || "Failed to create channel");
    } finally {
      setIsCreatingChannel(false);
    }
  };
  
  return (
    <div className="w-60 bg-gray-800 text-white flex flex-col h-full">
      {/* Workspace Header */}
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-lg font-semibold flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          OpenScholar Chat
        </h2>
      </div>
      
      {/* Sidebar Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-3">
        {/* Channels Section */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between py-1 px-1 text-gray-300 hover:text-white cursor-pointer"
            onClick={toggleChannels}
          >
            {isChannelsOpen ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium flex-grow">Channels</span>
            <button 
              id="create-channel-button"
              className="p-1 rounded hover:bg-gray-700 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateChannel(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {isChannelsOpen && (
            <div className="mt-1 pl-4">
              {channels.map(channel => (
                <Link 
                  key={channel.id}
                  href={`/chat/${channel.id}`}
                  className={`flex items-center group py-1 px-2 rounded-md text-sm ${
                    activeChannelId === channel.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {channel.isPrivate ? (
                    <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
                  ) : (
                    <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
                  <span className="truncate">{channel.name}</span>
                  
                  {channel.unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {channel.unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              
              <button 
                className="flex items-center group py-1 px-2 rounded-md text-sm text-gray-400 hover:bg-gray-700 hover:text-white mt-1"
                onClick={() => setShowCreateChannel(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Channel</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Direct Messages Section */}
        <div>
          <div 
            className="flex items-center justify-between py-1 px-1 text-gray-300 hover:text-white cursor-pointer"
            onClick={toggleDms}
          >
            {isDmsOpen ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium flex-grow">Direct Messages</span>
            <button 
              id="direct-message-button"
              className="p-1 rounded hover:bg-gray-700 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                // Open start DM dialog
                console.log("Open start DM dialog");
              }}
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
          
          {isDmsOpen && (
            <div className="mt-1 pl-4">
              {directMessages.map(dm => (
                <Link 
                  key={dm.id}
                  href={`/chat/dm/${dm.id}`}
                  className={`flex items-center group py-1 px-2 rounded-md text-sm ${
                    activeDmId === dm.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="relative mr-2 flex-shrink-0">
                    <User className="h-4 w-4" />
                    <span className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ${
                      dm.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></span>
                  </div>
                  <span className="truncate">{dm.name}</span>
                  
                  {dm.unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {dm.unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              
              <button 
                className="flex items-center group py-1 px-2 rounded-md text-sm text-gray-400 hover:bg-gray-700 hover:text-white mt-1"
                onClick={() => {
                  // Open start DM dialog
                  console.log("Open start DM dialog");
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Teammate</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* User Section */}
      <div className="p-3 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Your Name</div>
            <div className="text-xs text-gray-300">Active</div>
          </div>
        </div>
        <button className="text-gray-300 hover:text-white">
          <Settings className="h-5 w-5" />
        </button>
      </div>
      
      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-gray-800">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create a channel</h3>
            
            <form onSubmit={handleCreateChannel}>
              <div className="mb-4">
                <label htmlFor="channel-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Channel name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="channel-name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. project-research"
                  autoComplete="off"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use lowercase letters, numbers, and hyphens. No spaces.
                </p>
                {createChannelError && (
                  <p className="mt-1 text-xs text-red-500">{createChannelError}</p>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="private-channel"
                    checked={newChannelIsPrivate}
                    onChange={() => setNewChannelIsPrivate(!newChannelIsPrivate)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="private-channel" className="ml-2 block text-sm text-gray-700">
                    Make private
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Private channels are only visible to invited members.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateChannel(false);
                    setNewChannelName('');
                    setNewChannelIsPrivate(false);
                    setCreateChannelError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCreatingChannel || !newChannelName.trim()}
                >
                  {isCreatingChannel ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;