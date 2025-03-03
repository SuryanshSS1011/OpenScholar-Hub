// @/components/DiscordInvite.js
import { useState } from 'react';
import { DiscordLogo } from 'lucide-react';

const DiscordInvite = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invited, setInvited] = useState(false);
  
  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/discord/invite', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate invite');
      }
      
      const data = await response.json();
      
      // Open Discord invite in new tab
      window.open(data.inviteUrl, '_blank');
      setInvited(true);
    } catch (err) {
      console.error('Error generating invite:', err);
      setError('Could not generate Discord invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
      <div className="mx-auto bg-white rounded-full h-16 w-16 flex items-center justify-center mb-4">
        <DiscordLogo className="h-10 w-10 text-indigo-600" />
      </div>
      
      <h3 className="text-lg font-medium text-indigo-900 mb-2">Join Our Research Community</h3>
      <p className="text-indigo-700 mb-4">
        Connect with fellow researchers and collaborate in real-time via Discord.
      </p>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      {invited ? (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
          Discord invite opened in a new tab. If you didn&apos;t see it, check your popup blocker.
        </div>
      ) : (
        <button
          onClick={handleJoin}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Generating Invite...' : 'Join Discord Server'}
        </button>
      )}
    </div>
  );
};

export default DiscordInvite;