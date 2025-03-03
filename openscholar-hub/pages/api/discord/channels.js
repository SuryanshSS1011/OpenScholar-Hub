// @/pages/api/discord/channels.js
import { withApiAuth } from '@/utils/apiMiddleware';
import discordService from '@/utils/discordService';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.query;

  try {
    await discordService.initialize();
    
    let channels;
    
    if (projectId) {
      // Get channels for a specific project
      channels = await discordService.getProjectChannels(projectId);
    } else {
      // Get all channels
      channels = await discordService.getChannels();
    }
    
    return res.status(200).json({ channels });
  } catch (error) {
    console.error('Discord API Error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
  }
}

// Apply middleware - require authentication for discord endpoints
export default withApiAuth(handler, { requireAuth: true });

