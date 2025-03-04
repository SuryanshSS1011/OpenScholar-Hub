// @/utils/slackApi.js
/**
 * Utility functions for interacting with the Slack API
 */

/**
 * Base function to make authenticated requests to the Slack API
 * @param {string} endpoint - The API endpoint to call
 * @param {object} options - Request options
 * @returns {Promise<object>} - The API response
 */
const callSlackApi = async (endpoint, options = {}) => {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const apiUrl = `https://slack.com/api/${endpoint}`;
    const response = await fetch(apiUrl, mergedOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Slack API returns ok: false when there's an error
    if (!data.ok) {
      throw new Error(data.error || 'Unknown Slack API error');
    }
    
    return data;
  } catch (error) {
    console.error(`Error calling Slack API (${endpoint}):`, error);
    throw error;
  }
};

/**
 * Get a list of channels in the workspace
 * @param {boolean} excludeArchived - Whether to exclude archived channels
 * @returns {Promise<Array>} - List of channels
 */
export const getChannels = async (excludeArchived = true) => {
  try {
    const data = await callSlackApi('conversations.list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        exclude_archived: excludeArchived,
        types: 'public_channel,private_channel',
      }),
    });
    
    return data.channels || [];
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};

/**
 * Create a new channel
 * @param {string} name - Channel name
 * @param {boolean} isPrivate - Whether the channel is private
 * @param {Array<string>} userIds - User IDs to invite to the channel
 * @returns {Promise<object>} - The created channel
 */
export const createChannel = async (name, isPrivate = false, userIds = []) => {
  try {
    // Create the channel
    const channelData = await callSlackApi('conversations.create', {
      method: 'POST',
      body: JSON.stringify({
        name: name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        is_private: isPrivate,
      }),
    });
    
    const channelId = channelData.channel.id;
    
    // Invite users if provided
    if (userIds.length > 0) {
      await callSlackApi('conversations.invite', {
        method: 'POST',
        body: JSON.stringify({
          channel: channelId,
          users: userIds.join(','),
        }),
      });
    }
    
    return channelData.channel;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
};

/**
 * Get messages from a channel or DM
 * @param {string} channelId - The channel or DM ID
 * @param {string} cursor - Pagination cursor
 * @param {number} limit - Number of messages to retrieve
 * @returns {Promise<object>} - Messages and pagination info
 */
export const getMessages = async (channelId, cursor = null, limit = 50) => {
  try {
    const params = {
      channel: channelId,
      limit,
    };
    
    if (cursor) {
      params.cursor = cursor;
    }
    
    const data = await callSlackApi('conversations.history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });
    
    return {
      messages: data.messages || [],
      hasMore: data.has_more || false,
      nextCursor: data.response_metadata?.next_cursor,
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a message to a channel or DM
 * @param {string} channelId - The channel or DM ID
 * @param {string} text - Message text
 * @param {Array} blocks - Message blocks (Slack Block Kit)
 * @param {string} threadTs - Parent message timestamp (for replies)
 * @returns {Promise<object>} - The sent message
 */
export const sendMessage = async (channelId, text, blocks = undefined, threadTs = undefined) => {
  try {
    const params = {
      channel: channelId,
      text,
    };
    
    if (blocks) {
      params.blocks = JSON.stringify(blocks);
    }
    
    if (threadTs) {
      params.thread_ts = threadTs;
    }
    
    const data = await callSlackApi('chat.postMessage', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    
    return data.message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get a list of users in the workspace
 * @returns {Promise<Array>} - List of users
 */
export const getUsers = async () => {
  try {
    const data = await callSlackApi('users.list');
    return data.members || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Create a direct message conversation with a user
 * @param {string} userId - User ID to start DM with
 * @returns {Promise<string>} - The DM channel ID
 */
export const createDM = async (userId) => {
  try {
    const data = await callSlackApi('conversations.open', {
      method: 'POST',
      body: JSON.stringify({
        users: userId,
      }),
    });
    
    return data.channel.id;
  } catch (error) {
    console.error('Error creating DM:', error);
    throw error;
  }
};

/**
 * Upload a file to a channel or DM
 * @param {string} channelId - The channel or DM ID
 * @param {File} file - The file to upload
 * @param {string} title - File title
 * @param {string} threadTs - Parent message timestamp (for replies)
 * @returns {Promise<object>} - The uploaded file info
 */
export const uploadFile = async (channelId, file, title = '', threadTs = undefined) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('channels', channelId);
    
    if (title) {
      formData.append('title', title);
    }
    
    if (threadTs) {
      formData.append('thread_ts', threadTs);
    }
    
    const data = await callSlackApi('files.upload', {
      method: 'POST',
      headers: {
        // Don't set Content-Type here, let the browser set it with the boundary
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: formData,
    });
    
    return data.file;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Add a reaction to a message
 * @param {string} channelId - The channel ID
 * @param {string} timestamp - Message timestamp
 * @param {string} emoji - Emoji name without colons
 * @returns {Promise<object>} - The API response
 */
export const addReaction = async (channelId, timestamp, emoji) => {
  try {
    const data = await callSlackApi('reactions.add', {
      method: 'POST',
      body: JSON.stringify({
        channel: channelId,
        timestamp,
        name: emoji,
      }),
    });
    
    return data;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

/**
 * Search messages across the workspace
 * @param {string} query - Search query
 * @param {number} count - Number of results to return
 * @param {number} page - Page number
 * @returns {Promise<object>} - Search results
 */
export const searchMessages = async (query, count = 20, page = 1) => {
  try {
    const data = await callSlackApi('search.messages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        query,
        count,
        page,
      }),
    });
    
    return {
      messages: data.messages.matches || [],
      pagination: data.messages.pagination,
    };
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};