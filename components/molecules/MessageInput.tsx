// @/components/molecules/MessageInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Code, 
  Link as LinkIcon,
  Smile,
  X,
  AlertCircle,
  Image,
  Upload
} from 'lucide-react';
import { Message } from '@/types';

interface MessageInputProps {
  channelId?: string;
  dmId?: string;
  threadTs?: string;
  onSend?: (message: Message) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

type FormatType = 'bold' | 'italic' | 'code' | 'link' | 'list' | 'ordered-list';

/**
 * Component for sending new messages in a conversation
 */
const MessageInput: React.FC<MessageInputProps> = ({ channelId, dmId, threadTs, onSend }) => {
  const [message, setMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Function to handle message submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!message.trim() && uploadedFiles.length === 0) return;
    
    // Use the conversation ID based on whether it's a channel or DM
    const conversationId = channelId || dmId;
    
    if (!conversationId) return;
    
    console.log('Sending message to', conversationId, {
      text: message,
      threadTs,
      files: uploadedFiles,
    });
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Create form data for multipart/form-data request (for file uploads)
      const formData = new FormData();
      formData.append('channelId', conversationId);
      
      if (message.trim()) {
        formData.append('text', message);
      }
      
      if (threadTs) {
        formData.append('threadTs', threadTs);
      }
      
      // Add files if any
      uploadedFiles.forEach((fileObj, index) => {
        formData.append(`file${index}`, fileObj.file);
      });
      
      // Send the message
      const response = await fetch('/api/slack/messages', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send message: ${response.status}`);
      }
      
      const sentMessage: Message = await response.json();
      
      // Clear input and files after sending
      setMessage('');
      setUploadedFiles([]);
      
      // Call onSend callback if provided
      if (onSend) {
        onSend(sentMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Function to handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Check file size limits (10MB per file in this example)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_FILES = 10;
    
    // Check if adding these files would exceed the max files limit
    if (uploadedFiles.length + files.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files at once.`);
      return;
    }
    
    // Add valid files to state
    const newFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" exceeds the maximum size of 10MB.`);
        return false;
      }
      return true;
    }).map(file => ({
      id: Math.random().toString(36).substring(2),
      name: file.name,
      size: file.size,
      type: file.type,
      file, // Store the actual file object for uploading
    }));
    
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Function to remove an uploaded file
  const removeFile = (fileId: string): void => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  // Function to add an emoji to the message
  const addEmoji = (emoji: string): void => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };
  
  // Function to apply formatting to selected text
  const applyFormatting = (formatType: FormatType): void => {
    const input = messageInputRef.current;
    if (!input) return;
    
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
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
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Get file icon based on type
  const getFileIcon = (fileType: string): React.JSX.Element => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else {
      return <Paperclip className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Submit on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as any;
      handleSubmit(formEvent);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value);
  };

  const handleEmojiPickerToggle = (): void => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleFileInputClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleErrorClose = (): void => {
    setError(null);
  };
  
  // Focus input on mount
  useEffect(() => {
    messageInputRef.current?.focus();
  }, []);
  
  return (
    <div className="border-t border-gray-200 px-4 py-3 bg-white">
      {/* Error display */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="flex-grow">{error}</span>
          <button 
            onClick={handleErrorClose}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Uploaded files preview */}
      {uploadedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {uploadedFiles.map(file => (
            <div 
              key={file.id}
              className="flex items-center bg-gray-100 rounded-full pl-3 pr-1 py-1"
            >
              {getFileIcon(file.type)}
              <span className="ml-1 text-xs text-gray-800 truncate max-w-[150px]">
                {file.name} ({formatFileSize(file.size)})
              </span>
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
            <LinkIcon className="h-4 w-4" />
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
            onChange={handleMessageChange}
            placeholder="Type a message..."
            className="flex-grow min-h-[44px] py-2 px-3 outline-none resize-none"
            rows={1}
            onKeyDown={handleKeyDown}
          />
          
          <div className="flex items-center pr-2">
            {/* Emoji button */}
            <div className="relative">
              <button
                type="button"
                onClick={handleEmojiPickerToggle}
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
                onClick={handleFileInputClick}
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
              disabled={(!message.trim() && uploadedFiles.length === 0) || isUploading}
              title="Send message"
            >
              {isUploading ? (
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
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