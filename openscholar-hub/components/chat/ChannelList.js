// @/components/chat/ChannelList.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Hash, Lock, ChevronDown, ChevronRight, Plus, Search } from 'lucide-react';

/**
 * Component to display a list of channels in the chat sidebar
 */
const ChannelList = ({ activeChannelId }) => {
  const router = useRouter();
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Fetch channels from API
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch from your API
        const response = await fetch('/api/slack/channels');
        
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        
        const data = await response.json();
        setChannels(data);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannels();
  }, []);
  
  // Toggle expand/collapse
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Filter channels based on search input
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div className="mb-4">
      <div 
        className="flex items-center justify-between py-1 px-1 text-gray-300 hover:text-white cursor-pointer"
        onClick={toggleExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-1" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-1" />
        )}
        <span className="text-sm font-medium flex-grow">Channels</span>
        <button 
          className="p-1 rounded hover:bg-gray-700 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            // Open create channel modal
            console.log("Open create channel modal");
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-1 pl-4 space-y-1">
          {/* Search filter */}
          {channels.length > 5 && (
            <div className="relative px-1 py-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="h-3 w-3 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full py-1 pl-7 pr-2 text-xs bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-300"
                placeholder="Find channels"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          )}
          
          {isLoading ? (
            <div className="animate-pulse space-y-2 px-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-5 bg-gray-700 rounded w-full"></div>
              ))}
            </div>
          ) : error ? (
            <div className="px-2 py-1 text-red-400 text-xs">
              {error}
              <button 
                className="block mt-1 text-blue-400 hover:text-blue-300"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="px-2 py-1 text-gray-500 text-xs">
              {filter ? 'No matching channels' : 'No channels found'}
            </div>
          ) : (
            <>
              {filteredChannels.map(channel => (
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
                onClick={() => {
                  // Open create channel modal
                  console.log("Open create channel modal");
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Channel</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChannelList;