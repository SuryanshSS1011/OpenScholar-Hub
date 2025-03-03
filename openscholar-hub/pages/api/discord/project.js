// @/pages/api/discord/project.js
import { withApiAuth } from '@/utils/apiMiddleware';
import discordService from '@/utils/discordService';

async function handler(req, res) {
  const { projectId } = req.query || req.body;
  
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  // Check if Discord is set up for this project
  if (req.method === 'GET') {
    try {
      await discordService.initialize();
      const channels = await discordService.getProjectChannels(projectId);
      
      return res.status(200).json({ 
        isSetup: channels.length > 0,
        channels 
      });
    } catch (error) {
      console.error('Discord API Error:', error);
      return res.status(500).json({ error: error.message || 'Error checking Discord setup' });
    }
  }
  
  // Set up Discord channels for this project
  if (req.method === 'POST') {
    try {
      const { projectTitle } = req.body;
      
      if (!projectTitle) {
        return res.status(400).json({ error: 'Project title is required' });
      }
      
      await discordService.initialize();
      
      // Create channels for the project
      const setup = await discordService.setupProjectChannels(projectId, projectTitle);
      
      return res.status(201).json({ 
        success: true,
        message: 'Discord channels created successfully',
        setup 
      });
    } catch (error) {
      console.error('Discord API Error:', error);
      return res.status(500).json({ error: error.message || 'Error setting up Discord channels' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withApiAuth(handler, { requireAuth: true });

