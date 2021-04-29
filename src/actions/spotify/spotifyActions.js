import axios from 'axios';
import Cookies from 'js-cookie';

import {
  SET_ALBUM_INFO,
  SET_ARTIST_INFO,
  SET_CURRENT_SONG,
  SET_DEVICES,
  SET_TRACK_SEARCH_RESULTS,
  SET_RECOMMENDATIONS,
  SET_SPOTIFY_TOKENS,
  SET_VOTES,
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
    const response = await axios.post('https://192.168.86.214:8081/spotify/tokens', {
      authCode
    }).catch((error) => error.response);

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

      Cookies.set('spotifyTokens', JSON.stringify(spotifyTokens));

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
    const response = await axios.post('https://192.168.86.214:8081/spotify/refresh', {
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

      Cookies.set('spotifyTokens', JSON.stringify(newSpotifyTokens));

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
 * @param venueId {String} - The ID of the current venue.
 * @returns 1 if successful, 0 if failed
 */
export const getUserDevices = async (dispatch, accessToken, venueId) => {
  const response = await axios.get(`https://192.168.86.214:8081/spotify/devices?venueId=${venueId}`, {
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
 * @param venueId {String} - The ID of the target venue.
 * @param device {Object} - The Spotify Device Object
 * @returns 1 if successful, 0 if failed
 */
export const selectUserDevice = async (dispatch, accessToken, venueId, device) => {
  const response = await axios.put(`https://192.168.86.214:8081/spotify/devices`, {
    device,
    venueId
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      dispatch({
        type: SET_DEVICES,
        payload: []
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
 * Queries the Wave API to fetch information about a given album from the Spotify API.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API Access Token
 * @param venueId {String} - The ID of the current venue.
 * @param albumId {String} - The ID of the album to fetch.
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if one of the access tokens have expired.
 */
export const getAlbumInfo = async (dispatch, accessToken, venueId, albumId) => {
  const response = await axios.get(`https://192.168.86.214:8081/spotify/album?venueId=${venueId}&albumId=${albumId}`, {
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
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API Access Token
 * @param venueId {String} - The ID of the current venue.
 * @param artistId {String} - The ID of the desired artist.
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if one of the access tokens have expired.
 */
export const getArtistInfo = async (dispatch, accessToken, venueId, artistId) => {
  const response = await axios.get(`https://192.168.86.214:8081/spotify/artist?venueId=${venueId}&artistId=${artistId}`, {
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

export const getVenueRecommendations = async (dispatch, accessToken, spotifyAccessToken) => {
  const response = await axios.get(`https://192.168.86.214:8081/spotify/recommendations?spotifyAccessToken=${spotifyAccessToken}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      const recommendations = response.data.recommendations.sort((a, b) => {
        if (a && b) {
          return b.score - a.score;
        }
      });

      dispatch({
        type: SET_RECOMMENDATIONS,
        payload: recommendations
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
 * @param venueId {String} - The ID of the current venue.
 * @param query {String} - Search query
 * @returns 1 if successful, 0 if failed
 */
export const getTrackSearchResults = async (dispatch, accessToken, venueId, query) => {
  // If the user has not input a query, the request to the API is not made.
  if (!query) {
    return 0;
  }

  const response = await axios.get(`https://192.168.86.214:8081/spotify/search?query=${query}&venueId=${venueId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
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
  const response = await axios.get(`https://192.168.86.214:8081/spotify/song?venueId=${venueId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      dispatch({
        type: SET_CURRENT_SONG,
        payload: response.data
      });

      dispatch({
        type: SET_VOTES,
        payload: response.data.votes
      });

      return 1;
    } else if (response.status === 204) {
      dispatch({
        type: SET_CURRENT_SONG,
        payload: undefined
      });

      dispatch({
        type: SET_VOTES,
        payload: 0
      });
    } else if (response.status === 401) {
      return TOKENS_EXPIRED;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};

/**
 * Attempts to pause the currently playing track on the Spotify API.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API access Token
 * @param venueId {String} - The ID of the target venue.
 */
export const pauseTrack = async (dispatch, accessToken, venueId) => {
  const response = await axios.put('https://192.168.86.214:8081/spotify/pause', {
    venueId
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      return 1;
    } else if (response.status === 401) {
      return TOKENS_EXPIRED;
    }
  } else {
    return 0;
  }
}

/**
 * Attempts to resume the currently playing track on the Spotify API.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API access Token
 * @param venueId {String} - The ID of the target venue.
 */
export const playTrack = async (dispatch, accessToken, venueId) => {
  const response = await axios.put('https://192.168.86.214:8081/spotify/play', {
    venueId
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      return 1;
    } else if (response.status === 401) {
      return TOKENS_EXPIRED;
    }
  } else {
    return 0;
  }
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
  const response = await axios.post(`https://192.168.86.214:8081/spotify/song`, {
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

/**
 * Attempts to skip the currently playing track on the Spotify API.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API access Token
 * @param venueId {String} - The ID of the target venue.
 */
export const skipTrack = async (dispatch, accessToken, venueId) => {
  const response = await axios.post('https://192.168.86.214:8081/spotify/skip', {
    venueId
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      return 1;
    } else if (response.status === 401) {
      return TOKENS_EXPIRED;
    }
  } else {
    return 0;
  }
};

/**
 * Queries the Spotify API to change the current volume on the venue's account.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API Access Token
 * @param venueId {String }- The ID of the target venue
 * @param volume {String }- Desired volume (0 - 100)
 */
export const updateVolume = async (dispatch, accessToken, venueId, volume) => {
  const response = await axios.put('https://192.168.86.214:8081/spotify/volume', {
    venueId,
    volume
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {

      return 1;
    } else if (response.status === 401) {
      return TOKENS_EXPIRED;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};