import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/store/ui';
import { cn } from '@/lib/utils';

/**
 * Toast notification system
 */
function Toaster() {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'max-w-sm w-full bg-white shadow-lg rounded-lg border p-4',
              getStyles(notification.type)
            )}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="mt-1 text-sm opacity-90">
                    {notification.message}
                  </p>
                )}
                {notification.action && (
                  <div className="mt-3">
                    <button
                      onClick={notification.action.onClick}
                      className="text-sm font-medium underline hover:no-underline"
                    >
                      {notification.action.label}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Toaster;