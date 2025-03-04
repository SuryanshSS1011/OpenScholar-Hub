// @/components/chat/MessageInput.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Code, 
  Link,
  Smile,
  X
} from 'lucide-react';

/**
 * Component for sending new messages in a conversation
 */
const MessageInput = ({ channelId, dmId, threadTs, onSend }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  
  // Function to handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim() && uploadedFiles.length === 0) return;
    
    // Use the conversation ID based on whether it's a channel or DM
    const conversationId = channelId || dmId;
    
    // In a real implementation, this would call your API
    console.log('Sending message to', conversationId, {
      text: message,
      threadTs,
      files: uploadedFiles,
    });
    
    // Clear input and files after sending
    setMessage('');
    setUploadedFiles([]);
    
    // Call onSend callback if provided
    if (onSend) {
      onSend({
        text: message,
        files: uploadedFiles,
      });
    }
  };
  
  // Function to handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // In a real implementation, you would upload these files
    // For demo, just store the file info
    setIsUploading(true);
    
    // Simulate file upload delay
    setTimeout(() => {
      const newFiles = files.map(file => ({
        id: Math.random().toString(36).substring(2),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        url: URL.createObjectURL(file),
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 1500);
  };
  
  // Function to remove an uploaded file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  // Function to add an emoji to the message
  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };
  
  // Function to apply formatting to selected text
  const applyFormatting = (formatType) => {
    const input = messageInputRef.current;
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let formattedText = '';
    let cursorPosition = 0;
    
    switch (formatType) {
      case 'bold':
        formattedText = `*${selectedText}*`;
        cursorPosition = end + 2;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        cursorPosition = end + 2;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        cursorPosition = end + 2;
        break;
      case 'link':
        formattedText = `<${selectedText}|${selectedText}>`;
        cursorPosition = end + 4 + selectedText.length;
        break;
      case 'list':
        formattedText = `\n• ${selectedText}`;
        cursorPosition = end + 3;
        break;
      case 'ordered-list':
        formattedText = `\n1. ${selectedText}`;
        cursorPosition = end + 4;
        break;
      default:
        return;
    }
    
    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);
    
    // Set cursor position after update
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };
  
  // Focus input on mount
  useEffect(() => {
    messageInputRef.current?.focus();
  }, []);
  
  return (
    <div className="border-t border-gray-200 px-4 py-3 bg-white">
      {/* Uploaded files preview */}
      {uploadedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {uploadedFiles.map(file => (
            <div 
              key={file.id}
              className="flex items-center bg-gray-100 rounded-full pl-3 pr-1 py-1"
            >
              <span className="text-xs text-gray-800 truncate max-w-[150px]">{file.name}</span>
              <button 
                onClick={() => removeFile(file.id)}
                className="ml-1 p-1 text-gray-500 hover:text-gray-700 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Message form */}
      <form onSubmit={handleSubmit} className="relative">
        {/* Formatting tools */}
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-sm p-1 flex space-x-1">
          <button 
            type="button"
            onClick={() => applyFormatting('bold')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button 
            type="button"
            onClick={() => applyFormatting('italic')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button 
            type="button"
            onClick={() => applyFormatting('code')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Code"
          >
            <Code className="h-4 w-4" />
          </button>
          <button 
            type="button"
            onClick={() => applyFormatting('link')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Link"
          >
            <Link className="h-4 w-4" />
          </button>
          <button 
            type="button"
            onClick={() => applyFormatting('list')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button 
            type="button"
            onClick={() => applyFormatting('ordered-list')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <textarea
            ref={messageInputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow min-h-[44px] py-2 px-3 outline-none resize-none"
            rows={1}
            onKeyDown={(e) => {
              // Submit on Enter (without shift)
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <div className="flex items-center pr-2">
            {/* Emoji button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
              
              {/* Emoji picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-1 p-2 bg-white shadow-lg rounded-lg border border-gray-200 grid grid-cols-8 gap-1 z-10">
                  {['😊', '👍', '❤️', '🎉', '🔥', '👀', '😂', '🤔', 
                    '👏', '✅', '⭐', '📌', '🏆', '📢', '💯', '🙏'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* File attachment button */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Attach file"
                disabled={isUploading}
              >
                <Paperclip className={`h-5 w-5 ${isUploading ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            
            {/* Send button */}
            <button
              type="submit"
              className={`p-2 ${
                message.trim() || uploadedFiles.length > 0
                  ? 'text-blue-600 hover:text-blue-800'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              disabled={!message.trim() && uploadedFiles.length === 0}
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
      
      {/* Thread context if replying in a thread */}
      {threadTs && (
        <div className="mt-1 text-xs text-gray-500">
          Replying in thread
        </div>
      )}
    </div>
  );
};

export default MessageInput;