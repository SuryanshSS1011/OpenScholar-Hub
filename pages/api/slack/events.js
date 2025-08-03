// @/pages/api/slack/events.js
import { withRateLimit } from '@/utils/apiMiddleware';
import { createHmac, timingSafeEqual } from 'crypto';
import { Server } from 'socket.io';

async function handler(req, res) {
  // Only allow POST requests for Slack events
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Verify the request signature from Slack
  if (!verifySlackSignature(req)) {
    return res.status(401).json({ error: 'Invalid request signature' });
  }
  
  const { body } = req;
  
  // Handle Slack verification challenge
  if (body.type === 'url_verification') {
    return res.status(200).json({ challenge: body.challenge });
  }
  
  // Handle Slack events
  if (body.type === 'event_callback') {
    // Acknowledge the event quickly to prevent Slack from retrying
    res.status(200).json({ received: true });
    
    // Process the event asynchronously
    try {
      await handleEventCallback(body, req.socket.server.io);
    } catch (error) {
      console.error('Error processing Slack event:', error);
    }
    
    return;
  }
  
  // Unknown event type
  return res.status(400).json({ error: 'Unknown event type' });
}

/**
 * Verify that the request is coming from Slack
 * @param {object} req - Express request object
 * @returns {boolean} - Whether the signature is valid
 */
function verifySlackSignature(req) {
  // Get the signature from headers
  const slackSignature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  
  // Prevent replay attacks
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > 300) {
    return false; // Request is older than 5 minutes
  }
  
  // Get the request body as raw string
  const rawBody = typeof req.body === 'string' 
    ? req.body 
    : JSON.stringify(req.body);
  
  // Create the signature base string
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  
  // Create the signature
  const mySignature = 'v0=' + createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
    .update(sigBaseString)
    .digest('hex');
  
  // Compare signatures
  try {
    return timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(slackSignature)
    );
  } catch (error) {
    console.error('Error validating signature:', error);
    return false;
  }
}

/**
 * Handle Slack event callbacks
 * @param {object} body - Event callback body
 * @param {object} io - Socket.io server instance
 */
async function handleEventCallback(body, io) {
  const { event } = body;
  
  if (!io) {
    console.warn('Socket.io not initialized, cannot emit events');
    return;
  }
  
  // Process the event based on the type
  switch (event.type) {
    case 'message':
      await handleMessageEvent(event, io);
      break;
      
    case 'reaction_added':
      await handleReactionEvent(event, io);
      break;
      
    case 'channel_created':
      await handleChannelEvent(event, io);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle message events
 * @param {object} event - Slack message event
 * @param {object} io - Socket.io server instance
 */
async function handleMessageEvent(event, io) {
  // Ignore messages from bots to prevent loops
  if (event.bot_id || event.subtype === 'bot_message') {
    return;
  }
  
  console.log(`New message in ${event.channel}`);
  
  // Format the message for our frontend
  const message = {
    type: 'new_message',
    message: {
      id: event.ts,
      text: event.text,
      user: event.user,
      channel: event.channel,
      timestamp: event.ts,
      threadTs: event.thread_ts,
    }
  };
  
  // Emit the event to all clients in this channel
  io.to(`channel_${event.channel}`).emit('slack_event', message);
}

/**
 * Handle reaction events
 * @param {object} event - Slack reaction event
 * @param {object} io - Socket.io server instance
 */
async function handleReactionEvent(event, io) {
  console.log(`Reaction ${event.reaction} added to message in ${event.item.channel}`);
  
  const reactionData = {
    type: 'reaction_added',
    reaction: {
      name: event.reaction,
      user: event.user,
      messageId: event.item.ts,
      channel: event.item.channel,
    }
  };
  
  // Emit the event to all clients in this channel
  io.to(`channel_${event.item.channel}`).emit('slack_event', reactionData);
}

/**
 * Handle channel creation events
 * @param {object} event - Slack channel event
 * @param {object} io - Socket.io server instance
 */
async function handleChannelEvent(event, io) {
  console.log(`Channel created: ${event.channel.name}`);
  
  const channelData = {
    type: 'channel_created',
    channel: {
      id: event.channel.id,
      name: event.channel.name,
      isPrivate: event.channel.is_private,
      creator: event.channel.creator,
      created: new Date(event.channel.created * 1000).toISOString(),
    }
  };
  
  // Emit to all connected clients
  io.emit('slack_event', channelData);
}

// Apply rate limiting middleware but no auth check (needed for Slack events)
export default withRateLimit(handler, { limit: 100, window: 60000 });

export const config = {
  api: {
    bodyParser: true, // Enable body parsing for this route
  },
};