// @/utils/slackApi.js - Enhanced implementation

import { WebClient } from '@slack/web-api';

// Initialize the WebClient with the bot token
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Get a list of channels in the workspace
 * @param {boolean} excludeArchived - Whether to exclude archived channels
 * @returns {Promise<Array>} - List of channels
 */
export const getChannels = async (excludeArchived = true) => {
  try {
    const result = await slack.conversations.list({
      exclude_archived: excludeArchived,
      types: 'public_channel,private_channel',
    });
    
    return result.channels || [];
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
    const channelData = await slack.conversations.create({
      name: name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      is_private: isPrivate,
    });
    
    const channelId = channelData.channel.id;
    
    // Invite users if provided
    if (userIds.length > 0) {
      await slack.conversations.invite({
        channel: channelId,
        users: userIds.join(','),
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
    
    const data = await slack.conversations.history(params);
    
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
      params.blocks = blocks;
    }
    
    if (threadTs) {
      params.thread_ts = threadTs;
    }
    
    const result = await slack.chat.postMessage(params);
    
    return result.message;
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
    const result = await slack.users.list();
    return result.members || [];
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
    const result = await slack.conversations.open({
      users: userId,
    });
    
    return result.channel.id;
  } catch (error) {
    console.error('Error creating DM:', error);
    throw error;
  }
};

/**
 * Upload a file to a channel or DM
 * @param {string} channelId - The channel or DM ID
 * @param {Buffer|ReadStream} file - The file to upload
 * @param {string} title - File title
 * @param {string} threadTs - Parent message timestamp (for replies)
 * @returns {Promise<object>} - The uploaded file info
 */
export const uploadFile = async (channelId, file, title = '', threadTs = undefined) => {
  try {
    const params = {
      channels: channelId,
      file,
    };
    
    if (title) {
      params.title = title;
    }
    
    if (threadTs) {
      params.thread_ts = threadTs;
    }
    
    const result = await slack.files.upload(params);
    
    return result.file;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};