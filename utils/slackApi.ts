// @/utils/slackApi.ts - Enhanced implementation

import { WebClient, WebAPICallResult } from '@slack/web-api';
import type { Channel, Message, ApiError } from '@/types';

// Slack-specific API response types
interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  topic?: {
    value: string;
  };
  num_members: number;
  is_archived: boolean;
  created: number;
}

interface SlackMessage {
  type: string;
  ts: string;
  user: string;
  text?: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Array<{
    name: string;
    count: number;
    users: string[];
  }>;
  files?: Array<{
    id: string;
    name: string;
    url_private: string;
    mimetype: string;
    size: number;
  }>;
  blocks?: any[];
  bot_id?: string;
}

interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
  profile?: {
    image_24?: string;
    image_32?: string;
    image_48?: string;
    image_72?: string;
  };
  deleted?: boolean;
  is_bot?: boolean;
}

interface SlackConversationsListResponse extends WebAPICallResult {
  channels?: SlackChannel[];
}

interface SlackConversationsHistoryResponse extends WebAPICallResult {
  messages?: SlackMessage[];
  has_more?: boolean;
  response_metadata?: {
    next_cursor?: string;
  };
}

interface SlackChatPostMessageResponse extends WebAPICallResult {
  message?: SlackMessage;
}

interface SlackUsersListResponse extends WebAPICallResult {
  members?: SlackUser[];
}

interface SlackConversationsOpenResponse extends WebAPICallResult {
  channel?: {
    id: string;
  };
}

interface SlackFilesUploadResponse extends WebAPICallResult {
  file?: {
    id: string;
    name: string;
    url_private: string;
    mimetype: string;
    size: number;
  };
}

// Initialize the WebClient with the bot token
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Validate Slack API configuration
 */
const validateSlackConfig = (): void => {
  if (!process.env.SLACK_BOT_TOKEN) {
    const error: ApiError = {
      message: 'SLACK_BOT_TOKEN environment variable is not configured',
      code: 'CONFIG_ERROR'
    };
    throw error;
  }
};

/**
 * Get a list of channels in the workspace
 * @param excludeArchived - Whether to exclude archived channels
 * @returns Promise resolving to list of channels
 */
export const getChannels = async (excludeArchived: boolean = true): Promise<Channel[]> => {
  try {
    validateSlackConfig();

    const result = await slack.conversations.list({
      exclude_archived: excludeArchived,
      types: 'public_channel,private_channel',
    }) as SlackConversationsListResponse;
    
    if (!result.ok || !result.channels) {
      const error: ApiError = {
        message: result.error || 'Failed to fetch channels',
        code: 'SLACK_API_ERROR'
      };
      throw error;
    }

    return result.channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      isPrivate: channel.is_private,
      topic: channel.topic?.value,
      memberCount: channel.num_members,
      isArchived: channel.is_archived,
      createdAt: new Date(channel.created * 1000).toISOString()
    }));
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};

/**
 * Create a new channel
 * @param name - Channel name
 * @param isPrivate - Whether the channel is private
 * @param userIds - User IDs to invite to the channel
 * @returns Promise resolving to the created channel
 */
export const createChannel = async (
  name: string, 
  isPrivate: boolean = false, 
  userIds: string[] = []
): Promise<Channel> => {
  try {
    validateSlackConfig();

    if (!name || !name.trim()) {
      const error: ApiError = { message: 'Channel name is required' };
      throw error;
    }

    // Create the channel
    const channelData = await slack.conversations.create({
      name: name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      is_private: isPrivate,
    }) as SlackConversationsListResponse;
    
    if (!channelData.ok || !channelData.channels?.[0]) {
      const error: ApiError = {
        message: channelData.error || 'Failed to create channel',
        code: 'SLACK_API_ERROR'
      };
      throw error;
    }

    const channel = channelData.channels[0];
    const channelId = channel.id;
    
    // Invite users if provided
    if (userIds.length > 0) {
      await slack.conversations.invite({
        channel: channelId,
        users: userIds.join(','),
      });
    }
    
    return {
      id: channel.id,
      name: channel.name,
      isPrivate: channel.is_private,
      topic: channel.topic?.value,
      memberCount: channel.num_members,
      isArchived: channel.is_archived,
      createdAt: new Date(channel.created * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
};

/**
 * Get messages from a channel or DM
 * @param channelId - The channel or DM ID
 * @param cursor - Pagination cursor
 * @param limit - Number of messages to retrieve
 * @returns Promise resolving to messages and pagination info
 */
export const getMessages = async (
  channelId: string, 
  cursor: string | null = null, 
  limit: number = 50
): Promise<{ messages: Message[]; hasMore: boolean; nextCursor?: string }> => {
  try {
    validateSlackConfig();

    if (!channelId) {
      const error: ApiError = { message: 'Channel ID is required' };
      throw error;
    }

    const params: any = {
      channel: channelId,
      limit,
    };
    
    if (cursor) {
      params.cursor = cursor;
    }
    
    const data = await slack.conversations.history(params) as SlackConversationsHistoryResponse;
    
    if (!data.ok) {
      const error: ApiError = {
        message: data.error || 'Failed to fetch messages',
        code: 'SLACK_API_ERROR'
      };
      throw error;
    }

    const messages: Message[] = (data.messages || []).map(msg => ({
      id: msg.ts,
      text: msg.text,
      user: msg.user,
      timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
      threadTs: msg.thread_ts,
      replyCount: msg.reply_count,
      reactions: msg.reactions,
      files: msg.files?.map(file => ({
        id: file.id,
        name: file.name,
        url: file.url_private,
        mimetype: file.mimetype,
        size: file.size
      })),
      blocks: msg.blocks,
      isBot: !!msg.bot_id,
      channel: channelId
    }));
    
    return {
      messages,
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
 * @param channelId - The channel or DM ID
 * @param text - Message text
 * @param blocks - Message blocks (Slack Block Kit)
 * @param threadTs - Parent message timestamp (for replies)
 * @returns Promise resolving to the sent message
 */
export const sendMessage = async (
  channelId: string, 
  text: string, 
  blocks?: any[], 
  threadTs?: string
): Promise<Message> => {
  try {
    validateSlackConfig();

    if (!channelId || !text) {
      const error: ApiError = { message: 'Channel ID and message text are required' };
      throw error;
    }

    const params: any = {
      channel: channelId,
      text,
    };
    
    if (blocks) {
      params.blocks = blocks;
    }
    
    if (threadTs) {
      params.thread_ts = threadTs;
    }
    
    const result = await slack.chat.postMessage(params) as SlackChatPostMessageResponse;
    
    if (!result.ok || !result.message) {
      const error: ApiError = {
        message: result.error || 'Failed to send message',
        code: 'SLACK_API_ERROR'
      };
      throw error;
    }

    const msg = result.message;
    
    return {
      id: msg.ts,
      text: msg.text,
      user: msg.user,
      timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
      threadTs: msg.thread_ts,
      replyCount: msg.reply_count,
      reactions: msg.reactions,
      files: msg.files?.map(file => ({
        id: file.id,
        name: file.name,
        url: file.url_private,
        mimetype: file.mimetype,
        size: file.size
      })),
      blocks: msg.blocks,
      isBot: !!msg.bot_id,
      channel: channelId
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get a list of users in the workspace
 * @returns Promise resolving to list of users
 */
export const getUsers = async (): Promise<SlackUser[]> => {
  try {
    validateSlackConfig();

    const result = await slack.users.list({}) as SlackUsersListResponse;
    
    if (!result.ok || !result.members) {
      const error: ApiError = {
        message: result.error || 'Failed to fetch users',
        code: 'SLACK_API_ERROR'
      };
      throw error;
    }

    return result.members.filter(user => !user.deleted);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Create a direct message conversation with a user
 * @param userId - User ID to start DM with
 * @returns Promise resolving to the DM channel ID
 */
export const createDM = async (userId: string): Promise<string> => {
  try {
    validateSlackConfig();

    if (!userId) {
      const error: ApiError = { message: 'User ID is required' };
      throw error;
    }

    const result = await slack.conversations.open({
      users: userId,
    }) as SlackConversationsOpenResponse;
    
    if (!result.ok || !result.channel) {
      const error: ApiError = {
        message: result.error || 'Failed to create DM',
        code: 'SLACK_API_ERROR'
      };
      throw error;
    }

    return result.channel.id;
  } catch (error) {
    console.error('Error creating DM:', error);
    throw error;
  }
};

/**
 * Upload a file to a channel or DM
 * @param channelId - The channel or DM ID
 * @param file - The file to upload (Buffer or ReadStream)
 * @param title - File title
 * @param threadTs - Parent message timestamp (for replies)
 * @returns Promise resolving to the uploaded file info
 */
export const uploadFile = async (
  channelId: string, 
  file: Buffer | NodeJS.ReadableStream, 
  title: string = '', 
  threadTs?: string
): Promise<any> => {
  try {
    validateSlackConfig();

    if (!channelId || !file) {
      const error: ApiError = { message: 'Channel ID and file are required' };
      throw error;
    }

    const params: any = {
      channels: channelId,
      file,
    };
    
    if (title) {
      params.title = title;
    }
    
    if (threadTs) {
      params.thread_ts = threadTs;
    }
    
    const result = await slack.files.upload(params) as SlackFilesUploadResponse;
    
    if (!result.ok || !result.file) {
      const error: ApiError = {
        message: result.error || 'Failed to upload file',
        code: 'SLACK_API_ERROR'
      };
      throw error;
    }

    return result.file;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Export types for use in other files
export type { 
  SlackChannel, 
  SlackMessage, 
  SlackUser, 
  SlackConversationsListResponse,
  SlackConversationsHistoryResponse,
  SlackChatPostMessageResponse,
  SlackUsersListResponse
};