import React from "react";
import type { KeyboardEvent } from "react";

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

type Pair = [string, string];

interface PairwiseArenaProps {
    currentPair: Pair | null;
    onVote: (winner: string, loser: string) => void;
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
    song: string;
    onClick: () => void;
}> = ({ song, onClick }) => {
    const mockDuration = 210; // Mock duration in seconds (e.g., 3:30)

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
            aria-label={`Vote for ${song}`}
            className="group w-full max-w-xs cursor-pointer rounded-lg bg-[#181818] p-4 shadow-xl outline-none transition-all duration-300 ease-in-out hover:bg-[#282828] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] focus:ring-[#1DB954]">
            <div className="relative">
                {/* Album Art Container */}
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br from-purple-600 to-blue-500 shadow-lg">
                    <div className="flex h-full w-full items-center justify-center bg-black/20">
                        <MusicNoteIcon className="h-24 w-24 text-white/80 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                </div>
                {/* Play button appears on hover over album art */}
                <div className="absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-lg opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                    <PlayIcon className="h-6 w-6" />
                </div>
            </div>

            {/* Song Info */}
            <div className="mt-4 text-center">
                <h3 className="truncate text-lg font-bold text-white">
                    {song}
                </h3>
                <p className="text-sm text-gray-400">Artist Name</p>
            </div>

            {/* Static, Stateless Music Player */}
            <div className="mt-4 flex items-center gap-3">
                <span className="shrink-0 text-xs text-gray-400">0:00</span>
                <div className="h-1 w-full flex-grow rounded-full bg-gray-700">
                    {/* Static progress bar at 0% */}
                    <div className="h-1 w-0 rounded-full bg-[#1DB954]"></div>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                    {formatTime(mockDuration)}
                </span>
                <button
                    aria-label="Play"
                    onClick={(e) => e.stopPropagation()} // Stop propagation to prevent voting
                    className="cursor-default shrink-0 text-white/80">
                    <PlayIcon className="h-5 w-5" />
                </button>
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

    return (
        <main
            className="flex h-screen w-full flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8"
            style={{ backgroundColor: primaryBg }}>
            <div className="w-full max-w-4xl text-center">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                        Which song is better?
                    </h1>
                    <p className="mt-2 text-lg text-gray-400">
                        Help us rank the ultimate playlist.
                    </p>
                </div>

                {/* Main Content: Song Cards or Completion Message */}
                <div className="my-8">
                    {currentPair ? (
                        <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-6 lg:gap-10">
                            <SongCard
                                song={currentPair[0]}
                                onClick={() =>
                                    onVote(currentPair[0], currentPair[1])
                                }
                            />
                            <div className="font-bold text-gray-500">OR</div>
                            <SongCard
                                song={currentPair[1]}
                                onClick={() =>
                                    onVote(currentPair[1], currentPair[0])
                                }
                            />
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center">
                            <h2 className="text-3xl font-bold text-white">
                                🎉 Ranking Complete!
                            </h2>
                            <p className="mt-2 text-gray-300">
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
