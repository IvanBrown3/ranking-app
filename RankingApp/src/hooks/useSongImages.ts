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
      console.log('Fetching images for track IDs:', trackIds);
      
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
            imageCount: track.album.images.length
          });
        }
      });

      // Update songs with image URLs
      const updatedSongs = songs.map(song => {
        const spotifyTrack = trackMap.get(song.spotifyId);
        if (spotifyTrack && spotifyTrack.album.images.length > 0) {
          // Use the medium-sized image (usually index 1, or fallback to first available)
          const imageUrl = spotifyTrack.album.images[1]?.url || spotifyTrack.album.images[0]?.url;
          console.log(`Image for ${song.name}:`, imageUrl);
          return {
            ...song,
            imageUrl
          };
        } else {
          console.warn(`No image found for ${song.name} (${song.spotifyId})`);
          if (spotifyTrack) {
            console.warn('Track data:', spotifyTrack);
          } else {
            console.warn('Track not found in Spotify response');
          }
        }
        return song;
      });

      setSongsWithImages(updatedSongs);
      
      // Cache the images in localStorage for faster subsequent loads
      const imageCache = updatedSongs.reduce((cache, song) => {
        if (song.imageUrl) {
          cache[song.spotifyId] = song.imageUrl;
        }
        return cache;
      }, {} as Record<string, string>);
      
      localStorage.setItem('song_image_cache', JSON.stringify(imageCache));
      
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
      const cachedImages = localStorage.getItem('song_image_cache');
      if (cachedImages) {
        const imageCache = JSON.parse(cachedImages) as Record<string, string>;
        const songsWithCachedImages = songs.map(song => ({
          ...song,
          imageUrl: imageCache[song.spotifyId] || song.imageUrl
        }));
        setSongsWithImages(songsWithCachedImages);
        return true;
      }
    } catch (err) {
      console.error('Error loading cached images:', err);
    }
    return false;
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
