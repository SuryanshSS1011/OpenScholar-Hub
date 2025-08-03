// @/utils/slackEvents.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Socket.io client instance
let socket;

/**
 * Initialize the Socket.io connection for real-time Slack events
 * @returns {object} The Socket.io client instance
 */
export const initializeSocket = () => {
  if (typeof window === 'undefined') {
    return null; // Don't initialize on server-side
  }
  
  if (!socket) {
    // Connect to the Socket.io server
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
      path: '/api/socketio',
    });
    
    // Log connection status
    socket.on('connect', () => {
      console.log('Socket.io connected');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });
    
    socket.on('error', (error) => {
      console.error('Socket.io error:', error);
    });
  }
  
  return socket;
};

/**
 * React hook to subscribe to Slack events
 * @param {string} eventType - The type of Slack event to listen for
 * @param {function} callback - Callback function to handle the event
 * @param {array} dependencies - Dependencies array for the useEffect hook
 */
export const useSlackEvent = (eventType, callback, dependencies = []) => {
  useEffect(() => {
    // Initialize socket if not already done
    const socketClient = initializeSocket();
    
    if (!socketClient) {
      console.warn('Socket.io not initialized');
      return;
    }
    
    // Create event handler
    const handleEvent = (data) => {
      if (data.type === eventType) {
        callback(data);
      }
    };
    
    // Subscribe to the slack_event
    socketClient.on('slack_event', handleEvent);
    
    // Cleanup
    return () => {
      socketClient.off('slack_event', handleEvent);
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};

/**
 * React hook to subscribe to channel-specific Slack events
 * @param {string} channelId - The channel ID to subscribe to
 * @param {function} callback - Callback function to handle the event
 * @param {array} dependencies - Dependencies array for the useEffect hook
 */
export const useChannelEvents = (channelId, callback, dependencies = []) => {
  useEffect(() => {
    if (!channelId) return;
    
    // Initialize socket if not already done
    const socketClient = initializeSocket();
    
    if (!socketClient) {
      console.warn('Socket.io not initialized');
      return;
    }
    
    // Join the channel room
    socketClient.emit('join_channel', channelId);
    
    // Create event handler
    const handleEvent = (data) => {
      if (data.channel === channelId) {
        callback(data);
      }
    };
    
    // Subscribe to the slack_event
    socketClient.on('slack_event', handleEvent);
    
    // Cleanup
    return () => {
      socketClient.off('slack_event', handleEvent);
      socketClient.emit('leave_channel', channelId);
    };
  }, [channelId, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
};

/**
 * React hook to track online status of users
 * @param {array} userIds - Array of user IDs to track
 * @returns {object} Object mapping user IDs to their online status
 */
export const useUserPresence = (userIds) => {
  const [userStatus, setUserStatus] = useState({});
  
  useEffect(() => {
    if (!userIds || userIds.length === 0) return;
    
    // Initialize socket if not already done
    const socketClient = initializeSocket();
    
    if (!socketClient) {
      console.warn('Socket.io not initialized');
      return;
    }
    
    // Subscribe to these users' presence
    socketClient.emit('track_users', userIds);
    
    // Handle presence change events
    const handlePresenceChange = (data) => {
      setUserStatus(prev => ({
        ...prev,
        [data.user]: data.presence
      }));
    };
    
    // Initial presence data
    const handleInitialPresence = (data) => {
      setUserStatus(data);
    };
    
    socketClient.on('presence_change', handlePresenceChange);
    socketClient.on('initial_presence', handleInitialPresence);
    
    // Cleanup
    return () => {
      socketClient.off('presence_change', handlePresenceChange);
      socketClient.off('initial_presence', handleInitialPresence);
      socketClient.emit('untrack_users', userIds);
    };
  }, [userIds]); // Only re-run if the array of userIds changes
  
  return userStatus;
};

/**
 * React hook for typing indicators in a channel
 * @param {string} channelId - The channel ID 
 * @param {function} onUserTyping - Callback for when a user starts typing
 * @returns {function} Function to call when the current user is typing
 */
export const useTypingIndicator = (channelId, onUserTyping) => {
  useEffect(() => {
    if (!channelId) return;
    
    // Initialize socket if not already done
    const socketClient = initializeSocket();
    
    if (!socketClient) {
      console.warn('Socket.io not initialized');
      return;
    }
    
    // Handle typing events
    const handleTyping = (data) => {
      if (data.channel === channelId && onUserTyping) {
        onUserTyping(data.user);
      }
    };
    
    socketClient.on('user_typing', handleTyping);
    
    // Cleanup
    return () => {
      socketClient.off('user_typing', handleTyping);
    };
  }, [channelId, onUserTyping]);
  
  // Return a function to emit typing events
  return () => {
    if (!channelId) return;
    
    const socketClient = initializeSocket();
    if (!socketClient) return;
    
    socketClient.emit('user_typing', { channel: channelId });
  };
};

/**
 * Function to join a Socket.io room for notifications
 * @param {string} roomName - The name of the room to join
 */
export const joinRoom = (roomName) => {
  const socketClient = initializeSocket();
  
  if (socketClient && roomName) {
    socketClient.emit('join_room', roomName);
  }
};

/**
 * Function to leave a Socket.io room
 * @param {string} roomName - The name of the room to leave
 */
export const leaveRoom = (roomName) => {
  const socketClient = initializeSocket();
  
  if (socketClient && roomName) {
    socketClient.emit('leave_room', roomName);
  }
};