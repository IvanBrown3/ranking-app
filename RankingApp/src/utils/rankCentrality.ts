import type { Matchup, Song } from "../types";

/**
 * Implements an improved Rank Centrality algorithm for ranking items.
 * This version gives more weight to earlier wins and uses a PageRank-style
 * calculation where winning against highly-ranked items boosts an item's score.
 * @param items - Array of items to rank
 * @param matchups - Array of matchup results with winners and losers
 * @returns Array of items with their ranking scores, sorted by score (descending)
 */
export function rankCentrality(
    items: Song[],
    matchups: Matchup[]
): { song: Song; score: number }[] {
    const n = items.length;
    if (n === 0) {
        return [];
    }
    const idx = Object.fromEntries(
        items.map((item: Song, i: number) => [item.id, i])
    );

    // 1. Build a weighted win matrix (W).
    // W[i][j] stores the total weight of wins of item i over item j.
    const W: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    const totalMatchups = matchups.length;
    matchups.forEach(({ winner, loser }: Matchup, i: number) => {
        // Apply a decaying weight to wins. Wins that occur earlier in the `matchups`
        // array are given a higher weight. This causes items selected early in the
        // process to be "jumped up" the ranking list. The weight decays linearly.
        const weight = totalMatchups - i;
        W[idx[winner]][idx[loser]] += weight;
    });

    // 2. Build a column-stochastic transition matrix (P).
    // P[i][j] is the probability of transitioning from item j to item i.
    // This transition represents a "vote" from the loser (j) to the winner (i).
    const P: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    const dampingFactor = 0.85; // Standard PageRank damping factor

    for (let j = 0; j < n; j++) { // For each item j (column)
        let totalLossWeight = 0;
        for (let i = 0; i < n; i++) {
            totalLossWeight += W[i][j];
        }

        for (let i = 0; i < n; i++) {
            if (totalLossWeight > 0) {
                // Standard transition: based on weighted wins.
                P[i][j] = W[i][j] / totalLossWeight;
            } else {
                // Handle undefeated items (rank sinks): assume they link to all other items equally.
                P[i][j] = 1 / n;
            }
        }
    }

    // 3. Power iteration to find the principal eigenvector (the ranking scores).
    // This is analogous to Google's PageRank algorithm.
    let v: number[] = Array.from({ length: n }, () => 1 / n); // Initial guess
    
    for (let iter = 0; iter < 100; iter++) {
        const vNew: number[] = Array(n).fill(0);
        for (let i = 0; i < n; i++) { // For each item i
            for (let j = 0; j < n; j++) { // Sum contributions from items j that lost to i
                vNew[i] += v[j] * P[i][j];
            }
        }
        
        // Normalize and apply damping factor
        const norm = vNew.reduce((a, b) => a + b, 0) || 1;
        for (let i = 0; i < n; i++) {
            const teleport = (1 - dampingFactor) / n;
            v[i] = dampingFactor * (vNew[i] / norm) + teleport;
        }
    }

    const results = items.map((item: Song, i: number) => ({
        song: item,
        score: v[i],
    }));

    // 4. Sort results by score in descending order
    results.sort((a, b) => b.score - a.score);

    return results;
}