# Spotify OAuth Integration Setup

## Prerequisites

1. **Spotify Developer Account**: Create an account at [Spotify for Developers](https://developer.spotify.com/)
2. **Spotify Premium**: Required for Web Playback SDK functionality

## Spotify App Configuration

1. Go to your [Spotify Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or edit your existing app
3. In the app settings, add the following redirect URI:
   ```
   http://127.0.0.1:5173/callback
   ```
4. Note down your Client ID and Client Secret

## Environment Variables

Create a `.env` file in the project root with:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

**Note**: The client secret is not used in the frontend OAuth PKCE flow but may be needed for future server-side operations.

## How It Works

### OAuth Flow
1. User clicks "Sign in with Spotify"
2. Redirects to Spotify authorization page
3. User grants permissions
4. Spotify redirects back to `http://127.0.0.1:5173/callback`
5. App exchanges authorization code for access token using PKCE
6. User profile is fetched and stored
7. User is redirected back to main app

### Features
- **PKCE Flow**: Secure OAuth without exposing client secret
- **Token Management**: Automatic refresh of expired tokens
- **Persistent Sessions**: Tokens stored in localStorage
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Visual feedback during authentication

### Required Scopes
- `streaming`: Play music through Web Playback SDK
- `user-read-email`: Access user email
- `user-read-private`: Access user profile
- `user-read-playback-state`: Read current playback state
- `user-modify-playback-state`: Control playback

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The app will be available at `http://127.0.0.1:5173`

3. Click the "Sign in with Spotify" button to test authentication

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**
   - Ensure the redirect URI in Spotify app settings exactly matches: `http://127.0.0.1:5173/callback`
   - Use `127.0.0.1` not `localhost`

2. **Missing Environment Variables**
   - Check that `.env` file exists and contains valid Spotify credentials
   - Restart the development server after adding environment variables

3. **Authentication Errors**
   - Check browser console for detailed error messages
   - Verify Spotify app permissions and settings

4. **Token Refresh Issues**
   - Clear localStorage and re-authenticate if tokens become corrupted
   - Check that refresh token is properly stored

### Debug Mode

To enable debug logging, add this to your browser console:
```javascript
localStorage.setItem('spotify_debug', 'true');
```

## Security Notes

- Client secret is not used in frontend (PKCE flow)
- Tokens are stored in localStorage (consider more secure storage for production)
- Always use HTTPS in production environments
- Regularly rotate Spotify app credentials
