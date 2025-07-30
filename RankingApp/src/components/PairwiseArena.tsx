import React from "react";

type Pair = [string, string];

interface PairwiseArenaProps {
    currentPair: Pair | null;
    progress: number;
    onVote: (winner: string, loser: string) => void;
}

const SongCard: React.FC<{
    song: string;
    color: string;
    onClick: () => void;
}> = ({ song, color, onClick }) => {
    return (
        <button
            className="w-96 h-80 rounded-xl shadow-lg transition transform hover:scale-105 overflow-hidden"
            style={{ backgroundColor: color }}
            onClick={onClick}>
            <div className="flex flex-col h-full">
                {/* Album Art / Image */}
                <div className="flex justify-center items-center h-4/5 bg-gray-200">
                    <div className="w-48 h-48 bg-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-5xl text-gray-600">🎵</span>
                    </div>
                </div>

                {/* Player Footer */}
                <div className="h-1/5 bg-[#191414] text-white px-4 py-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        {/* Song Title */}
                        <div className="text-sm font-medium truncate">
                            {song}
                        </div>

                        {/* Play Button (static) */}
                        <div className="bg-white text-black text-xs px-3 py-1 rounded-full font-semibold">
                            ▶ Play
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-600 rounded-full">
                        <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: "40%" }} // static progress
                        />
                    </div>
                </div>
            </div>
        </button>
    );
};

const PairwiseArena: React.FC<PairwiseArenaProps> = ({
    currentPair,
    progress,
    onVote,
}) => {
    const spotifyGreen = "#1DB954";
    const spotifyGray = "#282828";
    const spotifyAccent = "#FFD02F";

    return (
        <div
            className="flex-2 w-2/3 flex items-center justify-center"
            style={{ background: spotifyGray }}>
            <div className="text-center w-full">
                {/* Progress Bar */}
                <div className="flex flex-col items-center mb-4">
                    <label
                        htmlFor="progress-bar"
                        className="text-white mb-1 text-sm font-medium">
                        Ranking Accuracy: {(progress * 100).toFixed(0)}%
                    </label>
                    <input
                        id="progress-bar"
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={progress}
                        readOnly
                        className="w-2/3 h-2 rounded-lg appearance-none bg-gray-300"
                        style={{
                            background: `linear-gradient(90deg, ${spotifyGreen} ${
                                progress * 100
                            }%, #444 ${progress * 100}%)`,
                            accentColor: spotifyGreen,
                            cursor: "default",
                        }}
                    />
                </div>

                <h1
                    className="text-4xl font-bold mb-6"
                    style={{ color: spotifyGreen }}>
                    Song Arena
                </h1>

                {currentPair ? (
                    <div className="flex justify-center gap-10">
                        <SongCard
                            song={currentPair[0]}
                            color={spotifyGreen}
                            onClick={() =>
                                onVote(currentPair[0], currentPair[1])
                            }
                        />
                        <SongCard
                            song={currentPair[1]}
                            color={spotifyAccent}
                            onClick={() =>
                                onVote(currentPair[1], currentPair[0])
                            }
                        />
                    </div>
                ) : (
                    <div className="text-2xl text-white mt-8">
                        All pairs played! Ranking complete.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PairwiseArena;
