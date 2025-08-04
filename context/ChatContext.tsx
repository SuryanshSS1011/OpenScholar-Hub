import React, { createContext, useContext, useState, useEffect, useCallback, useReducer, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import io, { Socket } from 'socket.io-client';
import { 
  ChatState, 
  ChatContextValue, 
  ChatAction, 
  Channel, 
  DirectMessage, 
  Message,
  SocketEvent
} from '@/types';

// Initial state for the chat context
const initialState: ChatState = {
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
    SET_CHANNELS: 'SET_CHANNELS' as const,
    SET_DIRECT_MESSAGES: 'SET_DIRECT_MESSAGES' as const,
    SET_CURRENT_CHANNEL: 'SET_CURRENT_CHANNEL' as const,
    SET_CURRENT_DM: 'SET_CURRENT_DM' as const,
    SET_MESSAGES: 'SET_MESSAGES' as const,
    ADD_MESSAGES: 'ADD_MESSAGES' as const,
    ADD_MESSAGE: 'ADD_MESSAGE' as const,
    UPDATE_MESSAGE: 'UPDATE_MESSAGE' as const,
    SET_LOADING: 'SET_LOADING' as const,
    SET_ERROR: 'SET_ERROR' as const,
    UPDATE_UNREAD_COUNTS: 'UPDATE_UNREAD_COUNTS' as const,
    RESET_UNREAD_COUNT: 'RESET_UNREAD_COUNT' as const,
    ADD_REACTION: 'ADD_REACTION' as const,
    REMOVE_REACTION: 'REMOVE_REACTION' as const,
};

// Reducer function to handle state updates
function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case ACTIONS.SET_CHANNELS:
            return { ...state, channels: action.payload as Channel[] };

        case ACTIONS.SET_DIRECT_MESSAGES:
            return { ...state, directMessages: action.payload as DirectMessage[] };

        case ACTIONS.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel: action.payload as Channel,
                currentDM: null,
                messages: [],
                hasMoreMessages: false,
                nextCursor: null,
            };

        case ACTIONS.SET_CURRENT_DM:
            return {
                ...state,
                currentDM: action.payload as DirectMessage,
                currentChannel: null,
                messages: [],
                hasMoreMessages: false,
                nextCursor: null,
            };

        case ACTIONS.SET_MESSAGES: {
            const payload = action.payload as { messages: Message[]; hasMore: boolean; nextCursor: string | null };
            return {
                ...state,
                messages: payload.messages,
                hasMoreMessages: payload.hasMore,
                nextCursor: payload.nextCursor,
            };
        }

        case ACTIONS.ADD_MESSAGES: {
            const payload = action.payload as { messages: Message[]; hasMore: boolean; nextCursor: string | null };
            return {
                ...state,
                messages: [...state.messages, ...payload.messages],
                hasMoreMessages: payload.hasMore,
                nextCursor: payload.nextCursor,
            };
        }

        case ACTIONS.ADD_MESSAGE: {
            const message = action.payload as Message;
            // Avoid duplicate messages
            if (state.messages.some(msg => msg.id === message.id)) {
                return state;
            }
            return {
                ...state,
                messages: [message, ...state.messages],
            };
        }

        case ACTIONS.UPDATE_MESSAGE: {
            const message = action.payload as Message;
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === message.id ? { ...msg, ...message } : msg
                ),
            };
        }

        case ACTIONS.SET_LOADING:
            return { ...state, isLoading: action.payload as boolean };

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload as string | null };

        case ACTIONS.UPDATE_UNREAD_COUNTS: {
            const payload = action.payload as { id: string };
            return {
                ...state,
                unreadCounts: {
                    ...state.unreadCounts,
                    [payload.id]: (state.unreadCounts[payload.id] || 0) + 1,
                },
            };
        }

        case ACTIONS.RESET_UNREAD_COUNT: {
            const channelId = action.payload as string;
            return {
                ...state,
                unreadCounts: {
                    ...state.unreadCounts,
                    [channelId]: 0,
                },
            };
        }

        case ACTIONS.ADD_REACTION: {
            const reactionPayload = action.payload as { messageId: string; name: string; user: string };
            return {
                ...state,
                messages: state.messages.map(msg => {
                    if (msg.id === reactionPayload.messageId) {
                        // Check if the reaction already exists
                        const existingReactionIndex = (msg.reactions || []).findIndex(
                            r => r.name === reactionPayload.name
                        );

                        let updatedReactions;

                        if (existingReactionIndex >= 0) {
                            // Update existing reaction
                            updatedReactions = [...(msg.reactions || [])];
                            updatedReactions[existingReactionIndex] = {
                                ...updatedReactions[existingReactionIndex],
                                count: updatedReactions[existingReactionIndex].count + 1,
                                users: [...updatedReactions[existingReactionIndex].users, reactionPayload.user],
                            };
                        } else {
                            // Add new reaction
                            updatedReactions = [
                                ...(msg.reactions || []),
                                {
                                    name: reactionPayload.name,
                                    count: 1,
                                    users: [reactionPayload.user],
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
        }

        case ACTIONS.REMOVE_REACTION: {
            const reactionPayload = action.payload as { messageId: string; name: string; user: string };
            return {
                ...state,
                messages: state.messages.map(msg => {
                    if (msg.id === reactionPayload.messageId) {
                        // Filter out or update the reaction
                        const updatedReactions = (msg.reactions || []).map(reaction => {
                            if (reaction.name === reactionPayload.name) {
                                // Remove user from the users array
                                const updatedUsers = reaction.users.filter(
                                    userId => userId !== reactionPayload.user
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
        }

        default:
            return state;
    }
}

// Initialize Socket.io connection
const initializeSocket = (): Socket | null => {
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
const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const { user } = useAuth();
    // Reference to Socket.io client
    const socketRef = useRef<Socket | null>(null);
    const activeChannelRef = useRef<string | null>(null);

    // Define callback functions first to avoid reference errors
    
    // Handle reaction added event
    const handleReactionAdded = useCallback((reaction: { messageId: string; name: string; user: string }) => {
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
    const handleReactionRemoved = useCallback((reaction: { messageId: string; name: string; user: string }) => {
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
    const handleNewMessage = useCallback((message: Message) => {
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
            if (channelId) {
                dispatch({
                    type: ACTIONS.UPDATE_UNREAD_COUNTS,
                    payload: { id: channelId },
                });
            }
        }
    }, [state.currentChannel, state.currentDM]);

    // Fetch channels from API
    const fetchChannels = useCallback(async (): Promise<void> => {
        if (!user) return;

        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        try {
            const response = await fetch('/api/slack/channels');

            if (!response.ok) {
                throw new Error('Failed to fetch channels');
            }

            const channels: Channel[] = await response.json();
            dispatch({ type: ACTIONS.SET_CHANNELS, payload: channels });
        } catch (error) {
            console.error('Error fetching channels:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch channels';
            dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [user]);

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

    // Handle Socket.io events - now all callbacks are defined before use
    useEffect(() => {
        if (!socketRef.current) return;

        // Handle Slack events
        const handleSlackEvent = (data: SocketEvent) => {
            console.log('Received Slack event:', data);

            switch (data.type) {
                case 'new_message':
                    if (data.message) {
                        handleNewMessage(data.message);
                    }
                    break;
                case 'reaction_added':
                    if (data.reaction) {
                        handleReactionAdded(data.reaction);
                    }
                    break;
                case 'reaction_removed':
                    if (data.reaction) {
                        handleReactionRemoved(data.reaction);
                    }
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
            if (socketRef.current) {
                socketRef.current.off('slack_event', handleSlackEvent);
            }
        };
    }, [fetchChannels, handleNewMessage, handleReactionAdded, handleReactionRemoved]);

    // Fetch direct messages from API
    const fetchDirectMessages = useCallback(async (): Promise<void> => {
        if (!user) return;

        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        try {
            const response = await fetch('/api/slack/dms');

            if (!response.ok) {
                throw new Error('Failed to fetch direct messages');
            }

            const dms: DirectMessage[] = await response.json();
            dispatch({ type: ACTIONS.SET_DIRECT_MESSAGES, payload: dms });
        } catch (error) {
            console.error('Error fetching direct messages:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch direct messages';
            dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [user]);

    // Fetch messages for a channel or DM
    const fetchMessages = useCallback(async (channelId: string, reset = true): Promise<void> => {
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

            const messageData: { messages: Message[]; hasMore: boolean; nextCursor: string | null } = await response.json();

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
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
            dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [state.nextCursor, state.hasMoreMessages]);

    // Send a message to a channel or DM
    const sendMessage = useCallback(async (channelId: string, text: string, blocks?: any[], threadTs?: string): Promise<Message> => {
        if (!channelId || (!text && !blocks)) {
            throw new Error('Channel ID and message content are required');
        }

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

            const message: Message = await response.json();

            // Add the new message to the state
            dispatch({
                type: ACTIONS.ADD_MESSAGE,
                payload: message,
            });

            return message;
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
            dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
            throw error;
        }
    }, []);

    // Create a new channel
    const createChannel = useCallback(async (name: string, isPrivate = false, userIds: string[] = []): Promise<Channel> => {
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

            const channel: Channel = await response.json();

            // Add the new channel to the state
            dispatch({
                type: ACTIONS.SET_CHANNELS,
                payload: [...state.channels, channel],
            });

            return channel;
        } catch (error) {
            console.error('Error creating channel:', error);
            const errorMessage = error instanceof Error ? error.message : 'Operation failed';
            dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
            throw error;
        }
    }, [state.channels]);

    // Set current channel and load its messages
    const setCurrentChannel = useCallback(async (channelId: string): Promise<void> => {
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
    const setCurrentDM = useCallback(async (dmId: string): Promise<void> => {
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
    const loadMoreMessages = useCallback((): void => {
        const currentId = state.currentChannel?.id || state.currentDM?.id;

        if (currentId) {
            fetchMessages(currentId, false);
        }
    }, [state.currentChannel, state.currentDM, fetchMessages]);

    // Add a reaction to a message
    const addReaction = useCallback(async (channelId: string, messageId: string, emoji: string): Promise<boolean> => {
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
            const errorMessage = error instanceof Error ? error.message : 'Operation failed';
            dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
            return false;
        }
    }, []);

    // Remove a reaction from a message
    const removeReaction = useCallback(async (channelId: string, messageId: string, emoji: string): Promise<boolean> => {
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
            const errorMessage = error instanceof Error ? error.message : 'Operation failed';
            dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
            return false;
        }
    }, []);

    // Create a direct message
    const createDirectMessage = useCallback(async (userId: string): Promise<DirectMessage> => {
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

            const dm: DirectMessage = await response.json();

            // Add to direct messages list
            dispatch({
                type: ACTIONS.SET_DIRECT_MESSAGES,
                payload: [...state.directMessages, dm],
            });

            return dm;
        } catch (error) {
            console.error('Error creating direct message:', error);
            const errorMessage = error instanceof Error ? error.message : 'Operation failed';
            dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
            throw error;
        }
    }, [state.directMessages]);

    // Function to send typing indicator
    const sendTypingIndicator = useCallback((channelId: string): void => {
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
    const contextValue: ChatContextValue = {
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
export const useChat = (): ChatContextValue => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};