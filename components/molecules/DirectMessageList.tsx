// @/components/molecules/DirectMessageList.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { User, UserPlus, ChevronDown, ChevronRight, Plus, Search } from 'lucide-react';
import { DirectMessage } from '@/types';

interface DirectMessageListProps {
  activeDmId?: string;
}

interface DirectMessageWithStatus extends DirectMessage {
  status?: 'active' | 'away' | 'offline';
  avatar?: string;
}

/**
 * Component to display a list of direct messages in the chat sidebar
 */
const DirectMessageList: React.FC<DirectMessageListProps> = ({ activeDmId }) => {
  const router = useRouter();
  const [directMessages, setDirectMessages] = useState<DirectMessageWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showNewDmModal, setShowNewDmModal] = useState<boolean>(false);
  
  // Fetch direct messages from API
  useEffect(() => {
    const fetchDirectMessages = async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch from your API
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockDms: DirectMessageWithStatus[] = [
          { 
            id: 'D0123', 
            userId: 'U123',
            name: 'Jane Smith', 
            status: 'active', 
            avatar: undefined, 
            unreadCount: 2 
          },
          { 
            id: 'D0124', 
            userId: 'U124',
            name: 'Robert Johnson', 
            status: 'away', 
            avatar: undefined, 
            unreadCount: 0 
          },
          { 
            id: 'D0125', 
            userId: 'U125',
            name: 'Emma Williams', 
            status: 'active', 
            avatar: undefined, 
            unreadCount: 0 
          },
        ];
        
        setDirectMessages(mockDms);
      } catch (err) {
        console.error('Error fetching direct messages:', err);
        setError('Failed to load direct messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDirectMessages();
  }, []);
  
  // Toggle expand/collapse
  const toggleExpanded = (): void => {
    setIsExpanded(!isExpanded);
  };
  
  // Handle starting a new DM
  const handleStartNewDm = (): void => {
    setShowNewDmModal(true);
  };

  const handleNewDmCreate = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    handleStartNewDm();
  };

  const handleModalClose = (): void => {
    setShowNewDmModal(false);
  };

  const handleModalStartMessage = (): void => {
    // Start new DM and close modal
    // This would call your API in a real implementation
    setShowNewDmModal(false);
    router.push('/chat/dm/new-dm');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilter(e.target.value);
  };
  
  // Filter DMs based on search input
  const filteredDms = directMessages.filter(dm => 
    dm.name.toLowerCase().includes(filter.toLowerCase())
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
        <span className="text-sm font-medium flex-grow">Direct Messages</span>
        <button 
          className="p-1 rounded hover:bg-gray-700 focus:outline-none"
          onClick={handleNewDmCreate}
        >
          <UserPlus className="h-4 w-4" />
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-1 pl-4 space-y-1">
          {/* Search filter for larger lists */}
          {directMessages.length > 5 && (
            <div className="relative px-1 py-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="h-3 w-3 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full py-1 pl-7 pr-2 text-xs bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-300"
                placeholder="Find people"
                value={filter}
                onChange={handleFilterChange}
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
          ) : filteredDms.length === 0 ? (
            <div className="px-2 py-1 text-gray-500 text-xs">
              {filter ? 'No matching direct messages' : 'No direct messages found'}
            </div>
          ) : (
            <>
              {filteredDms.map(dm => (
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
                    {dm.avatar ? (
                      <div className="w-4 h-4 rounded-full overflow-hidden">
                        <Image
                          src={dm.avatar}
                          alt={dm.name}
                          width={16}
                          height={16}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ${
                      dm.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></span>
                  </div>
                  <span className="truncate">{dm.name}</span>
                  
                  {dm.unreadCount && dm.unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {dm.unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              
              <button 
                className="flex items-center group py-1 px-2 rounded-md text-sm text-gray-400 hover:bg-gray-700 hover:text-white mt-1"
                onClick={handleStartNewDm}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Teammate</span>
              </button>
            </>
          )}
        </div>
      )}
      
      {/* New DM Modal */}
      {showNewDmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Start a direct message</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select teammates
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by name"
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {/* Mock user list */}
              {['Alice Cooper', 'Bob Miller', 'Carol Smith', 'David Jones', 'Eve Johnson'].map((name, idx) => (
                <div key={idx} className="flex items-center py-2 px-2 hover:bg-gray-100 rounded-md">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{name}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleModalStartMessage}
              >
                Start Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMessageList;