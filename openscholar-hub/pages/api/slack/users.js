// @/pages/api/slack/users.js
import { getUsers } from '@/utils/slackApi';
import { withApiAuth, withRateLimit } from '@/utils/apiMiddleware';

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGetUsers(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET handler to retrieve users from the workspace
 */
async function handleGetUsers(req, res) {
  try {
    const users = await getUsers();
    
    // Map users to a format that's useful for our frontend
    const formattedUsers = users
      .filter(user => !user.is_bot && !user.deleted) // Filter out bots and deleted users
      .map(user => ({
        id: user.id,
        name: user.real_name || user.name,
        displayName: user.profile?.display_name || user.real_name || user.name,
        email: user.profile?.email,
        avatar: user.profile?.image_72, // Use the 72px avatar
        status: user.presence === 'active' ? 'active' : 'away',
        isAdmin: user.is_admin,
        timezone: user.tz,
        title: user.profile?.title || '',
        phone: user.profile?.phone || '',
      }));
    
    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error in GET /api/slack/users:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
}

// Apply middleware - rate limit and require authentication
export default withRateLimit(
  withApiAuth(handler, { requireAuth: true }), 
  { limit: 50, window: 60000 } // 50 requests per minute
);