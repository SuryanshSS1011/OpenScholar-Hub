// @/components/chat/Message.js
import React, { useState } from 'react';
import Image from 'next/image';
import { 
  User, 
  MoreHorizontal, 
  MessageSquare, 
  Copy, 
  Edit, 
  Trash2, 
  Smile,
  Paperclip,
  FileText,
  Download
} from 'lucide-react';

/**
 * Component for rendering an individual message
 */
const Message = ({ 
  message, 
  showAvatar = true, 
  isLastInGroup = true,
  isThreadReply = false 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format timestamp to include date if message is from a different day
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if same day
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise return formatted date
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
  };
  
  // Handle adding reaction to a message
  const handleAddReaction = (emoji) => {
    console.log(`Add reaction ${emoji} to message ${message.id}`);
    // In a real implementation, this would call your API
    setShowEmojiPicker(false);
  };
  
  // Determine if we should show the date
  // In a real implementation, this would compare with previous message
  const showDate = Math.random() > 0.7; // For demo, randomly show date separators
  
  return (
    <div>
      {/* Date separator - would normally be conditionally shown based on actual timestamps */}
      {showDate && (
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <div className="mx-4 text-xs text-gray-500">
            {formatDate(message.timestamp)}
          </div>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
      )}
      
      <div 
        className={`flex group ${isThreadReply ? 'pl-10' : ''}`}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        {/* Avatar column */}
        <div className="flex-shrink-0 mr-3 mt-1 w-10 h-10">
          {showAvatar ? (
            message.user.avatar ? (
              <div className="w-9 h-9 rounded-full overflow-hidden">
                <Image 
                  src={message.user.avatar} 
                  alt={message.user.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )
          ) : (
            <div className="w-9"></div> // Empty placeholder when not showing avatar
          )}
        </div>
        
        {/* Message content */}
        <div className={`flex-1 ${!isLastInGroup ? 'pb-1' : 'pb-2'}`}>
          {/* Header with user info and timestamp */}
          {showAvatar && (
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-900 mr-2">{message.user.name}</span>
              <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
            </div>
          )}
          
          {/* Message body */}
          <div className="relative">
            <div className="text-gray-800 whitespace-pre-wrap break-words">
              {message.text}
            </div>
            
            {/* Files/attachments */}
            {message.files && message.files.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.files.map((file, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center p-2 border border-gray-200 rounded bg-gray-50"
                  >
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                    <button className="p-1 text-gray-500 hover:text-gray-700">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {message.reactions.map((reaction, idx) => (
                  <button 
                    key={idx}
                    className="inline-flex items-center text-xs bg-gray-100 hover:bg-gray-200 rounded px-1.5 py-0.5"
                  >
                    <span className="mr-1">{reaction.name === 'thumbsup' ? '👍' : '✅'}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Message actions that appear on hover */}
            {showOptions && (
              <div className="absolute top-0 right-0 flex items-center bg-white shadow-sm border border-gray-200 rounded-lg">
                {/* Reply button */}
                <button 
                  className="p-1.5 text-gray-500 hover:text-gray-700"
                  title="Reply in thread"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                
                {/* React button */}
                <div className="relative">
                  <button 
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                    title="Add reaction"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  
                  {/* Emoji picker dropdown */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-1 p-2 bg-white shadow-lg rounded-lg border border-gray-200 flex space-x-2 z-10">
                      {['👍', '❤️', '😂', '🎉', '👀', '✅'].map(emoji => (
                        <button
                          key={emoji}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                          onClick={() => handleAddReaction(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* More options button */}
                <div className="relative group">
                  <button 
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                    title="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  
                  {/* Dropdown menu for more actions */}
                  <div className="absolute hidden group-hover:block right-0 bottom-full mb-1 bg-white shadow-lg rounded-lg border border-gray-200 z-10 w-40">
                    <div className="py-1">
                      <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy text
                      </button>
                      <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit message
                      </button>
                      <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;