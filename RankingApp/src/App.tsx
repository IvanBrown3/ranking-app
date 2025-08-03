import { useEffect, useState } from "react";
import "./App.css";
import PairwiseArena from "./components/PairwiseArena";
import RankingList from "./components/RankingList";
import SpotifySignIn from "./components/SpotifySignIn";
import { useRanking } from "./hooks/useRanking";
import { SPOTIFY_THEME } from "./constants/theme";

function App() {
    const { currentPair, ranking, progress, completedMatchups, totalMatchups, remainingMatchups, handleVote } = useRanking();
    const [authMessage, setAuthMessage] = useState<string | null>(null);

    useEffect(() => {
        // Handle URL parameters for authentication feedback
        const urlParams = new URLSearchParams(window.location.search);
        const authStatus = urlParams.get('auth');
        const error = urlParams.get('error');

        if (authStatus === 'success') {
            setAuthMessage('Successfully connected to Spotify!');
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            // Clear message after 3 seconds
            setTimeout(() => setAuthMessage(null), 3000);
        } else if (error) {
            const errorMessages: { [key: string]: string } = {
                'auth_failed': 'Spotify authentication failed. Please try again.',
                'callback_failed': 'Authentication callback failed. Please try again.',
                'no_code': 'No authorization code received. Please try again.'
            };
            setAuthMessage(errorMessages[error] || 'Authentication error occurred.');
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            // Clear message after 5 seconds for errors
            setTimeout(() => setAuthMessage(null), 5000);
        }
    }, []);

    return (
        <div
            className="flex min-h-screen w-full relative"
            style={{ background: SPOTIFY_THEME.black }}>
            {/* Authentication Message */}
            {authMessage && (
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium ${
                    authMessage.includes('Successfully') 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                }`}>
                    {authMessage}
                </div>
            )}
            
            {/* Spotify Sign-in Button - Absolute positioned overlay */}
            <div className="absolute top-4 right-4 z-50">
                <SpotifySignIn />
            </div>
            
            <PairwiseArena currentPair={currentPair} onVote={handleVote} />
            <RankingList 
                ranking={ranking} 
                progress={progress} 
                completedMatchups={completedMatchups}
                totalMatchups={totalMatchups}
                remainingMatchups={remainingMatchups}
            />
        </div>
    );
}

export default App;
