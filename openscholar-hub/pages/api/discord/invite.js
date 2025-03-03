// @/pages/api/discord/invite.js
import { withApiAuth } from '@/utils/apiMiddleware';
import discordService from '@/utils/discordService';

async function handler(req, res) {
  // Generate a Discord invite
  if (req.method === 'POST') {
    try {
      await discordService.initialize();
      
      const { channelId, maxAge, maxUses } = req.body;
      
      const options = {};
      if (maxAge) options.maxAge = maxAge;
      if (maxUses) options.maxUses = maxUses;
      
      const inviteUrl = await discordService.createInvite(channelId, options);
      
      return res.status(200).json({ 
        success: true,
        inviteUrl 
      });
    } catch (error) {
      console.error('Discord API Error:', error);
      return res.status(500).json({ error: error.message || 'Error generating Discord invite' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withApiAuth(handler, { requireAuth: true });