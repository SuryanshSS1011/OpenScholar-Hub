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
    // Mock Slack DMs data
    const dms = [
      {
        id: 'D0123456789',
        user: 'U0123456789',
        is_im: true,
        is_open: true
      },
      {
        id: 'D0987654321',
        user: 'U0987654321',
        is_im: true,
        is_open: true
      }
    ];

    res.status(200).json({ ok: true, ims: dms });
  } catch (error) {
    console.error('Slack DMs API error:', error);
    res.status(500).json({ message: 'Failed to fetch DMs' });
  }
}

export default authMiddleware(handler);
