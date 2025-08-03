import { type SpotifyTrack } from '../types';

interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; height: number; width: number }>;
  country: string;
  product: string;
}

class SpotifyService {
  private clientId: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    
    // Use the specific redirect URI as required
    this.redirectUri = 'http://127.0.0.1:5173/callback';
    
    // Load stored tokens
    this.loadStoredTokens();
  }

  private loadStoredTokens(): void {
    const storedToken = localStorage.getItem('spotify_access_token');
    const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
    const storedExpiry = localStorage.getItem('spotify_token_expiry');

    if (storedToken && storedExpiry) {
      this.accessToken = storedToken;
      this.refreshToken = storedRefreshToken;
      this.tokenExpiry = parseInt(storedExpiry, 10);
    }
  }

  private storeTokens(authResponse: SpotifyAuthResponse): void {
    this.accessToken = authResponse.access_token;
    this.refreshToken = authResponse.refresh_token || null;
    this.tokenExpiry = Date.now() + (authResponse.expires_in * 1000);

    localStorage.setItem('spotify_access_token', this.accessToken);
    if (this.refreshToken) {
      localStorage.setItem('spotify_refresh_token', this.refreshToken);
    }
    localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async initiateAuth(): Promise<void> {
    if (!this.clientId) {
      throw new Error('Spotify Client ID not configured');
    }

    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    
    // Store code verifier for later use
    localStorage.setItem('spotify_code_verifier', codeVerifier);

    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: scopes,
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    window.location.href = authUrl;
  }

  async handleAuthCallback(code: string): Promise<SpotifyAuthResponse> {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
    }

    const authResponse: SpotifyAuthResponse = await response.json();
    this.storeTokens(authResponse);
    
    // Clean up code verifier
    localStorage.removeItem('spotify_code_verifier');
    
    return authResponse;
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
    }

    const authResponse: SpotifyAuthResponse = await response.json();
    // Preserve existing refresh token if not provided
    if (!authResponse.refresh_token) {
      authResponse.refresh_token = this.refreshToken;
    }
    this.storeTokens(authResponse);
  }

  async getValidAccessToken(): Promise<string | null> {
    if (!this.accessToken) {
      return null;
    }

    // Check if token is expired (with 5 minute buffer)
    if (this.tokenExpiry && Date.now() > (this.tokenExpiry - 300000)) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        this.logout();
        return null;
      }
    }

    return this.accessToken;
  }

  async getUserProfile(): Promise<SpotifyUserProfile | null> {
    const token = await this.getValidAccessToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && (!this.tokenExpiry || Date.now() < this.tokenExpiry);
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_code_verifier');
  }

  async getTrack(trackId: string): Promise<SpotifyTrack | null> {
    const token = await this.getValidAccessToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch track: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching track:', error);
      return null;
    }
  }

  async getTracks(trackIds: string[]): Promise<SpotifyTrack[]> {
    const token = await this.getValidAccessToken();
    if (!token) {
      return [];
    }

    try {
      // Spotify API allows up to 50 tracks per request
      const chunks = [];
      for (let i = 0; i < trackIds.length; i += 50) {
        chunks.push(trackIds.slice(i, i + 50));
      }

      const allTracks: SpotifyTrack[] = [];
      
      for (const chunk of chunks) {
        const response = await fetch(`https://api.spotify.com/v1/tracks?ids=${chunk.join(',')}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch tracks: ${response.status}`);
        }

        const data = await response.json();
        allTracks.push(...data.tracks.filter((track: SpotifyTrack | null) => track !== null));
      }

      return allTracks;
    } catch (error) {
      console.error('Error fetching tracks:', error);
      return [];
    }
  }

  getRedirectUri(): string {
    return this.redirectUri;
  }
}

export default SpotifyService;
