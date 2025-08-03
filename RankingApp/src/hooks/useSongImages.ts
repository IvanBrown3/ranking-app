import { useState, useEffect, useCallback } from 'react';
import { type Song, type SpotifyTrack } from '../types';
import SpotifyService from '../services/SpotifyService';
import useSpotifyAuth from './useSpotifyAuth';

interface UseSongImagesReturn {
  songsWithImages: Song[];
  isLoading: boolean;
  error: string | null;
  refetchImages: () => Promise<void>;
}

const useSongImages = (songs: Song[]): UseSongImagesReturn => {
  const [songsWithImages, setSongsWithImages] = useState<Song[]>(songs);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useSpotifyAuth();
  const [spotifyService] = useState(() => new SpotifyService());

  const fetchImages = useCallback(async () => {
    if (!isAuthenticated || songs.length === 0) {
      setSongsWithImages(songs);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract Spotify track IDs from songs
      const trackIds = songs.map(song => song.spotifyId);
      console.log('Fetching track data for track IDs:', trackIds);
      
      // Fetch all tracks at once from Spotify
      const spotifyTracks = await spotifyService.getTracks(trackIds);
      console.log('Received Spotify tracks:', spotifyTracks);
      
      // Create a map of track ID to Spotify track data
      const trackMap = new Map<string, SpotifyTrack>();
      spotifyTracks.forEach(track => {
        if (track) {
          trackMap.set(track.id, track);
          console.log(`Track ${track.id} (${track.name}):`, {
            images: track.album.images,
            imageCount: track.album.images.length,
            duration: track.duration_ms
          });
        }
      });

      // Update songs with image URLs and durations
      const updatedSongs = songs.map(song => {
        const spotifyTrack = trackMap.get(song.spotifyId);
        if (spotifyTrack) {
          // Use the medium-sized image (usually index 1, or fallback to first available)
          const imageUrl = spotifyTrack.album.images[1]?.url || spotifyTrack.album.images[0]?.url;
          console.log(`Data for ${song.name}:`, { imageUrl, duration: spotifyTrack.duration_ms });
          
          return {
            ...song,
            imageUrl,
            duration: spotifyTrack.duration_ms
          };
        } else {
          console.warn(`No track data found for ${song.name} (${song.spotifyId})`);
        }
        return song;
      });

      setSongsWithImages(updatedSongs);
      
      // Cache the song data in localStorage for faster subsequent loads
      const songDataCache = updatedSongs.reduce((cache, song) => {
        if (song.spotifyId) {
          cache[song.spotifyId] = {
            imageUrl: song.imageUrl,
            duration: song.duration
          };
        }
        return cache;
      }, {} as Record<string, { imageUrl?: string; duration?: number }>);
      
      localStorage.setItem('song_data_cache', JSON.stringify(songDataCache));
      
    } catch (err) {
      console.error('Error fetching song images:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch song images');
      setSongsWithImages(songs);
    } finally {
      setIsLoading(false);
    }
  }, [songs, isAuthenticated, spotifyService]);

  const loadFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem('song_data_cache');
      if (cachedData) {
        const dataCache = JSON.parse(cachedData) as Record<string, { imageUrl?: string; duration?: number }>;
        const songsWithCachedData = songs.map(song => {
          const cachedSong = dataCache[song.spotifyId] || {};
          return {
            ...song,
            imageUrl: cachedSong.imageUrl || song.imageUrl,
            duration: cachedSong.duration || song.duration
          };
        });
        setSongsWithImages(songsWithCachedData);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading cached song data:', err);
      return false;
    }
  }, [songs]);

  // Load images when authentication status changes or songs change
  useEffect(() => {
    if (isAuthenticated) {
      // First try to load from cache, then fetch fresh data
      loadFromCache();
      fetchImages();
    } else {
      // If not authenticated, try to load from cache
      loadFromCache();
    }
  }, [isAuthenticated, fetchImages, loadFromCache]);

  return {
    songsWithImages,
    isLoading,
    error,
    refetchImages: fetchImages,
  };
};

export default useSongImages;
