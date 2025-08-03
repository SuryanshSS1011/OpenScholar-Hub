import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  variant = 'error',
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const variants = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      border: 'border-l-red-500'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800', 
      icon: 'text-yellow-500',
      border: 'border-l-yellow-500'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500', 
      border: 'border-l-blue-500'
    }
  };

  const variantStyles = variants[variant];

  return (
    <div 
      className={`border border-l-4 p-4 rounded-md ${variantStyles.container} ${variantStyles.border} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <AlertCircle size={20} className={`mr-3 mt-0.5 flex-shrink-0 ${variantStyles.icon}`} />
        <div className="flex-1">
          {title && (
            <h3 className="font-medium mb-1">{title}</h3>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Dismiss error message"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;