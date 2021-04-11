import { refreshAccessToken } from './actions/account/accountActions';
import { refreshSpotifyAuthToken } from './actions/spotify/spotifyActions';

/**
 * Returns whether or not the Wave API token has expired.
 * @param expiration - Wave API Token Expiration
 * @returns {boolean} - Whether the Wave API token has expired.
 */
export const accessTokenExpired = (expiration) => {
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
 * @param dispatch - Application Dispatch
 * @param tokens - Tokens object containing the Wave and Spotify token objects.
 */
export const refreshExpiredTokens = async (dispatch, tokens) => {
  const { spotify, wave } = tokens;

  if (accessTokenExpired(wave.accessTokenExpiresAt)) {
    await refreshAccessToken(dispatch, wave.refreshToken);
  }

  if (spotifyTokenExpired(spotify.accessTokenExpiresAt)) {
    await refreshSpotifyAuthToken(dispatch, spotify.refreshToken);
  }
}
