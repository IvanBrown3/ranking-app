import React from "react";
import { SPOTIFY_THEME } from "../constants/theme";
import type { RankingItem } from "../types";

interface RankingListProps {
    ranking: RankingItem[];
    progress: number;
    completedMatchups: number;
    totalMatchups: number;
    remainingMatchups: number;
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
        padding: "1rem 1rem",
    },
    title: {
        fontSize: "1.5rem",
        lineHeight: "2rem",
        fontWeight: 700,
        marginBottom: "1rem",
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
        padding: "0.5rem 0.75rem",
        marginBottom: "0.375rem",
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
    progressContainer: {
        marginBottom: "1rem",
        width: "100%",
        maxWidth: "20rem",
        marginLeft: "auto",
        marginRight: "auto",
        padding: "1rem",
        background: "linear-gradient(135deg, rgba(29, 185, 84, 0.1) 0%, rgba(29, 185, 84, 0.05) 100%)",
        borderRadius: "12px",
        border: "1px solid rgba(29, 185, 84, 0.2)",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    },
    progressLabel: {
        color: "white",
        fontSize: "0.8rem",
        marginBottom: "0.75rem",
        textAlign: "center",
        fontWeight: 600,
        textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
        letterSpacing: "0.5px",
    },
    progressStats: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.7rem",
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: "0.5rem",
        fontWeight: 500,
    },
    progressBarBackground: {
        width: "100%",
        height: "8px",
        background: "linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        borderRadius: "10px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
    },
    progressBarFill: {
        height: "100%",
        background: "linear-gradient(90deg, #1ed760 0%, #1db954 50%, #1ed760 100%)",
        borderRadius: "10px",
        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        boxShadow: "0 0 10px rgba(29, 215, 96, 0.4)",
    },
    progressBarGlow: {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
        borderRadius: "10px",
        animation: "shimmer 2s infinite linear",
    },
} as const; // <-- This is the fix

const RankingList: React.FC<RankingListProps> = ({ ranking, progress, completedMatchups, totalMatchups, remainingMatchups }) => {
    // Add CSS animation keyframes
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <h2 style={styles.title}>Ranking List</h2>
                
                {/* Progress Bar */}
                <div style={styles.progressContainer}>
                    <div style={styles.progressLabel as React.CSSProperties}>
                        Matchup Progress
                    </div>
                    <div style={styles.progressStats as React.CSSProperties}>
                        <span>Completed: {completedMatchups}</span>
                        <span>Remaining: {remainingMatchups}</span>
                    </div>
                    <div style={styles.progressBarBackground}>
                        <div 
                            style={{
                                ...styles.progressBarFill,
                                width: `${progress * 100}%`
                            }}
                        >
                            <div style={styles.progressBarGlow as React.CSSProperties} />
                        </div>
                    </div>
                </div>
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
