import React from "react";
import { SPOTIFY_THEME } from "../constants/theme";
import type { RankingItem } from "../types";

interface RankingListProps {
    ranking: RankingItem[];
}

// The 'as const' assertion here is the fix.
// It tells TypeScript to infer the most specific possible types for these properties.
const styles = {
    container: {
        flex: "1 1 0%",
        width: "33.333333%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        background: SPOTIFY_THEME.black,
    },
    contentWrapper: {
        textAlign: "center",
        width: "100%",
        padding: "2rem 1rem",
    },
    title: {
        fontSize: "1.875rem",
        lineHeight: "2.25rem",
        fontWeight: 700,
        marginBottom: "1.5rem",
        color: "White",
    },
    list: {
        textAlign: "left",
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: "20rem",
        listStyle: "none",
        padding: 0,
    },
    listItemBase: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1rem",
        marginBottom: "0.5rem",
        borderRadius: "0.5rem",
        transition: "transform 0.2s ease-in-out",
    },
    songText: {
        fontWeight: 600,
        marginRight: "1rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    scoreText: {
        fontSize: "0.875rem",
        lineHeight: "1.25rem",
        flexShrink: 0,
    },
} as const; // <-- This is the fix

const RankingList: React.FC<RankingListProps> = ({ ranking }) => {
    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <h2 style={styles.title}>Ranking List</h2>
                <ol style={styles.list}>
                    {ranking.map(({ song, score }, i) => {
                        const isTopRanked = i === 0;

                        const listItemStyle: React.CSSProperties = {
                            // Explicitly typing here is also good practice
                            ...styles.listItemBase,
                            background: isTopRanked
                                ? SPOTIFY_THEME.green
                                : SPOTIFY_THEME.gray,
                            color: isTopRanked
                                ? SPOTIFY_THEME.black
                                : "#FFFFFF",
                            transform: isTopRanked ? "scale(1.05)" : "scale(1)",
                        };

                        return (
                            <li key={song} style={listItemStyle}>
                                <span style={styles.songText}>
                                    {i + 1}. {song}
                                </span>
                                <span style={styles.scoreText}>
                                    {score.toFixed(3)}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
};

export default RankingList;
