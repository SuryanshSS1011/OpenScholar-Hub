import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorNotificationProps {
  error: string | null;
  onDismiss: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="absolute top-16 left-0 right-0 mx-auto w-full max-w-md px-4 z-50">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
        <button 
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 transition"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;