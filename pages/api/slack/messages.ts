import type { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { channel } = req.query;

  if (!channel || typeof channel !== 'string') {
    return res.status(400).json({ message: 'Channel parameter is required' });
  }

  try {
    // Mock Slack messages data
    const messages = [
      {
        type: 'message',
        user: 'U0123456789',
        text: 'Hello everyone!',
        ts: '1234567890.123456'
      },
      {
        type: 'message',
        user: 'U0987654321',
        text: 'Great to be here',
        ts: '1234567891.123456'
      }
    ];

    res.status(200).json({ ok: true, messages });
  } catch (error) {
    console.error('Slack messages API error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
}

export default authMiddleware(handler);
