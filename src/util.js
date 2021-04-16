import { logout, refreshAccessToken } from './actions/account/accountActions';
import { refreshSpotifyAuthToken } from './actions/spotify/spotifyActions';

/**
 * Converts the duration in milliseconds from Spotify's API into a human-readable length formatted in MM:ss.
 * @param duration {Number} - Song duration in milliseconds.
 * @returns {string} - Human-readable length
 */
export const formatSongLength = (duration) => {
  const minutes = Math.floor(duration / 60000);
  let seconds = ((duration % 60000) / 1000).toFixed(0);
  if (seconds < 10) seconds = '0' + seconds;
  return `${minutes}:${seconds}`;
};

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
      await refreshAccessToken(dispatch, wave.refreshToken);
    }

    if (spotifyTokenExpired(spotify.accessTokenExpiresAt)) {
      await refreshSpotifyAuthToken(dispatch, spotify.refreshToken);
    }
  }
}
