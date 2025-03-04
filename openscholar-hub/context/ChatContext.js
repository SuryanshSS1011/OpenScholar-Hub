// @/context/ChatContext.js
import { createContext, useContext, useState, useEffect, useCallback, useReducer } from 'react';
import { useAuth } from './AuthContext';

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
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    UPDATE_UNREAD_COUNTS: 'UPDATE_UNREAD_COUNTS',
    RESET_UNREAD_COUNT: 'RESET_UNREAD_COUNT',
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

        default:
            return state;
    }
}

// Create context
const ChatContext = createContext();

export function ChatProvider({ children }) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const { user } = useAuth();

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

            const url = new URL('/api/slack/messages', window.location.origin);
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
            const response = await fetch('/api/slack/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    channelId,
                    text,
                    blocks,
                    threadTs,
                }),
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
            await fetchMessages(channelId);
        }
    }, [state.channels, fetchMessages]);

    // Set current DM and load its messages
    const setCurrentDM = useCallback(async (dmId) => {
        const dm = state.directMessages.find(d => d.id === dmId);

        if (dm) {
            dispatch({ type: ACTIONS.SET_CURRENT_DM, payload: dm });
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
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
}