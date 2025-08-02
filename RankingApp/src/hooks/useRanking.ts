import { useState, useMemo } from "react";
import type { Matchup, Pair } from "../types";
import { rankCentrality, getAllPairs, getRandomPair } from "../utils";
import { SONGS } from "../constants/songs";

export function useRanking() {
    const [matchups, setMatchups] = useState<Matchup[]>([]);
    const [playedPairs, setPlayedPairs] = useState<Pair[]>([]);

    const pairs = useMemo(() => getAllPairs(SONGS), []);
    const currentPair = useMemo(
        () => getRandomPair(pairs, playedPairs),
        [pairs, playedPairs]
    );

    const ranking = useMemo(() => {
        const results = rankCentrality(SONGS, matchups);
        return results.sort((a, b) => b.score - a.score);
    }, [matchups]);

    const progress = useMemo(
        () => playedPairs.length / pairs.length,
        [playedPairs.length, pairs.length]
    );

    const handleVote = (winner: string, loser: string) => {
        setMatchups((prev) => [...prev, { winner, loser }]);
        setPlayedPairs((prev) => [...prev, [winner, loser]]);
    };

    return {
        currentPair,
        ranking,
        progress,
        completedMatchups: playedPairs.length,
        totalMatchups: pairs.length,
        remainingMatchups: pairs.length - playedPairs.length,
        handleVote,
        isComplete: currentPair === null,
    };
}
