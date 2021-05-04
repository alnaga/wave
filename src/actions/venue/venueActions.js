import axios from 'axios';
import Cookies from 'js-cookie';

import {
  SET_CURRENT_SONG,
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
  const response = await axios.post(`https://192.168.86.214:8081/venue/check-in`, {
    venueId
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);
  
  if (response) {
    if (response.status === 200) {
      Cookies.set('currentVenue', JSON.stringify(response.data));

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
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Wave API Access Token
 * @param venueId {String} - The ID of the target venue
 * @param venueDeleted {Boolean} - When a venue is deleted, the check out endpoint will return a 400, this overrides that and deletes the context values anyway
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if the Wave API access token has expired.
 */
export const checkOut = async (dispatch, accessToken, venueId, venueDeleted) => {
  const response = await axios.post(`https://192.168.86.214:8081/venue/check-out`, {
    venueId
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200 || venueDeleted) {
      Cookies.remove('currentVenue');

      dispatch({
        type: SET_CURRENT_SONG,
        payload: undefined
      });

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
 * Queries the Wave API to delete a venue from its database.
 * @param dispatch - Application Dispatch
 * @param accessToken - Wave API Access Token
 * @param venueId - The ID of the target venue.
 */
export const deleteVenue = async (dispatch, accessToken, venueId) => {
  const response = await axios.delete(`https://192.168.86.214:8081/venue?venueId=${venueId}`, {
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
 * Attempts to fetch data about a given venue.
 * @param dispatch {Function}
 * @param accessToken {String}
 * @param venueId {String}
 * @returns 1 if successful, 0 if failed, TOKENS_EXPIRED if the Wave API access token has expired.
 */
export const getVenueData = async (dispatch, accessToken, venueId) => {
  const response = await axios.get(`https://192.168.86.214:8081/venue?id=${venueId}`, {
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
  const response = await axios.get(`https://192.168.86.214:8081/venue/search/?q=${query}`, {
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
  const response = await axios.post('https://192.168.86.214:8081/venue', {
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

/**
 * queries the Wave API to update the details of a venue.
 * @param dispatch - Application Dispatch
 * @param accessToken - Wave API Access Token
 * @param venueId - The ID of the target venue.
 * @param venueData - The new details of the venue.
 */
export const updateVenueDetails = async (dispatch, accessToken, venueId, venueData) => {
  const response = await axios.patch('https://192.168.86.214:8081/venue', {
    venueData,
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
 * Submits a vote for the currently playing song in a venue.
 * @param dispatch {Function} - Application Dispatch
 * @param accessToken {String} - Spotify API Access Token
 * @param venueId {String} - The ID of the target venue
 * @param vote {String} - The vote value (VOTE_UP or VOTE_DOWN).
 * @returns 1 if successful, 0 if failed
 */
export const voteSong = async (dispatch, accessToken, venueId, vote) => {
  const response = await axios.post(`https://192.168.86.214:8081/spotify/vote`, {
    venueId,
    vote
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      Cookies.set('currentVenue', JSON.stringify(response.data.venue));

      dispatch({
        type: SET_CURRENT_VENUE,
        payload: response.data.venue
      });

      const { skipped } = response.data;
      return { skipped };
    } else if (response.status === 401) {
      return TOKENS_EXPIRED;
    } else {
      return 0;
    }
  } else return 0;
};