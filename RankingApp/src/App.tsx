import { useEffect, useState } from "react";
import { useDebounce } from "./hooks/useDebounce";
import "./App.css";
import PairwiseArena from "./components/PairwiseArena";
import RankingList from "./components/RankingList";
import { useRanking } from "./hooks/useRanking";
import { SPOTIFY_THEME } from "./constants/theme";
import SpotifyService from "./services/SpotifyService";
import type { Song, SpotifyTrack } from "./types";
import Header from "./components/Header";

const spotifyService = new SpotifyService();

function App() {
    const { songs, currentPair, ranking, progress, completedMatchups, totalMatchups, remainingMatchups, handleVote, setSongs, isLocked, toggleLock, reorder, swap } = useRanking();
    const [authMessage, setAuthMessage] = useState<string | null>(null);
    const [playlistUrl, setPlaylistUrl] = useState<string>("");
    const debouncedPlaylistUrl = useDebounce(playlistUrl, 500); // 500ms debounce delay

    const handlePlaylistLoad = async (url: string) => {
        const playlistId = url.split('/').pop()?.split('?')[0];
        if (playlistId) {
            try {
                const tracks: SpotifyTrack[] = await spotifyService.getPlaylistTracks(playlistId);
                const newSongs: Song[] = tracks.map(track => ({
                    id: track.id, // Using spotify track id as the main id
                    spotifyId: track.id,
                    name: track.name,
                    artist: track.artists.map(a => a.name).join(', '),
                    uri: track.uri,
                    imageUrl: track.album.images[0]?.url || '',
                }));
                setSongs(newSongs);
                setAuthMessage(`Loaded ${newSongs.length} songs from the playlist!`);
                setTimeout(() => setAuthMessage(null), 3000);
            } catch (error) {
                console.error(error);
                setAuthMessage("Failed to load playlist. Make sure the URL is correct and you're logged in.");
                setTimeout(() => setAuthMessage(null), 5000);
            }
        } else {
            setAuthMessage("Invalid Spotify playlist URL");
            setTimeout(() => setAuthMessage(null), 3000);
        }
    };

    useEffect(() => {
        if (debouncedPlaylistUrl) {
            handlePlaylistLoad(debouncedPlaylistUrl);
        }
    }, [debouncedPlaylistUrl]);

    useEffect(() => {
        // Handle URL parameters for authentication feedback
        const urlParams = new URLSearchParams(window.location.search);
        const authStatus = urlParams.get('auth');
        const error = urlParams.get('error');

        if (authStatus === 'success') {
            setAuthMessage('Successfully connected to Spotify!');
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            // Clear message after 3 seconds
            setTimeout(() => setAuthMessage(null), 3000);
        } else if (error) {
            const errorMessages: { [key: string]: string } = {
                'auth_failed': 'Spotify authentication failed. Please try again.',
                'callback_failed': 'Authentication callback failed. Please try again.',
                'no_code': 'No authorization code received. Please try again.'
            };
            setAuthMessage(errorMessages[error] || 'Authentication error occurred.');
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            // Clear message after 5 seconds for errors
            setTimeout(() => setAuthMessage(null), 5000);
        }
    }, []);

    return (
        <div
            className="flex flex-col h-screen w-full relative overflow-hidden"
            style={{ background: SPOTIFY_THEME.black }}>
            <Header 
                playlistUrl={playlistUrl}
                onPlaylistUrlChange={setPlaylistUrl}
            />
            
            {/* Authentication Message */}
            {authMessage && (
                <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium ${
                    authMessage.includes('Successfully') 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                }`}>
                    {authMessage}
                </div>
            )}
            
            <div className="flex flex-1 overflow-hidden">
                <PairwiseArena 
                    currentPair={currentPair} 
                    onVote={handleVote} 
                    playlistUrl={playlistUrl}
                    onPlaylistUrlChange={setPlaylistUrl}
                />
                <RankingList
                    ranking={ranking}
                    progress={progress}
                    completedMatchups={completedMatchups}
                    totalMatchups={totalMatchups}
                    remainingMatchups={remainingMatchups}
                    isLocked={isLocked}
                    onToggleLock={toggleLock}
                    onReorder={reorder}
                    onSwap={swap}
                />
            </div>
        </div>
    );
}

export default App;
