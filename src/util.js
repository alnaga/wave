import { logout, refreshAccessToken } from './actions/account/accountActions';
import { refreshSpotifyAuthToken } from './actions/spotify/spotifyActions';

/**
 * Returns whether or not the Wave API token has expired.
 * @param expiration - Wave API Token Expiration
 * @returns {boolean} - Whether the Wave API token has expired.
 */
export const tokenExpired = (expiration) => {
  return expiration < new Date().toISOString();
}

/**
 * Returns whether the Spotify API token has expired.
 * @param expiration - Spotify API Token Expiration
 * @returns {boolean} - Whether the Spotify API token has expired.
 */
export const spotifyTokenExpired = (expiration) => {
  return expiration < Date.now();
};

/**
 * Checks to see if either API token has expired and refreshes those which have.
 * If the refresh token has expired, the user is logged out.
 * @param dispatch - Application Dispatch
 * @param tokens - Tokens object containing the Wave and Spotify token objects.
 */
export const refreshExpiredTokens = async (dispatch, tokens) => {
  const { spotify, wave } = tokens;
  
  if (tokenExpired(wave.refreshTokenExpiresAt)) {
    await logout(dispatch);
  } else {
    if (tokenExpired(wave.accessTokenExpiresAt)) {
      console.log('wave expired');
      await refreshAccessToken(dispatch, wave.refreshToken);
    }

    if (spotifyTokenExpired(spotify.accessTokenExpiresAt)) {
      await refreshSpotifyAuthToken(dispatch, spotify.refreshToken);
    }
  }
}
