import { useState, useMemo } from "react";
import type { Matchup, Pair, Song } from "../types";
import { rankCentrality, getAllPairs, getRandomPair } from "../utils";
import { SONGS } from "../constants/songs";
import useSongImages from "./useSongImages";

export function useRanking() {
    const [songs, setSongs] = useState<Song[]>(SONGS);
    const [matchups, setMatchups] = useState<Matchup[]>([]);
    const [playedPairs, setPlayedPairs] = useState<Pair[]>([]);
    
    // Get songs with images
    const { songsWithImages, isLoading: imagesLoading } = useSongImages(songs);

    const pairs = useMemo(() => getAllPairs(songsWithImages), [songsWithImages]);
    const currentPair = useMemo(
        () => getRandomPair(pairs, playedPairs),
        [pairs, playedPairs]
    );

    // Helper function to get song by ID
    const getSongById = (id: string): Song | undefined => {
        return songsWithImages.find(song => song.id === id);
    };

    // Get current pair as Song objects
    const currentSongPair = useMemo(() => {
        if (!currentPair) return null;
        const song1 = getSongById(currentPair[0]);
        const song2 = getSongById(currentPair[1]);
        return song1 && song2 ? [song1, song2] as [Song, Song] : null;
    }, [currentPair, songsWithImages]);

    const ranking = useMemo(() => {
        const results = rankCentrality(songsWithImages, matchups);
        return results.sort((a, b) => b.score - a.score);
    }, [matchups, songsWithImages]);

    const progress = useMemo(
        () => playedPairs.length / pairs.length,
        [playedPairs.length, pairs.length]
    );

    const handleVote = (winner: string, loser: string) => {
        setMatchups((prev) => [...prev, { winner, loser }]);
        setPlayedPairs((prev) => [...prev, [winner, loser]]);
    };

    return {
        currentPair: currentSongPair,
        ranking,
        progress,
        completedMatchups: playedPairs.length,
        totalMatchups: pairs.length,
        remainingMatchups: pairs.length - playedPairs.length,
        handleVote,
        isComplete: currentPair === null,
        imagesLoading,
        songs: songsWithImages,
        setSongs,
    };
}
