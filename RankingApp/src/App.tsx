import React from "react";
import "./App.css";
import PairwiseArena from "./components/PairwiseArena";
import RankingList from "./components/RankingList";
import { useRanking } from "./hooks/useRanking";
import { SPOTIFY_THEME } from "./constants/theme";

function App() {
    const { currentPair, ranking, handleVote } = useRanking();

    return (
        <div
            className="flex min-h-screen w-full"
            style={{ background: SPOTIFY_THEME.black }}>
            <PairwiseArena currentPair={currentPair} onVote={handleVote} />
            <RankingList ranking={ranking} />
        </div>
    );
}

export default App;
