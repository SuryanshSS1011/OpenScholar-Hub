// @/pages/api/slack/dms.js
import { withApiAuth, withRateLimit } from '@/utils/apiMiddleware';

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGetDMs(req, res);
    case 'POST':
      return handleCreateDM(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET handler to retrieve direct messages
 */
async function handleGetDMs(req, res) {
  try {
    // Mock DM data for development
    const mockDMs = [
      {
        id: 'D0123',
        name: 'Jane Smith',
        status: 'active',
        email: 'jane.smith@example.com',
        lastMessage: 'Hi there! Did you see the latest research paper?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'D0124',
        name: 'Robert Johnson',
        status: 'away',
        email: 'robert.johnson@example.com',
        lastMessage: 'Let me know when you want to discuss the project.',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'D0125',
        name: 'Emma Williams',
        status: 'active',
        email: 'emma.williams@example.com',
        lastMessage: 'I just shared some new findings in the channel.',
        timestamp: new Date(Date.now() - 43200000).toISOString()
      }
    ];
    
    return res.status(200).json(mockDMs);
  } catch (error) {
    console.error('Error in GET /api/slack/dms:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch direct messages' });
  }
}

/**
 * POST handler to create a new direct message
 */
async function handleCreateDM(req, res) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Mock created DM for development
    const mockDM = {
      id: 'D' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: 'New User',
      status: 'active',
      email: `user${userId}@example.com`,
      lastMessage: '',
      timestamp: new Date().toISOString()
    };
    
    return res.status(201).json(mockDM);
  } catch (error) {
    console.error('Error in POST /api/slack/dms:', error);
    return res.status(500).json({ error: error.message || 'Failed to create direct message' });
  }
}

// Skip auth checks during development
export default process.env.NODE_ENV === 'production'
  ? withRateLimit(withApiAuth(handler, { requireAuth: true }), { limit: 50, window: 60000 })
  : handler;