// @/pages/api/discord/messages.js
import { withApiAuth } from '@/utils/apiMiddleware';
import discordService from '@/utils/discordService';

async function handler(req, res) {
  const { channelId } = req.query;
  
  // GET messages
  if (req.method === 'GET') {
    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }
    
    try {
      await discordService.initialize();
      const messages = await discordService.getMessages(channelId);
      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Discord API Error:', error);
      return res.status(500).json({ error: error.message || 'Error fetching messages' });
    }
  } 
  
  // POST new message
  if (req.method === 'POST') {
    try {
      const { channelId, content, userName } = req.body;
      
      if (!channelId || !content) {
        return res.status(400).json({ error: 'Channel ID and message content are required' });
      }
      
      await discordService.initialize();
      
      // Format message content with username
      const formattedContent = userName ? `**${userName}**: ${content}` : content;
      
      const message = await discordService.sendMessage(channelId, formattedContent);
      return res.status(201).json({ message });
    } catch (error) {
      console.error('Discord API Error:', error);
      return res.status(500).json({ error: error.message || 'Error sending message' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withApiAuth(handler, { requireAuth: true });

