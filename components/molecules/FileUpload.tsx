// @/components/molecules/FileUpload.tsx
import React, { useState, useRef } from 'react';
import { 
  Paperclip, 
  X, 
  File, 
  Image, 
  FileText, 
  Film, 
  Music, 
  Archive,
  Upload,
  AlertCircle
} from 'lucide-react';
import { MessageFile } from '@/types';

interface FileUploadProps {
  onFileSelect?: (files: UploadedFile[]) => void;
  onCancel?: () => void;
  maxFileSize?: number; // in MB
  maxFiles?: number;
  channelId?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  file: File;
}

/**
 * Component for uploading files to chat conversations
 */
const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onCancel, 
  maxFileSize = 100, 
  maxFiles = 10, 
  channelId 
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection via file input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      validateAndAddFiles(selectedFiles);
    }
  };
  
  // Handle file selection via drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    
    // Get files from the drop event
    const items = e.dataTransfer.items;
    const selectedFiles: File[] = [];
    
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            selectedFiles.push(file);
          }
        }
      }
    } else {
      // For browsers that don't support DataTransferItemList
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        selectedFiles.push(e.dataTransfer.files[i]);
      }
    }
    
    validateAndAddFiles(selectedFiles);
  };
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (): void => {
    setIsDragging(false);
  };
  
  // Validate files and add them to the state
  const validateAndAddFiles = (newFiles: File[]): void => {
    const newErrors: string[] = [];
    const validFiles: UploadedFile[] = [];
    let filesToProcess = newFiles;
    
    // Check if adding these files would exceed the max files limit
    if (files.length + newFiles.length > maxFiles) {
      newErrors.push(`You can only upload up to ${maxFiles} files at once.`);
      // Only add files up to the limit
      filesToProcess = newFiles.slice(0, maxFiles - files.length);
    }
    
    // Validate each file
    filesToProcess.forEach(file => {
      // Check file size (convert MB to bytes)
      if (file.size > maxFileSize * 1024 * 1024) {
        newErrors.push(`${file.name} exceeds the maximum file size of ${maxFileSize}MB.`);
      } else {
        validFiles.push({
          file,
          id: Math.random().toString(36).substring(2),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0
        });
      }
    });
    
    // Update state with new files and errors
    setFiles(prev => [...prev, ...validFiles]);
    setErrors(prev => [...prev, ...newErrors]);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove a file from the list
  const removeFile = (fileId: string): void => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  // Remove an error from the list
  const removeError = (index: number): void => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };
  
  // Get appropriate icon for file type
  const getFileIcon = (fileType: string): React.JSX.Element => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else if (fileType.startsWith('video/')) {
      return <Film className="h-6 w-6 text-purple-500" />;
    } else if (fileType.startsWith('audio/')) {
      return <Music className="h-6 w-6 text-green-500" />;
    } else if (fileType.startsWith('text/')) {
      return <FileText className="h-6 w-6 text-yellow-500" />;
    } else if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('compressed')) {
      return <Archive className="h-6 w-6 text-red-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
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
  
  // Handle file upload
  const handleUpload = async (): Promise<void> => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setErrors([]);
    
    try {
      // Update progress for each file as they upload
      const updatedFiles = [...files];
      const uploadPromises = files.map(async (fileObj, index) => {
        try {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('file', fileObj.file);
          if (channelId) {
            formData.append('channelId', channelId);
          }
          
          // Simulate upload progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            updatedFiles[index].progress = Math.min(progress, 95);
            setFiles([...updatedFiles]);
            
            if (progress >= 95) {
              clearInterval(interval);
            }
          }, 200);
          
          // In a real implementation, this would call your API
          // For demo, simulate API call with timeout
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Update progress to 100% when done
          clearInterval(interval);
          updatedFiles[index].progress = 100;
          setFiles([...updatedFiles]);
          
          return fileObj;
        } catch (error) {
          console.error(`Error uploading file ${fileObj.name}:`, error);
          setErrors(prev => [...prev, `Failed to upload ${fileObj.name}: ${error instanceof Error ? error.message : 'Unknown error'}`]);
          return null;
        }
      });
      
      // Wait for all uploads to complete
      const uploadedFiles = await Promise.all(uploadPromises);
      const successfulUploads = uploadedFiles.filter((file): file is UploadedFile => file !== null);
      
      // Call the onFileSelect callback with successfully uploaded files
      if (successfulUploads.length > 0 && onFileSelect) {
        onFileSelect(successfulUploads);
      }
      
      // If all files were successful, close the upload dialog
      if (successfulUploads.length === files.length) {
        setTimeout(() => {
          if (onCancel) onCancel();
        }, 500); // Small delay to show 100% progress
      }
    } catch (error) {
      console.error('Error in file upload:', error);
      setErrors(prev => [...prev, `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleCancelClick = (): void => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
        <button 
          onClick={handleCancelClick}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Drag and drop area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileInputClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          className="hidden"
        />
        
        <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">
          Drag files here or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Max {maxFiles} files, up to {maxFileSize}MB each
        </p>
      </div>
      
      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div 
              key={index}
              className="flex items-center p-2 bg-red-50 text-red-700 text-sm rounded"
            >
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="flex-grow">{error}</span>
              <button 
                onClick={() => removeError(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Selected files list */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map(file => (
              <div 
                key={file.id}
                className="flex items-center p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div className="mr-3 flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  
                  {/* Progress bar */}
                  {file.progress > 0 && (
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-1 bg-blue-600 rounded-full" 
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeFile(file.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancelClick}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isUploading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpload}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;