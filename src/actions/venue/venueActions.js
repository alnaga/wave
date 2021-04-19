import axios from 'axios';
import { SET_VENUE, TOKENS_EXPIRED } from '../../constants';

export const checkIn = async (dispatch, accessToken, venueId) => {

};

export const getVenueData = async (dispatch, accessToken, venueId) => {
  const response = await axios.get(`http://localhost:8081/venue?id=${venueId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response && response.status === 200) {
    dispatch({
      type: SET_VENUE,
      payload: response.data.venue
    });
    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else {
    return 0;
  }
};

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
      type: SET_VENUE,
      payload: response.data.venue
    });

    return 1;
  } else if (response && response.status === 401) {
    return TOKENS_EXPIRED;
  } else {
    return 0;
  }
};