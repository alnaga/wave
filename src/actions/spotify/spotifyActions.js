import axios from 'axios';

import {
  SET_CURRENTLY_PLAYING,
  SET_DEVICES,
  SET_SEARCH_RESULTS,
  SET_SPOTIFY_TOKENS,
  SET_VENUE,
  TOKENS_EXPIRED
} from '../../constants';

/**
 * Queries the Wave API to communicate with Spotify's API to fetch access and refresh tokens
 * using the authorisation code fetched previously.
 * @param dispatch - Application Dispatch
 * @param authCode - Spotify API Authorisation Code
 * @returns 1 if successful, 0 if failed
 */
export const getSpotifyAuthTokens = async (dispatch, authCode) => {
  try {
    const response = await axios.post('http://localhost:8081/spotify/tokens', {
      authCode
    });

    if (response.status === 200) {
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      const lifespan = response.data.expires_in;
      const accessTokenExpiresAt = Date.now() + (lifespan * 1000);

      const spotifyTokens = {
        accessToken,
        accessTokenExpiresAt,
        refreshToken
      };

      sessionStorage.setItem('spotifyTokens', JSON.stringify(spotifyTokens));

      dispatch({
        type: SET_SPOTIFY_TOKENS,
        payload: spotifyTokens
      });

      return 1;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Queries the Wave API to communicate with Spotify's API to fetch a new access token using
 * the refresh token fetched previously.
 * @param dispatch - Application Dispatch
 * @param refreshToken - Spotify API Refresh Token
 * @returns 1 if successful, 0 if failed
 */
export const refreshSpotifyAuthToken = async (dispatch, refreshToken) => {
  try {
    const response = await axios.post('http://localhost:8081/spotify/refresh', {
      refreshToken
    });

    if (response.status === 200) {
      const accessToken = response.data.access_token;
      const lifespan = response.data.expires_in;
      const accessTokenExpiresAt = Date.now() + (lifespan * 1000);

      const newSpotifyTokens = {
        accessToken,
        accessTokenExpiresAt,
        refreshToken
      };

      sessionStorage.setItem('spotifyTokens', JSON.stringify(newSpotifyTokens));

      dispatch({
        type: SET_SPOTIFY_TOKENS,
        payload: newSpotifyTokens
      });

      return newSpotifyTokens;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Queries the Wave API to fetch the list of available playback devices from the Spotify API.
 * @param dispatch - Application Dispatch
 * @param accessToken - Wave API Access Token
 * @param spotifyAccessToken - Spotify API Access Token
 * @returns 1 if successful, 0 if failed
 */
export const getUserDevices = async (dispatch, accessToken, spotifyAccessToken) => {
  const response = await axios.get(`http://localhost:8081/spotify/devices?accessToken=${spotifyAccessToken}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => {
    return error.response;
  });

  if (response.status === 200) {
    dispatch({
      type: SET_DEVICES,
      payload: response.data.devices
    });

    return 1;
  } else if (response.status === 401) {
    return TOKENS_EXPIRED;
  } else return 0;
};

/**
 * Updates the chosen playback device in the Spotify API.
 * @param dispatch - Application Dispatch
 * @param accessToken - Wave API Access Token
 * @param spotifyAccessToken - Spotify API Access Token
 * @param device - The Spotify Device Object
 * @returns 1 if successful, 0 if failed
 */
export const selectUserDevice = async (dispatch, accessToken, spotifyAccessToken, device) => {
  try {
    const response = await axios.put(`http://localhost:8081/spotify/devices?accessToken=${spotifyAccessToken}`, {
      device
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 200) {
      dispatch({
        type: SET_DEVICES,
        payload: []
      });

      return 1;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Carries out a search on the Spotify API for songs matching the user's query and returns the list.
 * @param dispatch - Application Dispatch
 * @param accessToken - Spotify API Access Token
 * @returns 1 if successful, 0 if failed
 */
export const getSongSearchResults = (dispatch, accessToken) => async (query) => {
  try {
    // If the user has not input a query, the request to the API is not made.
    if (!query) {
      return 0;
    }

    const response = await axios.get(`http://localhost:8081/spotify/search?accessToken=${accessToken}&query=${query}`);

    if (response.status === 200) {
      const results = response.data;

      dispatch({
        type: SET_SEARCH_RESULTS,
        payload: response.data.tracks.items
      });

      return 1;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Gets the currently playing song within a venue.
 * @param dispatch - Application Dispatch
 * @param accessToken - Spotify API Access Token
 * @returns 1 if successful, 0 if failed
 */
export const getCurrentlyPlaying = async (dispatch, accessToken, spotifyAccessToken) => {
  const response = await axios.get(`http://localhost:8081/spotify/song?accessToken=${spotifyAccessToken}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    dispatch({
      type: SET_CURRENTLY_PLAYING,
      payload: response.data
    });

    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else return 0;
};

/**
 * Adds a song to the venue's current queue.
 * @param dispatch - Application Dispatch
 * @param accessToken - Spotify API Access Token
 * @param songUri - The URI of the song to be queued.
 * @returns 1 if successful, 0 if failed
 */
export const queueSong = async (dispatch, accessToken, songUri) => {
  try {
    const response = await axios.post(`http://localhost:8081/spotify/song?accessToken=${accessToken}&uri=${songUri}`);

    if (response.status === 204) {
      return 1;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Submits a vote for the currently playing song in a venue.
 * @param dispatch - Application Dispatch
 * @param accessToken - Spotify API Access Token
 * @param venue - The URI of the target venue
 * @param vote - The vote value (VOTE_UP or VOTE_DOWN).
 * @returns 1 if successful, 0 if failed
 */
export const voteSong = async (dispatch, accessToken, venue, vote) => {
  const response = await axios.post(`http://localhost:8081/spotify/vote?accessToken=${accessToken}`, {
    venue,
    vote
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    dispatch({
      type: SET_VENUE,
      payload: response.data.venue
    });

    const { skipped } = response.data;
    return { skipped };
  } else return 0;
};

/**
 * Fetches the data for the current venue.
 * @param dispatch - Application Dispatch
 * @param accessToken - Spotify API Access Token
 * @returns 1 if successful, 0 if failed
 */
export const getVenue = async (dispatch, accessToken, spotifyAccessToken) => {
  const response = await axios.get(`http://localhost:8081/spotify/venue?accessToken=${spotifyAccessToken}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    dispatch({
      type: SET_VENUE,
      payload: response.data
    });

    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else return 0;
};
