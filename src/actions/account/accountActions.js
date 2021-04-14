import axios from 'axios';

import {
  SET_WAVE_TOKENS
} from '../../constants';

/**
 * Utility function that saves the incoming authentication tokens to sessionStorage and then
 * updates their respective context values.
 * @param dispatch {Function} - Application Dispatch
 * @param tokens {Object} - Response object containing the tokens
 */
const saveTokens = async (dispatch, tokens) => {
  sessionStorage.setItem('waveTokens', JSON.stringify(tokens));

  await dispatch({
    type: SET_WAVE_TOKENS,
    payload: tokens
  });
}

/**
 * Attempts to log the user in with the credentials provided.
 * Gets an access and refresh token from the OAuth server.
 * @param dispatch {Function} - Application Dispatch
 * @param userData {Function} - User Credentials
 * @returns 1 if successful, 0 if failed
 */
export const login = async (dispatch, userData) => {
  try {
    const response = await axios.post('http://localhost:8081/account/login', userData);

    if (response.status === 200) {
      saveTokens(dispatch, response.data);
      return 1;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Logs the user out by wiping their access tokens.
 * @param dispatch {Function} - Application Dispatch
 */
export const logout = async (dispatch) => {
  await saveTokens(dispatch, {
    accessToken: undefined,
    accessTokenExpiresAt: undefined,
    refreshToken: undefined,
    refreshTokenExpiresAt: undefined
  });
};

/**
 * Attempts to acquire a new access token using the refresh token
 * @param dispatch {Function} - Application Dispatch
 * @param refreshToken {String} - Refresh token acquired during authentication
 * @returns 1 if successful, 0 if failed
 */
export const refreshAccessToken = async (dispatch, refreshToken) => {
  try {
    const response = await axios.post(`http://localhost:8081/account/refresh?refresh_token=${refreshToken}`);

    if (response.status === 200) {
      await saveTokens(dispatch, response.data);
      return response.data;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Attempts to register the user with the credentials provided and logs them in if successful.
 * @param dispatch {Function} - Application Dispatch
 * @param userData {Object} - Desired User Credentials
 * @returns 1 if successful, 0 if failed
 */
export const registerAccount = async (dispatch, userData) => {
  try {
    const response = await axios.post('http://localhost:8081/account/register', userData);

    if (response.status === 200) {
      await login(dispatch, userData);
      return 1;
    } else return 0;
  } catch (error) {
    return 0;
  }
};
