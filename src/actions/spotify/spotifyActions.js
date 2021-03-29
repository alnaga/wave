import axios from 'axios';

import {
  SET_ACCESS_TOKEN,
  SET_REFRESH_TOKEN
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
