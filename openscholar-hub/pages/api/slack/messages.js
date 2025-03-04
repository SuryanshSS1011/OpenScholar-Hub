// @/pages/api/slack/messages.js
import { getMessages, sendMessage } from '@/utils/slackApi';
import { withApiAuth, withRateLimit } from '@/utils/apiMiddleware';

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGetMessages(req, res);
    case 'POST':
      return handleSendMessage(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET handler to retrieve messages from a channel
 */
async function handleGetMessages(req, res) {
  try {
    const { channelId, cursor, limit } = req.query;
    
    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }
    
    // Parse limit to number with default
    const limitNum = limit ? parseInt(limit, 10) : 50;
    
    const messageData = await getMessages(channelId, cursor || null, limitNum);
    
    // Format the messages for our frontend
    const formattedMessages = messageData.messages.map(message => ({
      id: message.ts,
      text: message.text,
      user: message.user,
      timestamp: message.ts,
      threadTs: message.thread_ts,
      replyCount: message.reply_count || 0,
      reactions: message.reactions || [],
      files: message.files || [],
      blocks: message.blocks || [],
      isBot: !!message.bot_id,
    }));
    
    return res.status(200).json({
      messages: formattedMessages,
      hasMore: messageData.hasMore,
      nextCursor: messageData.nextCursor,
    });
  } catch (error) {
    console.error('Error in GET /api/slack/messages:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
}

/**
 * POST handler to send a message to a channel
 */
async function handleSendMessage(req, res) {
  try {
    const { channelId, text, blocks, threadTs } = req.body;
    
    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }
    
    if (!text && !blocks) {
      return res.status(400).json({ error: 'Message text or blocks are required' });
    }
    
    const message = await sendMessage(
      channelId,
      text || '',
      blocks,
      threadTs
    );
    
    // Format the response
    const formattedMessage = {
      id: message.ts,
      text: message.text,
      user: message.user,
      timestamp: message.ts,
      threadTs: message.thread_ts,
      reactions: message.reactions || [],
      files: message.files || [],
      blocks: message.blocks || [],
      isBot: !!message.bot_id,
    };
    
    return res.status(201).json(formattedMessage);
  } catch (error) {
    console.error('Error in POST /api/slack/messages:', error);
    return res.status(500).json({ error: error.message || 'Failed to send message' });
  }
}

// Apply middleware - rate limit and require authentication
export default withRateLimit(
  withApiAuth(handler, { requireAuth: true }), 
  { limit: 100, window: 60000 } // 100 requests per minute
);