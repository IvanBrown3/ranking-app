import { useState, useEffect, useCallback } from 'react';
import SpotifyService, { type SpotifyUserProfile } from '../services/SpotifyService';

interface UseSpotifyAuthReturn {
  isAuthenticated: boolean;
  userProfile: SpotifyUserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  handleAuthCallback: (code: string) => Promise<void>;
}

const useSpotifyAuth = (): UseSpotifyAuthReturn => {
  const [spotifyService] = useState(() => new SpotifyService());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authenticated = spotifyService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const profile = await spotifyService.getUserProfile();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setError(err instanceof Error ? err.message : 'Authentication check failed');
      setIsAuthenticated(false);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [spotifyService]);

  const login = useCallback(async () => {
    try {
      setError(null);
      await spotifyService.initiateAuth();
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }, [spotifyService]);

  const logout = useCallback(() => {
    try {
      spotifyService.logout();
      setIsAuthenticated(false);
      setUserProfile(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  }, [spotifyService]);

  const handleAuthCallback = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await spotifyService.handleAuthCallback(code);
      await checkAuthStatus();
    } catch (err) {
      console.error('Auth callback error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, [spotifyService, checkAuthStatus]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    userProfile,
    isLoading,
    error,
    login,
    logout,
    handleAuthCallback,
  };
};

export default useSpotifyAuth;
