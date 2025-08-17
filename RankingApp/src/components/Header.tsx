import React from 'react';
import { SPOTIFY_THEME } from '../constants/theme';
import SpotifySignIn from './SpotifySignIn';

interface HeaderProps {
    onPlaylistUrlChange: (url: string) => void;
    playlistUrl: string;
}

const Header: React.FC<HeaderProps> = ({ onPlaylistUrlChange, playlistUrl }) => {
    return (
        <header 
            className="w-full py-4 px-6 flex items-center justify-between sticky top-0 z-40"
            style={{
                backgroundColor: SPOTIFY_THEME.black,
                borderBottom: `1px solid ${SPOTIFY_THEME.gray}`,
                height: '72px',
            }}
        >
            <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">
                    Song Ranker
                </h1>
            </div>
            <div className="flex-1 max-w-2xl mx-6">
                <input
                    type="text"
                    value={playlistUrl}
                    onChange={(e) => onPlaylistUrlChange(e.target.value)}
                    placeholder="Paste Spotify playlist URL"
                    className="w-full px-4 py-2 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{
                        backgroundColor: SPOTIFY_THEME.gray,
                    }}
                />
            </div>
            <div className="flex items-center">
                <SpotifySignIn />
            </div>
        </header>
    );
};

export default Header;
