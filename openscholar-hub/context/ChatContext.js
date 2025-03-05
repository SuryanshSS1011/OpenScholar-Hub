// @/context/ChatContext.js
import { createContext, useContext, useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

// Initial state for the chat context
const initialState = {
    channels: [],
    directMessages: [],
    currentChannel: null,
    currentDM: null,
    messages: [],
    hasMoreMessages: false,
    nextCursor: null,
    isLoading: false,
    error: null,
    unreadCounts: {},
};

// Action types for the reducer
const ACTIONS = {
    SET_CHANNELS: 'SET_CHANNELS',
    SET_DIRECT_MESSAGES: 'SET_DIRECT_MESSAGES',
    SET_CURRENT_CHANNEL: 'SET_CURRENT_CHANNEL',
    SET_CURRENT_DM: 'SET_CURRENT_DM',
    SET_MESSAGES: 'SET_MESSAGES',
    ADD_MESSAGES: 'ADD_MESSAGES',
    ADD_MESSAGE: 'ADD_MESSAGE',
    UPDATE_MESSAGE: 'UPDATE_MESSAGE',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    UPDATE_UNREAD_COUNTS: 'UPDATE_UNREAD_COUNTS',
    RESET_UNREAD_COUNT: 'RESET_UNREAD_COUNT',
    ADD_REACTION: 'ADD_REACTION',
    REMOVE_REACTION: 'REMOVE_REACTION',
};

// Reducer function to handle state updates
function chatReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_CHANNELS:
            return { ...state, channels: action.payload };

        case ACTIONS.SET_DIRECT_MESSAGES:
            return { ...state, directMessages: action.payload };

        case ACTIONS.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel: action.payload,
                currentDM: null,
                messages: [],
                hasMoreMessages: false,
                nextCursor: null,
            };

        case ACTIONS.SET_CURRENT_DM:
            return {
                ...state,
                currentDM: action.payload,
                currentChannel: null,
                messages: [],
                hasMoreMessages: false,
                nextCursor: null,
            };

        case ACTIONS.SET_MESSAGES:
            return {
                ...state,
                messages: action.payload.messages,
                hasMoreMessages: action.payload.hasMore,
                nextCursor: action.payload.nextCursor,
            };

        case ACTIONS.ADD_MESSAGES:
            return {
                ...state,
                messages: [...state.messages, ...action.payload.messages],
                hasMoreMessages: action.payload.hasMore,
                nextCursor: action.payload.nextCursor,
            };

        case ACTIONS.ADD_MESSAGE:
            // Avoid duplicate messages
            if (state.messages.some(msg => msg.id === action.payload.id)) {
                return state;
            }
            return {
                ...state,
                messages: [action.payload, ...state.messages],
            };

        case ACTIONS.UPDATE_MESSAGE:
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
                ),
            };

        case ACTIONS.SET_LOADING:
            return { ...state, isLoading: action.payload };

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload };

        case ACTIONS.UPDATE_UNREAD_COUNTS:
            return {
                ...state,
                unreadCounts: {
                    ...state.unreadCounts,
                    [action.payload.id]: (state.unreadCounts[action.payload.id] || 0) + 1,
                },
            };

        case ACTIONS.RESET_UNREAD_COUNT:
            return {
                ...state,
                unreadCounts: {
                    ...state.unreadCounts,
                    [action.payload]: 0,
                },
            };

        case ACTIONS.ADD_REACTION:
            return {
                ...state,
                messages: state.messages.map(msg => {
                    if (msg.id === action.payload.messageId) {
                        // Check if the reaction already exists
                        const existingReactionIndex = (msg.reactions || []).findIndex(
                            r => r.name === action.payload.name
                        );

                        let updatedReactions;

                        if (existingReactionIndex >= 0) {
                            // Update existing reaction
                            updatedReactions = [...msg.reactions];
                            updatedReactions[existingReactionIndex] = {
                                ...updatedReactions[existingReactionIndex],
                                count: updatedReactions[existingReactionIndex].count + 1,
                                users: [...updatedReactions[existingReactionIndex].users, action.payload.user],
                            };
                        } else {
                            // Add new reaction
                            updatedReactions = [
                                ...(msg.reactions || []),
                                {
                                    name: action.payload.name,
                                    count: 1,
                                    users: [action.payload.user],
                                },
                            ];
                        }

                        return {
                            ...msg,
                            reactions: updatedReactions,
                        };
                    }
                    return msg;
                }),
            };

        case ACTIONS.REMOVE_REACTION:
            return {
                ...state,
                messages: state.messages.map(msg => {
                    if (msg.id === action.payload.messageId) {
                        // Filter out or update the reaction
                        const updatedReactions = (msg.reactions || []).map(reaction => {
                            if (reaction.name === action.payload.name) {
                                // Remove user from the users array
                                const updatedUsers = reaction.users.filter(
                                    userId => userId !== action.payload.user
                                );

                                // If no users left, this reaction will be filtered out
                                return {
                                    ...reaction,
                                    count: reaction.count - 1,
                                    users: updatedUsers,
                                };
                            }
                            return reaction;
                        }).filter(reaction => reaction.count > 0); // Remove reactions with 0 count

                        return {
                            ...msg,
                            reactions: updatedReactions,
                        };
                    }
                    return msg;
                }),
            };

        default:
            return state;
    }
}

// Initialize Socket.io connection
const initializeSocket = () => {
    if (typeof window === 'undefined') return null;

    // Create Socket.io connection
    const socket = io({
        path: '/api/socketio',
    });

    // Log connection events
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    return socket;
};

// Create context
const ChatContext = createContext();

export function ChatProvider({ children }) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const { user } = useAuth();
    // Reference to Socket.io client
    const socketRef = useRef(null);
    const activeChannelRef = useRef(null);

    // Initialize Socket.io
    useEffect(() => {
        // Only initialize if user is logged in
        if (user) {
            socketRef.current = initializeSocket();
        }

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user]);

    // Handle Socket.io events
    useEffect(() => {
        if (!socketRef.current) return;

        // Handle Slack events
        const handleSlackEvent = (data) => {
            console.log('Received Slack event:', data);

            switch (data.type) {
                case 'new_message':
                    handleNewMessage(data.message);
                    break;
                case 'reaction_added':
                    handleReactionAdded(data.reaction);
                    break;
                case 'reaction_removed':
                    handleReactionRemoved(data.reaction);
                    break;
                case 'channel_created':
                    // Refresh channels list
                    fetchChannels();
                    break;
                case 'user_typing':
                    // Handle typing indicator
                    break;
                default:
                    console.log('Unhandled event type:', data.type);
            }
        };

        socketRef.current.on('slack_event', handleSlackEvent);

        return () => {
            socketRef.current.off('slack_event', handleSlackEvent);
        };
    }, [fetchChannels, handleNewMessage, handleReactionAdded, handleReactionRemoved]);

    // Fetch channels from API
    const fetchChannels = useCallback(async () => {
        if (!user) return;

        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        try {
            const response = await fetch('/api/slack/channels');

            if (!response.ok) {
                throw new Error('Failed to fetch channels');
            }

            const channels = await response.json();
            dispatch({ type: ACTIONS.SET_CHANNELS, payload: channels });
        } catch (error) {
            console.error('Error fetching channels:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [user]);

    // Fetch direct messages from API
    const fetchDirectMessages = useCallback(async () => {
        if (!user) return;

        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        try {
            const response = await fetch('/api/slack/dms');

            if (!response.ok) {
                throw new Error('Failed to fetch direct messages');
            }

            const dms = await response.json();
            dispatch({ type: ACTIONS.SET_DIRECT_MESSAGES, payload: dms });
        } catch (error) {
            console.error('Error fetching direct messages:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [user]);

    // Fetch messages for a channel or DM
    const fetchMessages = useCallback(async (channelId, reset = true) => {
        if (!channelId) return;

        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        try {
            const cursor = reset ? null : state.nextCursor;

            // Don't fetch more if we've reached the end and not resetting
            if (!reset && !state.hasMoreMessages) {
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
                return;
            }

            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || ''}/slack/messages`, window.location.origin);
            url.searchParams.append('channelId', channelId);

            if (cursor) {
                url.searchParams.append('cursor', cursor);
            }

            const response = await fetch(url.toString());

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const messageData = await response.json();

            if (reset) {
                dispatch({
                    type: ACTIONS.SET_MESSAGES,
                    payload: messageData
                });
            } else {
                dispatch({
                    type: ACTIONS.ADD_MESSAGES,
                    payload: messageData
                });
            }

            // Reset unread count for this channel
            if (reset) {
                dispatch({
                    type: ACTIONS.RESET_UNREAD_COUNT,
                    payload: channelId,
                });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [state.nextCursor, state.hasMoreMessages]);

    // Send a message to a channel or DM
    const sendMessage = useCallback(async (channelId, text, blocks, threadTs) => {
        if (!channelId || (!text && !blocks)) return;

        try {
            // Form data for text messages (files handled separately in MessageInput)
            const formData = new FormData();
            formData.append('channelId', channelId);
            formData.append('text', text);

            if (threadTs) {
                formData.append('threadTs', threadTs);
            }

            if (blocks) {
                formData.append('blocks', JSON.stringify(blocks));
            }

            const response = await fetch('/api/slack/messages', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const message = await response.json();

            // Add the new message to the state
            dispatch({
                type: ACTIONS.ADD_MESSAGE,
                payload: message,
            });

            return message;
        } catch (error) {
            console.error('Error sending message:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    }, []);

    // Create a new channel
    const createChannel = useCallback(async (name, isPrivate = false, userIds = []) => {
        try {
            const response = await fetch('/api/slack/channels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    isPrivate,
                    userIds,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create channel');
            }

            const channel = await response.json();

            // Add the new channel to the state
            dispatch({
                type: ACTIONS.SET_CHANNELS,
                payload: [...state.channels, channel],
            });

            return channel;
        } catch (error) {
            console.error('Error creating channel:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    }, [state.channels]);

    // Set current channel and load its messages
    const setCurrentChannel = useCallback(async (channelId) => {
        const channel = state.channels.find(c => c.id === channelId);

        if (channel) {
            dispatch({ type: ACTIONS.SET_CURRENT_CHANNEL, payload: channel });

            // Update active channel ref
            activeChannelRef.current = channelId;

            // Subscribe to real-time updates for this channel
            if (socketRef.current) {
                // First leave any previous channel
                if (activeChannelRef.current && activeChannelRef.current !== channelId) {
                    socketRef.current.emit('leave_channel', activeChannelRef.current);
                }

                // Join the new channel
                socketRef.current.emit('join_channel', channelId);
            }

            await fetchMessages(channelId);
        }
    }, [state.channels, fetchMessages]);

    // Set current DM and load its messages
    const setCurrentDM = useCallback(async (dmId) => {
        const dm = state.directMessages.find(d => d.id === dmId);

        if (dm) {
            dispatch({ type: ACTIONS.SET_CURRENT_DM, payload: dm });

            // Update active channel ref
            activeChannelRef.current = dmId;

            // Subscribe to real-time updates for this DM
            if (socketRef.current) {
                // First leave any previous channel
                if (activeChannelRef.current && activeChannelRef.current !== dmId) {
                    socketRef.current.emit('leave_channel', activeChannelRef.current);
                }

                // Join the new DM channel
                socketRef.current.emit('join_channel', dmId);
            }

            await fetchMessages(dmId);
        }
    }, [state.directMessages, fetchMessages]);

    // Load more messages for the current conversation
    const loadMoreMessages = useCallback(() => {
        const currentId = state.currentChannel?.id || state.currentDM?.id;

        if (currentId) {
            fetchMessages(currentId, false);
        }
    }, [state.currentChannel, state.currentDM, fetchMessages]);

    // Handle reaction added event
    const handleReactionAdded = useCallback((reaction) => {
        dispatch({
            type: ACTIONS.ADD_REACTION,
            payload: {
                messageId: reaction.messageId,
                name: reaction.name,
                user: reaction.user,
            },
        });
    }, []);

    // Handle reaction removed event
    const handleReactionRemoved = useCallback((reaction) => {
        dispatch({
            type: ACTIONS.REMOVE_REACTION,
            payload: {
                messageId: reaction.messageId,
                name: reaction.name,
                user: reaction.user,
            },
        });
    }, []);

    // Handle incoming message
    const handleNewMessage = useCallback((message) => {
        const channelId = message.channel;
        const currentId = state.currentChannel?.id || state.currentDM?.id;

        // Add message to the current conversation if it matches
        if (channelId === currentId) {
            dispatch({
                type: ACTIONS.ADD_MESSAGE,
                payload: message,
            });
        } else {
            // Otherwise increment unread count
            dispatch({
                type: ACTIONS.UPDATE_UNREAD_COUNTS,
                payload: { id: channelId },
            });
        }
    }, [state.currentChannel, state.currentDM]);

    // Add a reaction to a message
    const addReaction = useCallback(async (channelId, messageId, emoji) => {
        try {
            const response = await fetch('/api/slack/reactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    channel: channelId,
                    timestamp: messageId,
                    name: emoji,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add reaction');
            }

            // Response handling is done via Socket.io events
            return true;
        } catch (error) {
            console.error('Error adding reaction:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return false;
        }
    }, []);

    // Remove a reaction from a message
    const removeReaction = useCallback(async (channelId, messageId, emoji) => {
        try {
            const response = await fetch('/api/slack/reactions', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    channel: channelId,
                    timestamp: messageId,
                    name: emoji,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove reaction');
            }

            // Response handling is done via Socket.io events
            return true;
        } catch (error) {
            console.error('Error removing reaction:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return false;
        }
    }, []);

    // Create a direct message
    const createDirectMessage = useCallback(async (userId) => {
        try {
            const response = await fetch('/api/slack/dms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create direct message');
            }

            const dm = await response.json();

            // Add to direct messages list
            dispatch({
                type: ACTIONS.SET_DIRECT_MESSAGES,
                payload: [...state.directMessages, dm],
            });

            return dm;
        } catch (error) {
            console.error('Error creating direct message:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    }, [state.directMessages]);

    // Function to send typing indicator
    const sendTypingIndicator = useCallback((channelId) => {
        if (!socketRef.current || !channelId) return;

        socketRef.current.emit('user_typing', {
            channel: channelId,
            user: user?.id,
        });
    }, [user]);

    // Initial data loading
    useEffect(() => {
        if (user) {
            fetchChannels();
            fetchDirectMessages();
        }
    }, [user, fetchChannels, fetchDirectMessages]);

    // Value object with state and actions to provide
    const contextValue = {
        ...state,
        fetchChannels,
        fetchDirectMessages,
        fetchMessages,
        sendMessage,
        createChannel,
        setCurrentChannel,
        setCurrentDM,
        loadMoreMessages,
        handleNewMessage,
        addReaction,
        removeReaction,
        createDirectMessage,
        sendTypingIndicator,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
}

// Custom hook to use the chat context
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};