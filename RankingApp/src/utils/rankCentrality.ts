import type { Matchup } from "../types";

/**
 * Implements the Rank Centrality algorithm for ranking items based on pairwise comparisons
 * @param items - Array of items to rank
 * @param matchups - Array of matchup results with winners and losers
 * @returns Array of items with their ranking scores, sorted by score (descending)
 */
export function rankCentrality(
    items: string[],
    matchups: Matchup[]
): { song: string; score: number }[] {
    const n = items.length;
    const idx = Object.fromEntries(
        items.map((item: string, i: number) => [item, i])
    );

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

    return items.map((item: string, i: number) => ({
        song: item,
        score: v[i],
    }));
}
