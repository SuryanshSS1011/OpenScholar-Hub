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
    // Mock Slack users data
    const members = [
      {
        id: 'U0123456789',
        name: 'john.doe',
        real_name: 'John Doe',
        profile: {
          display_name: 'John',
          real_name: 'John Doe',
          email: 'john.doe@example.com'
        }
      },
      {
        id: 'U0987654321',
        name: 'jane.smith',
        real_name: 'Jane Smith',
        profile: {
          display_name: 'Jane',
          real_name: 'Jane Smith',
          email: 'jane.smith@example.com'
        }
      }
    ];

    res.status(200).json({ ok: true, members });
  } catch (error) {
    console.error('Slack users API error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
}

export default authMiddleware(handler);
