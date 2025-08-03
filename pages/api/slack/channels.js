// @/pages/api/slack/channels.js
import { getChannels, createChannel } from '@/utils/slackApi';
import { withApiAuth, withRateLimit } from '@/utils/apiMiddleware';

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGetChannels(req, res);
    case 'POST':
      return handleCreateChannel(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET handler to retrieve channels
 */
async function handleGetChannels(req, res) {
  try {
    const { excludeArchived } = req.query;
    
    // Convert string query param to boolean
    const excludeArchivedBool = excludeArchived === 'false' ? false : true;
    
    const channels = await getChannels(excludeArchivedBool);
    
    // Map channels to a format that's useful for our frontend
    const formattedChannels = channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      isPrivate: channel.is_private,
      topic: channel.topic?.value || '',
      memberCount: channel.num_members,
      isArchived: channel.is_archived,
      createdAt: new Date(channel.created * 1000).toISOString(),
    }));
    
    return res.status(200).json(formattedChannels);
  } catch (error) {
    console.error('Error in GET /api/slack/channels:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch channels' });
  }
}

/**
 * POST handler to create a new channel
 */
async function handleCreateChannel(req, res) {
  try {
    const { name, isPrivate, userIds } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }
    
    // Validate channel name according to Slack's rules
    const nameRegex = /^[a-z0-9_-]+$/;
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    
    if (!nameRegex.test(sanitizedName)) {
      return res.status(400).json({ 
        error: 'Channel name can only contain lowercase letters, numbers, hyphens, and underscores' 
      });
    }
    
    if (sanitizedName.length > 80) {
      return res.status(400).json({ error: 'Channel name must be 80 characters or less' });
    }
    
    // Ensure userIds is an array if provided
    const userIdsArray = Array.isArray(userIds) ? userIds : [];
    
    // Create the channel
    const channel = await createChannel(sanitizedName, isPrivate, userIdsArray);
    
    // Format the response
    const formattedChannel = {
      id: channel.id,
      name: channel.name,
      isPrivate: channel.is_private,
      topic: channel.topic?.value || '',
      memberCount: channel.num_members || 1, // Creator is automatically a member
      isArchived: false,
      createdAt: new Date(channel.created * 1000).toISOString(),
    };
    
    return res.status(201).json(formattedChannel);
  } catch (error) {
    console.error('Error in POST /api/slack/channels:', error);
    return res.status(500).json({ error: error.message || 'Failed to create channel' });
  }
}

// Apply middleware - rate limit and require authentication
export default withRateLimit(
  withApiAuth(handler, { requireAuth: true }), 
  { limit: 50, window: 60000 } // 50 requests per minute
);