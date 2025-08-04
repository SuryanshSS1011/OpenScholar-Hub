import type { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Mock Slack channels data
    const channels = [
      {
        id: 'C0123456789',
        name: 'general',
        is_channel: true,
        is_private: false,
        is_member: true,
        topic: { value: 'General discussion' },
        purpose: { value: 'Main channel for general discussion' }
      },
      {
        id: 'C0987654321',
        name: 'research',
        is_channel: true,
        is_private: false,
        is_member: true,
        topic: { value: 'Research collaboration' },
        purpose: { value: 'Channel for research discussions' }
      }
    ];

    res.status(200).json({ ok: true, channels });
  } catch (error) {
    console.error('Slack channels API error:', error);
    res.status(500).json({ message: 'Failed to fetch channels' });
  }
}

export default authMiddleware(handler);
