import React from 'react';
import { SPOTIFY_THEME } from '../constants/theme';
import useSpotifyAuth from '../hooks/useSpotifyAuth';

interface SpotifySignInProps {
  // Optional props for external control (backward compatibility)
  onSignIn?: () => void;
  onSignOut?: () => void;
}

const SpotifySignIn: React.FC<SpotifySignInProps> = ({ 
  onSignIn, 
  onSignOut
}) => {
  const { 
    isAuthenticated, 
    userProfile, 
    isLoading, 
    error, 
    login, 
    logout 
  } = useSpotifyAuth();

  const handleSignIn = async () => {
    if (onSignIn) {
      onSignIn();
    } else {
      try {
        await login();
      } catch (err) {
        console.error('Sign in failed:', err);
      }
    }
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      logout();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-600 bg-gray-800/50">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
        <span className="text-white text-xs font-medium">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-600 bg-red-800/20">
        <span className="text-red-400 text-xs font-medium">Auth Error</span>
        <button
          onClick={handleSignIn}
          className="text-xs text-red-300 hover:text-red-200 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isAuthenticated && userProfile) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
          {userProfile.images?.[0] && (
            <img 
              src={userProfile.images[0].url} 
              alt="Profile" 
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-white text-xs font-medium">
            {userProfile.display_name || 'Spotify User'}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
          title="Sign out"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-black text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ 
        backgroundColor: SPOTIFY_THEME.green,
        boxShadow: '0 2px 8px rgba(29, 185, 84, 0.3)'
      }}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="text-black"
      >
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
      {isLoading ? 'Connecting...' : 'Sign in with Spotify'}
    </button>
  );
};

export default SpotifySignIn;
