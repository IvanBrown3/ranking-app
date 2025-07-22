import React, { useState } from "react";
import "./App.css";

// 10 random song names
const SONGS: string[] = [
    "Blinding Lights",
    "Levitating",
    "Watermelon Sugar",
    "Save Your Tears",
    "Peaches",
    "Good 4 U",
    "Stay",
    "Montero (Call Me By Your Name)",
    "Kiss Me More",
    "Bad Habits",
];

type Matchup = { winner: string; loser: string };

type Pair = [string, string];

// Helper to get all unique pairs
function getAllPairs(items: string[]): Pair[] {
    const pairs: Pair[] = [];
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            pairs.push([items[i], items[j]]);
        }
    }
    return pairs;
}

// Rank Centrality algorithm implementation
function rankCentrality(
    songs: string[],
    matchups: Matchup[]
): { song: string; score: number }[] {
    const n = songs.length;
    const idx = Object.fromEntries(songs.map((s: string, i: number) => [s, i]));
    // Build win matrix
    const W: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    matchups.forEach(({ winner, loser }: Matchup) => {
        W[idx[winner]][idx[loser]] += 1;
    });
    // Build transition matrix
    const P: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        let rowSum = 0;
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                P[i][j] = W[i][j] + 1; // Laplace smoothing
                rowSum += P[i][j];
            }
        }
        for (let j = 0; j < n; j++) {
            if (i !== j) P[i][j] /= rowSum || 1;
        }
    }
    // Power iteration
    let v: number[] = Array(n).fill(1 / n);
    for (let iter = 0; iter < 100; iter++) {
        const vNew: number[] = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) vNew[j] += v[i] * P[i][j];
            }
        }
        const norm = vNew.reduce((a, b) => a + b, 0);
        v = vNew.map((x) => x / (norm || 1));
    }
    return songs.map((song: string, i: number) => ({ song, score: v[i] }));
}

function getRandomPair(pairs: Pair[], played: Pair[]): Pair | null {
    const unplayed = pairs.filter(
        ([a, b]) =>
            !played.some(
                ([x, y]) => (x === a && y === b) || (x === b && y === a)
            )
    );
    if (unplayed.length === 0) return null;
    return unplayed[Math.floor(Math.random() * unplayed.length)];
}

function App() {
    const [matchups, setMatchups] = useState<Matchup[]>([]); // {winner, loser}
    const [playedPairs, setPlayedPairs] = useState<Pair[]>([]); // [a, b]
    const pairs = getAllPairs(SONGS);
    const currentPair = getRandomPair(pairs, playedPairs);
    const ranking = rankCentrality(SONGS, matchups).sort(
        (a, b) => b.score - a.score
    );
    const progress = playedPairs.length / pairs.length;

    const handleVote = (winner: string, loser: string) => {
        setMatchups([...matchups, { winner, loser }]);
        setPlayedPairs([...playedPairs, [winner, loser]]);
    };

    // Spotify theme colors
    const spotifyGreen = "#1DB954";
    const spotifyBlack = "#191414";
    const spotifyGray = "#282828";
    const spotifyAccent = "#FFD02F";

    return (
        <div
            className="flex min-h-screen w-full"
            style={{ background: spotifyBlack }}>
            {/* Left Panel: Pairwise Arena */}
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
                            {currentPair.map((song, idx) => (
                                <button
                                    key={song}
                                    className="px-8 py-6 rounded-lg shadow-lg text-2xl font-semibold transition transform hover:scale-105"
                                    style={{
                                        background:
                                            idx === 0
                                                ? spotifyGreen
                                                : spotifyAccent,
                                        color: spotifyBlack,
                                    }}
                                    onClick={() =>
                                        handleVote(song, currentPair[1 - idx])
                                    }>
                                    {song}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-2xl text-white mt-8">
                            All pairs played! Ranking complete.
                        </div>
                    )}
                </div>
            </div>
            {/* Right Panel: Ranking List */}
            <div
                className="flex-1 w-1/3 flex items-center justify-center shadow-lg"
                style={{ background: spotifyBlack }}>
                <div className="text-center w-full">
                    <h2
                        className="text-3xl font-bold mb-4"
                        style={{ color: spotifyAccent }}>
                        Ranking List
                    </h2>
                    <ol className="text-left mx-auto max-w-xs">
                        {ranking.map(({ song, score }, i) => (
                            <li
                                key={song}
                                className="flex justify-between items-center py-2 px-4 mb-2 rounded-lg"
                                style={{
                                    background:
                                        i === 0 ? spotifyGreen : spotifyGray,
                                    color: i === 0 ? spotifyBlack : "#fff",
                                }}>
                                <span className="font-semibold">
                                    {i + 1}. {song}
                                </span>
                                <span className="ml-4 text-sm">
                                    {score.toFixed(3)}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default App;
