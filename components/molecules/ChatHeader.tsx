// @/components/molecules/ChatHeader.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Users, 
  Lock, 
  Hash, 
  Info, 
  Settings, 
  UserPlus, 
  Bell,
  BellOff,
  Search,
  MoreHorizontal,
  X
} from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  description?: string;
  memberCount?: number;
  isPrivate?: boolean;
  isDM?: boolean;
  userStatus?: 'active' | 'away' | 'offline' | null;
}

/**
 * Header component for chat conversations
 * Displays channel/DM info and provides actions
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  title, 
  description, 
  memberCount, 
  isPrivate = false, 
  isDM = false,
  userStatus = null
}) => {
  const router = useRouter();
  const [isInfoExpanded, setIsInfoExpanded] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const toggleMute = (): void => {
    setIsMuted(!isMuted);
    // In a real implementation, this would call an API to mute/unmute
  };

  const handleSearchToggle = (): void => {
    setShowSearch(!showSearch);
  };

  const handleSearchClose = (): void => {
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleInfoToggle = (): void => {
    setIsInfoExpanded(!isInfoExpanded);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="flex flex-col border-b border-gray-200">
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          {/* Channel/DM icon */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 mr-2">
            {isDM ? (
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  {userStatus && (
                    <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                      userStatus === 'active' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              </div>
            ) : (
              isPrivate ? <Lock size={16} /> : <Hash size={18} />
            )}
          </div>
          
          {/* Channel/DM name */}
          <div>
            <h2 className="text-base font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">
              {title}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Toggle search */}
          <button 
            onClick={handleSearchToggle}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Search size={18} />
          </button>
          
          {/* Toggle mute */}
          <button 
            onClick={toggleMute}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
          </button>
          
          {/* Members count */}
          {!isDM && memberCount !== undefined && (
            <button className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none">
              <Users size={18} />
              <span className="ml-1 text-xs">{memberCount}</span>
            </button>
          )}
          
          {/* Add people */}
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            title="Add people"
          >
            <UserPlus size={18} />
          </button>
          
          {/* Channel/DM info toggle */}
          <button 
            onClick={handleInfoToggle}
            className={`text-gray-500 hover:text-gray-700 focus:outline-none ${isInfoExpanded ? 'text-blue-600' : ''}`}
            title="Info"
          >
            <Info size={18} />
          </button>
          
          {/* More actions */}
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            title="More actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-gray-50 flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search in conversation"
            className="flex-grow px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            onClick={handleSearchClose}
            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
      )}
      
      {/* Expanded info section */}
      {isInfoExpanded && (
        <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 flex items-center">
          <div className="flex-grow">
            <p>{description || 'No description set'}</p>
          </div>
          <button className="ml-2 text-blue-600 hover:text-blue-800 text-xs">Edit</button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;