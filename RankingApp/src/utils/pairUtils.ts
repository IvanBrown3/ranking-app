import type { Pair } from "../types";

/**
 * Generates all unique pairs from an array of items
 * @param items - Array of items to generate pairs from
 * @returns Array of unique pairs
 */
export function getAllPairs(items: string[]): Pair[] {
    const pairs: Pair[] = [];
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            pairs.push([items[i], items[j]]);
        }
    }
    return pairs;
}

/**
 * Gets a random unplayed pair from the available pairs
 * @param pairs - All possible pairs
 * @param played - Already played pairs
 * @returns A random unplayed pair or null if all pairs have been played
 */
export function getRandomPair(pairs: Pair[], played: Pair[]): Pair | null {
    const unplayed = pairs.filter(
        ([a, b]) =>
            !played.some(
                ([x, y]) => (x === a && y === b) || (x === b && y === a)
            )
    );
    if (unplayed.length === 0) return null;
    return unplayed[Math.floor(Math.random() * unplayed.length)];
}
