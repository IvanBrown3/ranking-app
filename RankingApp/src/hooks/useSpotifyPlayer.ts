import { useState, useEffect, useCallback, useRef } from 'react';
import SpotifyService from '../services/SpotifyService';

// Spotify Web SDK types
interface SpotifyWindow extends Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: any;
}

interface SpotifyWebPlayer {
  addListener: (event: string, callback: (data: any) => void) => void;
  removeListener: (event: string, callback?: (data: any) => void) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  getCurrentState: () => Promise<SpotifyPlayerState | null>;
  getVolume: () => Promise<number>;
  nextTrack: () => Promise<void>;
  pause: () => Promise<void>;
  previousTrack: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  setName: (name: string) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  togglePlay: () => Promise<void>;
}

interface SpotifyPlayerState {
  context: {
    uri: string;
    metadata: any;
  };
  disallows: {
    pausing: boolean;
    peeking_next: boolean;
    peeking_prev: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
  };
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: {
      id: string;
      uri: string;
      name: string;
      artists: Array<{ name: string; uri: string }>;
      album: {
        name: string;
        uri: string;
        images: Array<{ url: string; height: number; width: number }>;
      };
      duration_ms: number;
    };
    previous_tracks: any[];
    next_tracks: any[];
  };
}

interface UseSpotifyPlayerReturn {
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: string | null;
  position: number;
  duration: number;
  deviceId: string | null;
  error: string | null;
  playTrack: (uri: string) => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekToPosition: (positionMs: number) => Promise<void>;
}

const useSpotifyPlayer = (): UseSpotifyPlayerReturn => {
  const [spotifyService] = useState(() => new SpotifyService());
  const [player, setPlayer] = useState<SpotifyWebPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const positionInterval = useRef<number | null>(null);

  // Load Spotify Web SDK
  useEffect(() => {
    if (!spotifyService.isAuthenticated()) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    (window as SpotifyWindow).onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new (window as SpotifyWindow).Spotify.Player({
        name: 'Ranking App Player',
        getOAuthToken: async (cb: (token: string) => void) => {
          const token = await spotifyService.getValidAccessToken();
          if (token) {
            cb(token);
          }
        },
        volume: 0.5,
      }) as SpotifyWebPlayer;

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize:', message);
        setError(message);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate:', message);
        setError(message);
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account:', message);
        setError(message);
      });

      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback:', message);
        setError(message);
      });

      // Playback status updates
      spotifyPlayer.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
        console.log('Player state changed:', state);
        if (!state) {
          setIsPlaying(false);
          setCurrentTrack(null);
          setPosition(0);
          setDuration(0);
          return;
        }

        if (!state.track_window?.current_track) {
          console.warn('No current track in player state');
          return;
        }

        const track = state.track_window.current_track;
        console.log('Track info:', {
          name: track.name,
          uri: track.uri,
          duration: track.duration_ms,
          position: state.position,
          paused: state.paused,
          currentStoredTrack: currentTrack,
          uriMatch: track.uri === currentTrack
        });

        setIsPlaying(!state.paused);
        setCurrentTrack(track.uri);
        setPosition(state.position);
        setDuration(track.duration_ms || 0);
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      // Connect to the player
      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
      }
    };
  }, [spotifyService]);

  // Update position every second when playing
  useEffect(() => {
    if (isPlaying && player) {
      positionInterval.current = setInterval(async () => {
        try {
          const state = await player.getCurrentState();
          if (state && state.track_window?.current_track) {
            console.log('Position update:', {
              position: state.position,
              duration: state.track_window.current_track.duration_ms,
              track: state.track_window.current_track.name,
              uri: state.track_window.current_track.uri,
              paused: state.paused,
              storedCurrentTrack: currentTrack,
              storedIsPlaying: isPlaying,
              uriMatch: state.track_window.current_track.uri === currentTrack
            });
            setPosition(state.position);
            // Also update duration if it wasn't set properly before
            if (state.track_window.current_track.duration_ms && duration === 0) {
              setDuration(state.track_window.current_track.duration_ms);
            }
          }
        } catch (error) {
          console.error('Error getting current state:', error);
        }
      }, 1000);
    } else {
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
        positionInterval.current = null;
      }
    }

    return () => {
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
      }
    };
  }, [isPlaying, player, duration]);

  const playTrack = useCallback(async (uri: string) => {
    console.log('playTrack called with URI:', uri);
    console.log('Player state:', { isReady, deviceId, currentTrack, isPlaying });
    
    if (!isReady || !deviceId) {
      throw new Error('Player not ready');
    }

    const token = await spotifyService.getValidAccessToken();
    if (!token) {
      throw new Error('No valid access token');
    }

    try {
      console.log('Making play request to Spotify API...');
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          uris: [uri],
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Play response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Play request failed:', errorText);
        throw new Error(`Failed to play track: ${response.status}`);
      }
      console.log('Play request successful');
    } catch (err) {
      console.error('Error playing track:', err);
      setError(err instanceof Error ? err.message : 'Failed to play track');
      throw err;
    }
  }, [isReady, deviceId, spotifyService, currentTrack, isPlaying]);

  const pauseTrack = useCallback(async () => {
    console.log('pauseTrack called');
    console.log('Player state before pause:', { currentTrack, isPlaying, position, duration });
    
    if (!player) {
      throw new Error('Player not available');
    }

    try {
      await player.pause();
      console.log('Pause command sent successfully');
    } catch (err) {
      console.error('Error pausing track:', err);
      setError(err instanceof Error ? err.message : 'Failed to pause track');
      throw err;
    }
  }, [player, currentTrack, isPlaying, position, duration]);

  const resumeTrack = useCallback(async () => {
    console.log('resumeTrack called');
    console.log('Player state before resume:', { currentTrack, isPlaying, position, duration });
    
    if (!player) {
      throw new Error('Player not available');
    }

    try {
      await player.resume();
      console.log('Resume command sent successfully');
    } catch (err) {
      console.error('Error resuming track:', err);
      setError(err instanceof Error ? err.message : 'Failed to resume track');
      throw err;
    }
  }, [player, currentTrack, isPlaying, position, duration]);

  const togglePlayPause = useCallback(async () => {
    if (!player) {
      throw new Error('Player not available');
    }

    try {
      await player.togglePlay();
    } catch (err) {
      console.error('Error toggling play/pause:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle play/pause');
      throw err;
    }
  }, [player]);

  const seekToPosition = useCallback(async (positionMs: number) => {
    if (!player) {
      throw new Error('Player not available');
    }

    try {
      await player.seek(positionMs);
    } catch (err) {
      console.error('Error seeking to position:', err);
      setError(err instanceof Error ? err.message : 'Failed to seek to position');
      throw err;
    }
  }, [player]);

  return {
    isReady,
    isPlaying,
    currentTrack,
    position,
    duration,
    deviceId,
    error,
    playTrack,
    pauseTrack,
    resumeTrack,
    togglePlayPause,
    seekToPosition,
  };
};

export default useSpotifyPlayer;
