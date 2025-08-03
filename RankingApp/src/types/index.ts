export type Matchup = { winner: string; loser: string };

export type Pair = [string, string];

export interface RankingItem {
    song: Song;
    score: number;
}

export interface Song {
    id: string;
    name: string;
    artist: string;
    spotifyId: string;
    uri: string;
    imageUrl?: string;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        images: Array<{ url: string; height: number; width: number }>;
    };
    uri: string;
}
