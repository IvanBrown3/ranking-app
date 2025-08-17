import React from "react";
import type { KeyboardEvent } from "react";
import type { Song } from "../types";
import useSpotifyPlayer from "../hooks/useSpotifyPlayer";
import useSpotifyAuth from "../hooks/useSpotifyAuth";

// NOTE: The SPOTIFY_THEME constant is not defined in this file.
// Assuming it is defined elsewhere in your project, for example:
const SPOTIFY_THEME = {
    black: "#121212",
};

// Using an SVG component for icons provides better scalability and styling control.
const MusicNoteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}>
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}>
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}>
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

interface PairwiseArenaProps {
    currentPair: [Song, Song] | null;
    onVote: (winner: string, loser: string) => void;
    playlistUrl: string;
    onPlaylistUrlChange: (url: string) => void;
}

/**
 * A utility function to format time from seconds to MM:SS format.
 */
const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * A card representing a single song choice.
 * It's designed to be responsive and visually appealing.
 */
const SongCard: React.FC<{
    song: Song;
    onClick: () => void;
    spotifyPlayer: ReturnType<typeof useSpotifyPlayer>;
    isAuthenticated: boolean;
}> = ({ song, onClick, spotifyPlayer, isAuthenticated }) => {

    // A key handler for accessibility, allowing users to vote with the keyboard.
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            onClick();
        }
    };

    return (
        <div
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Vote for ${song.name} by ${song.artist}`}
            className="group w-full max-w-xs xl:max-w-sm 2xl:max-w-md cursor-pointer rounded-lg bg-[#181818] p-4 xl:p-6 2xl:p-8 shadow-xl outline-none transition-all duration-300 ease-in-out hover:bg-[#282828] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] focus:ring-[#1DB954]">
            <div className="relative">
                {/* Album Art Container */}
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br from-purple-600 to-blue-500 shadow-lg">
                    {song.imageUrl ? (
                        <img 
                            src={song.imageUrl} 
                            alt={`${song.name} album art`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-black/20">
                            <MusicNoteIcon className="h-24 w-24 xl:h-32 xl:w-32 2xl:h-40 2xl:w-40 text-white/80 transition-transform duration-500 group-hover:scale-110" />
                        </div>
                    )}
                </div>
                {/* Play button appears on hover over album art */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isAuthenticated || !spotifyPlayer.isReady) return;
                        
                        const isCurrentTrack = spotifyPlayer.currentTrack === song.uri;
                        if (isCurrentTrack && spotifyPlayer.isPlaying) {
                            spotifyPlayer.pauseTrack();
                        } else if (isCurrentTrack && !spotifyPlayer.isPlaying) {
                            spotifyPlayer.resumeTrack();
                        } else {
                            spotifyPlayer.playTrack(song.uri);
                        }
                    }}
                    disabled={!isAuthenticated || !spotifyPlayer.isReady}
                    className="absolute bottom-2 right-2 xl:bottom-3 xl:right-3 2xl:bottom-4 2xl:right-4 flex h-12 w-12 xl:h-14 xl:w-14 2xl:h-16 2xl:w-16 translate-y-2 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-lg opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    {spotifyPlayer.currentTrack === song.uri && spotifyPlayer.isPlaying ? (
                        <PauseIcon className="h-6 w-6 xl:h-7 xl:w-7 2xl:h-8 2xl:w-8" />
                    ) : (
                        <PlayIcon className="h-6 w-6 xl:h-7 xl:w-7 2xl:h-8 2xl:w-8" />
                    )}
                </button>
            </div>

            {/* Song Info */}
            <div className="mt-4 xl:mt-6 2xl:mt-8 text-center">
                <h3 className="truncate text-lg xl:text-xl 2xl:text-2xl font-bold text-white">
                    {song.name}
                </h3>
                <p className="text-sm xl:text-base 2xl:text-lg text-gray-400">{song.artist}</p>
            </div>

            {/* Functional Music Player - Safe Area */}
            <div 
                className="mt-4 xl:mt-6 2xl:mt-8 p-2 -m-2 rounded-lg" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3">
                <span className="shrink-0 text-xs xl:text-sm 2xl:text-base text-gray-400">
                    {formatTime(spotifyPlayer.currentTrack === song.uri ? spotifyPlayer.position / 1000 : 0)}
                </span>
                <div 
                    className="h-1 xl:h-1.5 2xl:h-2 w-full flex-grow rounded-full bg-gray-700 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isAuthenticated || !spotifyPlayer.isReady || spotifyPlayer.currentTrack !== song.uri || spotifyPlayer.duration === 0) {
                            return;
                        }
                        
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const progressPercentage = clickX / rect.width;
                        const seekPosition = Math.max(0, Math.min(spotifyPlayer.duration, progressPercentage * spotifyPlayer.duration));
                        
                        spotifyPlayer.seekToPosition(seekPosition);
                    }}
                >
                    {/* Dynamic progress bar */}
                    <div 
                        className="h-1 xl:h-1.5 2xl:h-2 rounded-full bg-[#1DB954] transition-all duration-300 pointer-events-none"
                        style={{ 
                            width: spotifyPlayer.currentTrack === song.uri && spotifyPlayer.duration > 0 && spotifyPlayer.position >= 0
                                ? `${Math.min(100, Math.max(0, (spotifyPlayer.position / spotifyPlayer.duration) * 100))}%` 
                                : '0%' 
                        }}
                    ></div>
                </div>
                <span className="shrink-0 text-xs xl:text-sm 2xl:text-base text-gray-400">
                    {formatTime(
                        spotifyPlayer.currentTrack === song.uri && spotifyPlayer.duration > 0 
                            ? spotifyPlayer.duration / 1000 
                            : song.duration ? song.duration / 1000 : 0
                    )}
                </span>
                <button
                    aria-label={spotifyPlayer.currentTrack === song.uri && spotifyPlayer.isPlaying ? "Pause" : "Play"}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isAuthenticated || !spotifyPlayer.isReady) return;
                        
                        const isCurrentTrack = spotifyPlayer.currentTrack === song.uri;
                        if (isCurrentTrack && spotifyPlayer.isPlaying) {
                            spotifyPlayer.pauseTrack();
                        } else if (isCurrentTrack && !spotifyPlayer.isPlaying) {
                            spotifyPlayer.resumeTrack();
                        } else {
                            spotifyPlayer.playTrack(song.uri);
                        }
                    }}
                    disabled={!isAuthenticated || !spotifyPlayer.isReady}
                    className="shrink-0 text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {spotifyPlayer.currentTrack === song.uri && spotifyPlayer.isPlaying ? (
                        <PauseIcon className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7" />
                    ) : (
                        <PlayIcon className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7" />
                    )}
                </button>
                </div>
            </div>
        </div>
    );
};

/**
 * The main arena view where users compare two songs.
 * It features a responsive layout that adapts from mobile to desktop screens.
 */
const PairwiseArena: React.FC<PairwiseArenaProps> = ({
    currentPair,
    onVote,
}) => {
    const primaryBg = SPOTIFY_THEME.black; // A dark, Spotify-like background
    const { isAuthenticated } = useSpotifyAuth();
    const spotifyPlayer = useSpotifyPlayer();

    return (
        <main
            className="pairwise-arena-container relative flex h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8 xl:p-12"
            style={{ backgroundColor: primaryBg }}>
            <div className="w-full max-w-4xl xl:max-w-6xl 2xl:max-w-7xl text-center">
                {/* Header */}
                <div className="mb-8 xl:mb-12">
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl xl:text-6xl 2xl:text-7xl">
                        Which song is better?
                    </h1>
                    <p className="mt-2 text-lg text-gray-400 xl:text-xl 2xl:text-2xl">
                        Help us rank the ultimate playlist.
                    </p>
                </div>

                {/* Main Content: Song Cards or Completion Message */}
                <div className="my-8 xl:my-12">
                    {currentPair ? (
                        <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-6 lg:gap-10 xl:gap-16 2xl:gap-20">
                            <SongCard
                                song={currentPair[0]}
                                onClick={() => {
                                    // Stop any playing track when a vote is made
                                    if (spotifyPlayer.isPlaying) {
                                        spotifyPlayer.pauseTrack();
                                    }
                                    onVote(currentPair[0].id, currentPair[1].id);
                                }}
                                spotifyPlayer={spotifyPlayer}
                                isAuthenticated={isAuthenticated}
                            />
                            <div className="font-bold text-gray-500 text-xl xl:text-2xl 2xl:text-3xl">OR</div>
                            <SongCard
                                song={currentPair[1]}
                                onClick={() => {
                                    // Stop any playing track when a vote is made
                                    if (spotifyPlayer.isPlaying) {
                                        spotifyPlayer.pauseTrack();
                                    }
                                    onVote(currentPair[1].id, currentPair[0].id);
                                }}
                                spotifyPlayer={spotifyPlayer}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center">
                            <h2 className="text-3xl font-bold text-white xl:text-4xl 2xl:text-5xl">
                                🎉 Ranking Complete!
                            </h2>
                            <p className="mt-2 text-gray-300 xl:text-lg 2xl:text-xl">
                                Thanks for your help.
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress Bar Footer has been removed. */}
            </div>
        </main>
    );
};

export default PairwiseArena;
