import axios from 'axios';

import {
  SET_ALBUM_INFO,
  SET_ARTIST_INFO,
  SET_CURRENT_SONG,
  SET_DEVICES,
  SET_TRACK_SEARCH_RESULTS,
  SET_SPOTIFY_TOKENS,
  SET_VENUE_INFO,
  TOKENS_EXPIRED
} from '../../constants';

/**
 * Queries the Wave API to communicate with Spotify's API to fetch access and refresh tokens
 * using the authorisation code fetched previously.
 * @param dispatch {Function} - Application Dispatch
 * @param authCode {String} - Spotify API Authorisation Code
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
 * @param dispatch {Function} - Application Dispatch
 * @param refreshToken {String} - Spotify API Refresh Token
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
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API Access Token
 * @param spotifyAccessToken {String} - Spotify API Access Token
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

  if (response && response.status === 200) {
    dispatch({
      type: SET_DEVICES,
      payload: response.data.devices
    });

    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else return 0;
};

/**
 * Updates the chosen playback device in the Spotify API.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API Access Token
 * @param spotifyAccessToken {String} - Spotify API Access Token
 * @param device {Object} - The Spotify Device Object
 * @returns 1 if successful, 0 if failed
 */
export const selectUserDevice = async (dispatch, accessToken, spotifyAccessToken, device) => {
  const response = await axios.put(`http://localhost:8081/spotify/devices?accessToken=${spotifyAccessToken}`, {
    device
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    dispatch({
      type: SET_DEVICES,
      payload: []
    });

    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else return 0;
};

/**
 * Queries the Wave API to fetch information about a given album from the Spotify API.
 * @param dispatch {Function}
 * @param accessToken {String}
 * @param spotifyAccessToken {String}
 * @param albumId {String}
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if one of the access tokens have expired.
 */
export const getAlbumInfo = async (dispatch, accessToken, spotifyAccessToken, albumId) => {
  const response = await axios.get(`http://localhost:8081/spotify/album?accessToken=${spotifyAccessToken}&albumId=${albumId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    dispatch({
      type: SET_ALBUM_INFO,
      payload: response.data
    });

    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else return 0;
};

/**
 * Queries the Wave API to fetch information about a given artist from the Spotify API.
 * @param dispatch {Function}
 * @param accessToken {String}
 * @param spotifyAccessToken {String}
 * @param artistId {String}
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if one of the access tokens have expired.
 */
export const getArtistInfo = async (dispatch, accessToken, spotifyAccessToken, artistId) => {
  const response = await axios.get(`http://localhost:8081/spotify/artist?accessToken=${spotifyAccessToken}&artistId=${artistId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      dispatch({
        type: SET_ARTIST_INFO,
        payload: response.data
      });

      return 1;
    } else if (response.status === 401) {
      return TOKENS_EXPIRED;
    }
  } else {
    return 0;
  }
};

/**
 * Carries out a search on the Spotify API for songs matching the user's query and returns the list.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API Access Token
 * @param spotifyAccessToken {String} - Spotify API Access Token
 * @param query {String} - Search query
 * @returns 1 if successful, 0 if failed
 */
export const getTrackSearchResults = async (dispatch, accessToken, spotifyAccessToken, query) => {
  // If the user has not input a query, the request to the API is not made.
  if (!query) {
    return 0;
  }

  const response = await axios.get(`http://localhost:8081/spotify/search?accessToken=${spotifyAccessToken}&query=${query}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    const results = response.data;

    dispatch({
      type: SET_TRACK_SEARCH_RESULTS,
      payload: response.data.tracks.items
    });

    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else return 0;
};

/**
 * Gets the currently playing song within a venue.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API Access Token
 * @param venueId {String} - The ID of the target venue.
 * @returns 1 if successful, 0 if failed
 */
export const getCurrentSong = async (dispatch, accessToken, venueId) => {
  const response = await axios.get(`http://localhost:8081/spotify/song?venueId=${venueId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    dispatch({
      type: SET_CURRENT_SONG,
      payload: response.data
    });

    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else return 0;
};

/**
 * Adds a song to the venue's current queue.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API Access Token
 * @param venueId {String} - The ID of the target venue.
 * @param trackUri {String} - The URI of the track to be queued.
 * @returns 1 if successful, 0 if failed
 */
export const queueTrack = async (dispatch, accessToken, venueId, trackUri) => {
  const response = await axios.post(`http://localhost:8081/spotify/song`, {
    trackUri,
    venueId
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 204) {
    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else return 0;
};


// /**
//  * Fetches the data for the current venue.
//  * @param dispatch {Function} - Application Dispatch
//  * @param accessToken {String} - Wave API Access Token
//  * @param spotifyAccessToken {String} - Spotify API Access Token
//  * @returns 1 if successful, 0 if failed
//  */
// export const getVenue = async (dispatch, accessToken, spotifyAccessToken) => {
//   const response = await axios.get(`http://localhost:8081/spotify/venue?accessToken=${spotifyAccessToken}`, {
//     headers: {
//       'Authorization': `Bearer ${accessToken}`
//     }
//   }).catch((error) => error.response);
//
//   if (response && response.status === 200) {
//     dispatch({
//       type: SET_VENUE_INFO,
//       payload: response.data
//     });
//
//     return 1;
//   } else if (response && response.status === 401) {
//     return TOKENS_EXPIRED;
//   } else return 0;
// };
