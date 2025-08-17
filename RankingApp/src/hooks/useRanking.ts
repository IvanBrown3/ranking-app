import { useState, useMemo, useCallback } from "react";
import type { Matchup, Pair, Song, RankingItem } from "../types";
import { rankCentrality, getAllPairs, getRandomPair } from "../utils";
import { SONGS } from "../constants/songs";
import useSongImages from "./useSongImages";

export function useRanking() {
    const [songs, setSongs] = useState<Song[]>(SONGS);
    const [matchups, setMatchups] = useState<Matchup[]>([]);
    const [playedPairs, setPlayedPairs] = useState<Pair[]>([]);
    // Map of songId -> locked index (0-based). If a songId exists in this map, it's locked.
    const [lockedPositions, setLockedPositions] = useState<Record<string, number>>({});
    // Manual display order for unlocked items (array of song ids). If null, no manual ordering.
    const [manualOrder, setManualOrder] = useState<string[] | null>(null);
    
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

    // Base algorithmic ranking (without locks applied)
    const baseRanking = useMemo(() => {
        const results = rankCentrality(songsWithImages, matchups);
        return results.sort((a, b) => b.score - a.score);
    }, [matchups, songsWithImages]);

    // Apply manual order (if any) and locks to get the final displayed ranking
    const ranking: RankingItem[] = useMemo(() => {
        const n = songsWithImages.length;
        if (n === 0) return [];

        // 0) Start from baseRanking; optionally re-order by manualOrder for unlocked items
        let ordered: RankingItem[] = baseRanking;
        if (manualOrder && manualOrder.length) {
            const byId: Record<string, RankingItem> = Object.fromEntries(baseRanking.map(r => [r.song.id, r]));
            const seen = new Set<string>();
            const manualItems: RankingItem[] = [];
            // Respect manual order only for ids present
            for (const id of manualOrder) {
                if (byId[id] && !seen.has(id)) {
                    manualItems.push(byId[id]);
                    seen.add(id);
                }
            }
            // Append any remaining items not in manualOrder
            for (const r of baseRanking) {
                if (!seen.has(r.song.id)) manualItems.push(r);
            }
            ordered = manualItems;
        }

        // 1) Start with an array of empty slots
        const finalOrder: (RankingItem | null)[] = Array(n).fill(null);

        // Place locked songs first at their locked indices
        // If indices are out of bounds, clamp them
        const clamp = (idx: number) => Math.max(0, Math.min(n - 1, idx));
        Object.entries(lockedPositions).forEach(([songId, pos]) => {
            const clamped = clamp(pos);
            const item = ordered.find(r => r.song.id === songId);
            if (item) {
                finalOrder[clamped] = item;
            }
        });

        // 2) Fill remaining slots with the remaining songs in current ordered list
        for (const item of ordered) {
            if (finalOrder.includes(item)) continue; // already placed
            // find next empty slot
            const idx = finalOrder.findIndex(x => x === null);
            if (idx !== -1) finalOrder[idx] = item;
        }

        // Type guard: replace nulls with remaining items if any (shouldn't happen)
        return finalOrder.filter(Boolean) as RankingItem[];
    }, [baseRanking, lockedPositions, manualOrder, songsWithImages.length]);

    const progress = useMemo(
        () => playedPairs.length / pairs.length,
        [playedPairs.length, pairs.length]
    );

    const handleVote = (winner: string, loser: string) => {
        setMatchups((prev) => [...prev, { winner, loser }]);
        setPlayedPairs((prev) => [...prev, [winner, loser]]);
    };

    // Helpers for lock/swap interactions
    const isLocked = useCallback((songId: string) => songId in lockedPositions, [lockedPositions]);

    const toggleLock = useCallback((songId: string) => {
        const wasLocked = songId in lockedPositions;
        if (wasLocked) {
            // Unlock: remove lock and clear manual order so item repositions by rank centrality
            setLockedPositions(prev => {
                const next = { ...prev };
                delete next[songId];
                return next;
            });
            // Remove only this song from manualOrder so it follows baseRanking; keep other manual placements
            setManualOrder(prev => (prev ? prev.filter(id => id !== songId) : prev));
        } else {
            // Lock at current displayed index
            const idx = ranking.findIndex(r => r.song.id === songId);
            if (idx !== -1) {
                setLockedPositions(prev => ({ ...prev, [songId]: idx }));
            }
        }
    }, [lockedPositions, ranking]);

    // Lock a song at a specific index
    const lockAtPosition = useCallback((songId: string, index: number) => {
        setLockedPositions(prev => ({ ...prev, [songId]: index }));
    }, []);

    // Reorder via drag and drop visually without locking.
    const reorder = useCallback((fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const fromItem = ranking[fromIndex];
        if (!fromItem) return;
        // Do not allow reordering if target position's item is locked; UI should already prevent this.
        setManualOrder(prev => {
            const base = prev && prev.length === ranking.length ? [...prev] : ranking.map(r => r.song.id);
            const [moved] = base.splice(fromIndex, 1);
            base.splice(toIndex, 0, moved);
            return base;
        });
    }, [ranking]);

    // Swap two items visually without locking; ignores swaps if either is locked
    const swap = useCallback((i: number, j: number) => {
        if (i === j) return;
        const a = ranking[i];
        const b = ranking[j];
        if (!a || !b) return;
        // Do not swap if either is locked
        if (isLocked(a.song.id) || isLocked(b.song.id)) return;
        setManualOrder(prev => {
            const base = prev && prev.length === ranking.length ? [...prev] : ranking.map(r => r.song.id);
            const tmp = base[i];
            base[i] = base[j];
            base[j] = tmp;
            return base;
        });
    }, [ranking, isLocked]);

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
        // Lock/swap API
        lockedPositions,
        isLocked,
        toggleLock,
        lockAtPosition,
        reorder,
        swap,
    };
}
