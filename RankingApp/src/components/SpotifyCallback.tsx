import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSpotifyAuth from '../hooks/useSpotifyAuth';

const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleAuthCallback, isLoading, error } = useSpotifyAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        console.error('Spotify auth error:', errorParam);
        navigate('/?error=auth_failed');
        return;
      }

      if (code) {
        try {
          await handleAuthCallback(code);
          navigate('/?auth=success');
        } catch (err) {
          console.error('Callback handling error:', err);
          navigate('/?error=callback_failed');
        }
      } else {
        console.error('No authorization code received');
        navigate('/?error=no_code');
      }
    };

    handleCallback();
  }, [handleAuthCallback, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg">Completing Spotify authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-green-500 text-black rounded-full font-medium hover:bg-green-400 transition-colors"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <p className="text-lg">Redirecting...</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;
