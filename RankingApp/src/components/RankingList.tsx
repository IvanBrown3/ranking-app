import React from "react";
import { SPOTIFY_THEME } from "../constants/theme";
import type { RankingItem } from "../types";

interface RankingListProps {
    ranking: RankingItem[];
}

const RankingList: React.FC<RankingListProps> = ({ ranking }) => {
    return (
        <div
            className="flex-1 w-1/3 flex items-center justify-center shadow-lg"
            style={{ background: SPOTIFY_THEME.black }}>
            <div className="text-center w-full">
                <h2
                    className="text-3xl font-bold mb-4"
                    style={{ color: SPOTIFY_THEME.accent }}>
                    Ranking List
                </h2>
                <ol className="text-left mx-auto max-w-xs">
                    {ranking.map(({ song, score }, i) => (
                        <li
                            key={song}
                            className="flex justify-between items-center py-2 px-4 mb-2 rounded-lg"
                            style={{
                                background:
                                    i === 0
                                        ? SPOTIFY_THEME.green
                                        : SPOTIFY_THEME.gray,
                                color: i === 0 ? SPOTIFY_THEME.black : "#fff",
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
    );
};

export default RankingList;
