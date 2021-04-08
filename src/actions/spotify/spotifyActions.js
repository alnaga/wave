import axios from 'axios';

import {
  SET_ACCESS_TOKEN,
  SET_CURRENTLY_PLAYING,
  SET_DEVICES,
  SET_REFRESH_TOKEN,
  SET_SEARCH_RESULTS,
  SET_VENUE
} from '../../constants';

/**
 * Queries the Wave API to communicate with Spotify's API to fetch access and refresh tokens
 * using the authorisation code fetched previously.
 * @param dispatch - Application Dispatch
 * @param authCode - Spotify API Authorisation Code
 * @returns 1 if successful, 0 if failed
 */
export const getAuthTokens = async (dispatch, authCode) => {
  try {
    const response = await axios.post('http://localhost:8081/spotify/tokens', {
      authCode
    });

    if (response.status === 200) {
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      const lifespan = response.data.expires_in;
      const tokenExpirationTime = Date.now() + (lifespan * 1000);

      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('tokenExpirationTime', tokenExpirationTime);
      sessionStorage.setItem('refreshToken', refreshToken);

      dispatch({
        type: SET_ACCESS_TOKEN,
        payload: accessToken
      });

      dispatch({
        type: SET_REFRESH_TOKEN,
        payload: refreshToken
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
export const refreshAuthToken = async (dispatch, refreshToken) => {
  try {
    const response = await axios.post('http://localhost:8081/spotify/refresh', {
      refreshToken
    });

    if (response.status === 200) {
      const newAccessToken = response.data.access_token;
      const lifespan = response.data.expires_in;
      const tokenExpirationTime = Date.now() + (lifespan * 1000);

      sessionStorage.setItem('accessToken', newAccessToken);
      sessionStorage.setItem('tokenExpirationTime', tokenExpirationTime);

      dispatch({
        type: SET_ACCESS_TOKEN,
        payload: newAccessToken
      });

      return 1;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

export const getUserDevices = async (dispatch, accessToken) => {
  try {
    const response = await axios.get(`http://localhost:8081/spotify/devices?accessToken=${accessToken}`);

    dispatch({
      type: SET_DEVICES,
      payload: response.data.devices
    });

    return 1;
  } catch (error) {
    return 0;
  }
};

export const selectUserDevice = async (dispatch, accessToken, device) => {
  try {
    const response = await axios.put(`http://localhost:8081/spotify/devices?accessToken=${accessToken}`, {
      device
    });

    dispatch({
      type: SET_DEVICES,
      payload: []
    });

  } catch (error) {
    return 0;
  }
};

export const getSongSearchResults = (dispatch, accessToken) => async (query) => {
  try {
    // If the user has not input a query, the request to the API is not made.
    if (!query) {
      return 0;
    }

    const response = await axios.get(`http://localhost:8081/spotify/search?accessToken=${accessToken}&query=${query}`);
    const results = response.data;

    dispatch({
      type: SET_SEARCH_RESULTS,
      payload: response.data.tracks.items
    });

    return 1;
  } catch (error) {
    return 0;
  }
};

export const getCurrentlyPlaying = async (dispatch, accessToken) => {
  try {
    const response = await axios.get(`http://localhost:8081/spotify/song?accessToken=${accessToken}`);

    dispatch({
      type: SET_CURRENTLY_PLAYING,
      payload: response.data
    });
  } catch (error) {
    return 0;
  }
};

export const queueSong = async (dispatch, accessToken, songUri) => {
  try {
    const response = await axios.post(`http://localhost:8081/spotify/song?accessToken=${accessToken}&uri=${songUri}`);

    return 1;
  } catch (error) {
    return 0;
  }
};

export const voteSong = async (dispatch, accessToken, venue, vote) => {
  try {
    const response = await axios.post(`http://localhost:8081/spotify/vote?accessToken=${accessToken}`, {
      venue,
      vote
    });

    if (response.status === 200) {
      const data = {
        ...response.data
      }
      delete data.skipped;

      dispatch({
        type: SET_VENUE,
        payload: data
      });

      if (response.data.skipped) {
        return 2;
      } else {
        return 1;
      }
    }
  } catch (error) {
    return 0;
  }
};

export const getVenue = async (dispatch, accessToken) => {
  try {
    const response = await axios.get(`http://localhost:8081/spotify/venue?accessToken=${accessToken}`);

    if (response.status === 200) {
      dispatch({
        type: SET_VENUE,
        payload: response.data
      });

      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    return 0;
  }
};