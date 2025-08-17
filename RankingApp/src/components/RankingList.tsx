import React from "react";
import { SPOTIFY_THEME } from "../constants/theme";
import type { RankingItem } from "../types";

interface RankingListProps {
    ranking: RankingItem[];
    progress: number;
    completedMatchups: number;
    totalMatchups: number;
    remainingMatchups: number;
    // Lock/Swap/Drag API
    isLocked: (songId: string) => boolean;
    onToggleLock: (songId: string) => void;
    onReorder: (fromIndex: number, toIndex: number) => void; // drag reorder (non-locking)
    onSwap: (i: number, j: number) => void; // swap (non-locking)
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
        maxWidth: "28rem", // Increased from implicit constraint
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
        maxWidth: "24rem", // Increased from 20rem
        listStyle: "none",
        padding: "0 1rem", // Add horizontal padding to prevent clipping on scale
        maxHeight: 'calc(100vh - 250px)', // Adjust based on other elements' height
        overflowY: 'auto',
    },
    listItemBase: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1rem", // Increased padding
        marginBottom: "0.5rem", // Increased margin
        borderRadius: "0.5rem",
        transition: "transform 0.2s ease-in-out",
    },
    songText: {
        fontWeight: 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontSize: "0.9rem",
    },
    artistText: {
        fontSize: '0.7rem',
        color: 'rgba(255, 255, 255, 0.7)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    scoreText: {
        fontSize: "0.725rem",
        lineHeight: "1.25rem",
        flexShrink: 0,
    },
    lockButton: {
        marginLeft: "0.5rem",
        padding: "0.25rem 0.5rem",
        borderRadius: "6px",
        border: "none",
        background: "transparent",
        color: "white",
        fontSize: "0.75rem",
        cursor: "pointer",
    },
    lockIcon: {
        width: "16px",
        height: "16px",
        display: "block",
    },
    progressContainer: {
        marginBottom: "1.5rem", // Increased margin
        width: "100%",
        maxWidth: "24rem", // Increased from 20rem
        marginLeft: "auto",
        marginRight: "auto",
        padding: "1.25rem", // Increased padding
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
    dragHint: {
        color: "rgba(255,255,255,0.7)",
        fontSize: "0.7rem",
        marginTop: "0.25rem",
        marginBottom: "0.5rem",
        textAlign: "center" as const,
    },
} as const; // <-- This is the fix

const RankingList: React.FC<RankingListProps> = ({ ranking, progress, completedMatchups, totalMatchups, remainingMatchups, isLocked, onToggleLock, onReorder, onSwap }) => {
    // Add CSS animation keyframes
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            /* Custom Scrollbar Styles */
            ::-webkit-scrollbar {
                width: 8px;
            }

            ::-webkit-scrollbar-track {
                background: ${SPOTIFY_THEME.black};
            }

            ::-webkit-scrollbar-thumb {
                background: #555;
                border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: #888;
            }

            /* Larger monitors: widen the ranking list container beyond 1/3 */
            @media screen and (min-width: 1920px) and (min-height: 1080px) {
                .ranking-list-container {
                    width: 45% !important; /* reduced to give space back to arena */
                }

                /* Expand inner content widths so the extra space is used */
                .ranking-list-content {
                    max-width: 40rem !important; /* reduced to match narrower container */
                    margin-left: auto !important; /* flush to right */
                    margin-right: 0 !important;
                }

                .ranking-list-list,
                .ranking-list-progress {
                    max-width: 36rem !important; /* reduced to match narrower container */
                    margin-left: auto !important; /* flush to right */
                    margin-right: 0 !important;
                }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Drag state
    const dragIndexRef = React.useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

    return (
        <div className="ranking-list-container" style={styles.container}>
            <div className="ranking-list-content" style={styles.contentWrapper}>
                
                {/* Progress Bar */}
                <div className="ranking-list-progress" style={styles.progressContainer}>
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
                <div style={styles.dragHint}>Drag to reorder (does not lock). Click 🔒 to lock. Hold Shift and drop to swap (non-locking).</div>
                <ol className="ranking-list-list" style={styles.list}>
                    {ranking.map(({ song, score }, i) => {
                        const isTopRanked = i === 0;
                        const locked = isLocked(song.id);

                        const listItemStyle: React.CSSProperties = {
                            // Explicitly typing here is also good practice
                            ...styles.listItemBase,
                            background: isTopRanked
                                ? SPOTIFY_THEME.green
                                : SPOTIFY_THEME.gray,
                            color: isTopRanked
                                ? SPOTIFY_THEME.black
                                : "#FFFFFF",
                            transform: isTopRanked ? "scale(1.05)" : (dragOverIndex === i ? "scale(1.02)" : "scale(1)"),
                            zIndex: isTopRanked ? 10 : 1,
                            opacity: locked ? 0.9 : 1,
                            border: dragOverIndex === i ? "2px dashed rgba(255,255,255,0.5)" : "none",
                        };

                        return (
                            <li
                                key={song.id}
                                style={listItemStyle}
                                draggable={!locked}
                                onDragStart={(e) => {
                                    if (locked) { e.preventDefault(); return; }
                                    dragIndexRef.current = i;
                                    e.dataTransfer.effectAllowed = "move";
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (dragOverIndex !== i) setDragOverIndex(i);
                                }}
                                onDragLeave={() => setDragOverIndex((prev) => (prev === i ? null : prev))}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const from = dragIndexRef.current;
                                    const to = i;
                                    setDragOverIndex(null);
                                    dragIndexRef.current = null;
                                    if (from === null || to === null || from === to) return;
                                    // If target item is locked and not swapping, do nothing
                                    if (!e.shiftKey && isLocked(song.id)) {
                                        return;
                                    }
                                    if (e.shiftKey) {
                                        onSwap(from, to);
                                    } else {
                                        onReorder(from, to);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3 flex-grow min-w-0">
                                    {song.imageUrl && (
                                        <img 
                                            src={song.imageUrl} 
                                            alt={`${song.name} album art`}
                                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <div style={styles.songText}>
                                            {i + 1}. {song.name}
                                        </div>
                                        <div style={styles.artistText}>
                                            {song.artist}
                                        </div>
                                    </div>
                                </div>
                                <span style={styles.scoreText}>
                                    {score.toFixed(3)}
                                </span>
                                <button
                                    style={styles.lockButton}
                                    onClick={() => onToggleLock(song.id)}
                                    title={locked ? "Unlock" : "Lock at this position"}
                                >
                                    <svg
                                        style={styles.lockIcon}
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        {/* Shackle */}
                                        <path
                                            d="M7 10V8a5 5 0 1110 0v2"
                                            fill="none"
                                            stroke="#FFFFFF"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {/* Body */}
                                        <rect
                                            x="5"
                                            y="10"
                                            width="14"
                                            height="10"
                                            rx="2"
                                            ry="2"
                                            stroke="#FFFFFF"
                                            strokeWidth="2"
                                            fill={locked ? "#FFFFFF" : "transparent"}
                                            style={{ transition: "fill 200ms ease" }}
                                        />
                                    </svg>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
};

export default RankingList;
