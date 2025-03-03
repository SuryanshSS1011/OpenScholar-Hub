// @/components/ConnectDiscord.js
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const ConnectDiscord = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    
    // Discord OAuth2 URL - you'll need to set this up in the Discord Developer Portal
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/discord/callback`);
    const scope = 'identify guilds.join';
    
    // Redirect to Discord OAuth
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Connect with Discord</h3>
      <p className="text-sm text-gray-600 mb-4">
        Connect your Discord account to participate in project discussions.
      </p>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? 'Connecting...' : 'Connect Discord Account'}
      </button>
    </div>
  );
};

export default ConnectDiscord;