import axios from 'axios';

import {
  SET_WAVE_TOKENS
} from '../../constants';

/**
 * Utility function that saves the incoming authentication tokens to sessionStorage and then
 * updates their respective context values.
 * @param dispatch - Application Dispatch
 * @param response - Response object containing the tokens
 */
const saveTokens = async (dispatch, response) => {
  sessionStorage.setItem('waveTokens', JSON.stringify(response.data));

  await dispatch({
    type: SET_WAVE_TOKENS,
    payload: response.data
  });
}

/**
 * Attempts to log the user in with the credentials provided.
 * Gets an access and refresh token from the OAuth server.
 * @param dispatch - Application Dispatch
 * @param userData - User Credentials
 * @returns 1 if successful, 0 if failed
 */
export const login = async (dispatch, userData) => {
  try {
    const response = await axios.post('http://localhost:8081/account/login', userData);

    if (response.status === 200) {
      saveTokens(dispatch, response);
      return 1;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Attempts to acquire a new access token using the refresh token
 * @param dispatch - Application Dispatch
 * @param refreshToken - Refresh token acquired during authentication
 * @returns 1 if successful, 0 if failed
 */
export const refreshAccessToken = async (dispatch, refreshToken) => {
  try {
    const response = await axios.post(`http://localhost:8081/account/refresh?refresh_token=${refreshToken}`);

    if (response.status === 200) {
      await saveTokens(dispatch, response);
      return 1;
    } else return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Attempts to register the user with the credentials provided and logs them in if successful.
 * @param dispatch - Application Dispatch
 * @param userData - Desired User Credentials
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
