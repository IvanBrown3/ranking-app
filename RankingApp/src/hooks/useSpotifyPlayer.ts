import { useState, useEffect, useCallback } from 'react';
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

  // Load Spotify Web SDK
  useEffect(() => {
    if (!spotifyService.isAuthenticated()) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    (window as unknown as SpotifyWindow).onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new (window as unknown as SpotifyWindow).Spotify.Player({
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
        console.error({ event: 'playback_error', message });
        setError(message);
      });

      // Playback status updates
      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) {
          console.warn('Player state not available. Player is likely inactive.');
          setIsPlaying(false);
          setCurrentTrack(null);
          setPosition(0);
          setDuration(0);
          return;
        }

        const { paused, position, duration, track_window: { current_track } } = state;
        const newIsPlaying = !paused;
        const newTrackUri = current_track.uri;

        setIsPlaying(newIsPlaying);
        setCurrentTrack(newTrackUri);
        setPosition(position);
        setDuration(duration);
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', () => {
        setIsReady(false);
      });

      setPlayer(spotifyPlayer);
      spotifyPlayer.connect();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
      document.body.removeChild(script);
    };
  }, [spotifyService]);

  const playTrack = useCallback(async (uri: string) => {
    console.log({ event: 'play_track', uri });
    if (!isReady || !deviceId) {
      throw new Error('Player not ready');
    }

    const token = await spotifyService.getValidAccessToken();
    if (!token) {
      throw new Error('No valid access token');
    }

    try {

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


      if (!response.ok) {
        const errorText = await response.text();
        console.error('Play request failed:', errorText);
        throw new Error(`Failed to play track: ${response.status}`);
      }

    } catch (err) {
      console.error('Error playing track:', err);
      setError(err instanceof Error ? err.message : 'Failed to play track');
      throw err;
    }
  }, [isReady, deviceId, spotifyService]);

  const pauseTrack = useCallback(async () => {
    console.log({ event: 'pause_track' });
    if (!isReady || !deviceId) {
      throw new Error('Player not ready');
    }

    const token = await spotifyService.getValidAccessToken();
    if (!token) {
      throw new Error('No valid access token');
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to pause track');
      }
    } catch (err) {
      console.error('Error pausing track:', err);
      setError(err instanceof Error ? err.message : 'Failed to pause track');
      throw err;
    }
  }, [isReady, deviceId, spotifyService]);

  const resumeTrack = useCallback(async () => {
    console.log({ event: 'resume_track' });
    if (!isReady || !deviceId) {
      throw new Error('Player not ready');
    }

    const token = await spotifyService.getValidAccessToken();
    if (!token) {
      throw new Error('No valid access token');
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to resume track');
      }
    } catch (err) {
      console.error('Error resuming track:', err);
      setError(err instanceof Error ? err.message : 'Failed to resume track');
      throw err;
    }
  }, [isReady, deviceId, spotifyService]);

  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

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
