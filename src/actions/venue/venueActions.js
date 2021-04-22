import axios from 'axios';
import {
  SET_CURRENT_VENUE,
  SET_VENUE_INFO,
  SET_VENUE_SEARCH_RESULTS,
  TOKENS_EXPIRED
} from '../../constants';

/**
 * Attempts to check the user into a given venue.
 * @param dispatch {Function}
 * @param accessToken {String}
 * @param venueId {String}
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if the Wave API access token has expired.
 */
export const checkIn = async (dispatch, accessToken, venueId) => {
  const response = await axios.post(`http://localhost:8081/venue/check-in`, {
    accessToken,
    venueId
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);
  
  if (response) {
    if (response.status === 200) {
      sessionStorage.setItem('currentVenue', JSON.stringify(response.data));

      dispatch({
        type: SET_CURRENT_VENUE,
        payload: response.data
      });
    } else if (response.status === 401) {
      return TOKENS_EXPIRED;
    }
  } else {
    return 0;
  }
};

/**
 * Attempts to check the user out of a given venue.
 * @param dispatch {Function}
 * @param accessToken {String}
 * @param venueId {String}
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if the Wave API access token has expired.
 */
export const checkOut = async (dispatch, accessToken, venueId) => {
  const response = await axios.post(`http://localhost:8081/venue/check-out`, {
    accessToken,
    venueId
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      sessionStorage.removeItem('currentVenue');

      dispatch({
        type: SET_CURRENT_VENUE,
        payload: undefined
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
 * Attempts to fetch data about a given venue.
 * @param dispatch {Function}
 * @param accessToken {String}
 * @param venueId {String}
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if the Wave API access token has expired.
 */
export const getVenueData = async (dispatch, accessToken, venueId) => {
  const response = await axios.get(`http://localhost:8081/venue?id=${venueId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    dispatch({
      type: SET_VENUE_INFO,
      payload: response.data.venue
    });
    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else {
    return 0;
  }
};

/**
 * Queries the Wave API to find venues containing the user-input query.
 * @param dispatch {Function}
 * @param accessToken {String}
 * @param query {String}
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if the Wave API access token has expired.
 */
export const getVenueSearchResults = async (dispatch, accessToken, query) => {
  const response = await axios.get(`http://localhost:8081/venue/search?q=${query}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      dispatch({
        type: SET_VENUE_SEARCH_RESULTS,
        payload: response.data
      });
    } else if (response.status === 401) {
      return TOKENS_EXPIRED;
    }
  } else {
    return 0;
  }
};

/**
 * Attempts to register a new venue with the Wave API.
 * @param dispatch {Function}
 * @param accessToken {String}
 * @param venueData {Object}
 * @param ownerUsername {String}
 * @param spotifyTokens {Object}
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if the Wave API access token has expired.
 */
export const registerVenue = async (dispatch, accessToken, venueData, ownerUsername, spotifyTokens) => {
  const response = await axios.post('http://localhost:8081/venue', {
    ownerUsername,
    spotifyTokens,
    ...venueData
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    dispatch({
      type: SET_VENUE_INFO,
      payload: response.data.venue
    });

    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else {
    return 0;
  }
};