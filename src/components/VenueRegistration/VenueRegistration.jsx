import React, { useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import { TOKENS_EXPIRED } from '../../constants';
import { refreshExpiredTokens } from '../../util';
import { useAppDispatch, useAppState } from '../../context/context';
import { registerVenue } from '../../actions/venue/venueActions';

const VenueRegistration = (props) => {
  const dispatch = useAppDispatch();
  const { tokens, venue } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const venueRef = useRef(null);
  venueRef.current = venue;

  const [ data, setData ] = useState({
    addressLine1: '52 Royal Park Avenue',
    addressLine2: '',
    spotifyConsent: true,
    googleMapsLink: '',
    postcode: 'LS6 1EY',
    name: 'Alexander Naggar'
  });

  const [ error, setError ] = useState('');

  const handleDismissError = () => {
    setError('');
  };

  const handleFormChange = (field) => (event) => {
    let value;

    if (field === 'spotifyConsent') {
      value = event.target.checked;
    } else {
      value = event.target.value;
    }

    setData((prevState) => ({
      ...prevState,
      [field]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!data.name) {
      setError('Please enter a name for your venue.');
    } else if (!data.addressLine1) {
      setError('Please enter an address for your venue.');
    } else if (!data.postcode) {
      setError('Please enter the venue\'s postcode.');
    } else if (!data.spotifyConsent) {
      setError('Consent to use your Spotify account is required to register your venue.');
    } else {
      setError('');

      if (
        tokensRef.current.wave.accessToken
        && tokensRef.current.wave.user
        && await registerVenue(dispatch, tokensRef.current.wave.accessToken, data, tokensRef.current.wave.user.username, tokensRef.current.spotify) === TOKENS_EXPIRED
      ) {
        await refreshExpiredTokens(dispatch, tokensRef.current);
        await registerVenue(dispatch, tokensRef.current.wave.accessToken, data, tokensRef.current.wave.user.username, tokensRef.current.spotify);
      }

      if (venueRef.current) {
        props.history.push(`/venue/${venueRef.current._id}`);
      }
    }
  };

  return (
    <ScreenContainer>
      <form className="p-3">
        <div>
          Venue Registration
        </div>

        <div>
          Please enter your venue's details below:
        </div>

        <div>
          <label htmlFor="venue-name"> Venue Name </label>
          <input
            name="venue-name"
            onChange={handleFormChange('name')}
            placeholder="Venue Name"
            required
            value={data.name}
          />
          <small> Please enter the name of your venue so that customers can search for it. </small>
        </div>

        <div>
          <label htmlFor="address-line-1"> Address Line 1 </label>
          <input
            name="address-line-1"
            onChange={handleFormChange('addressLine1')}
            placeholder="Address Line 1"
            required
            value={data.addressLine1}
          />
        </div>

        <div>
          <label htmlFor="address-line-2"> Address Line 2 </label>
          <input
            name="address-line-2"
            onChange={handleFormChange('addressLine2')}
            placeholder="Address Line 2"
            value={data.addressLine2}
          />
        </div>

        <div>
          <label htmlFor="postcode"> Postcode </label>
          <input
            name="postcode"
            onChange={handleFormChange('postcode')}
            placeholder="Postcode"
            required
            value={data.postcode}
          />
        </div>

        <div>
          <label>
            Authorisation with a Spotify account is required in order for Wave to function correctly.
            By ticking this box you are giving us consent to use the Spotify account you have
            currently logged in with.
          </label>

          <input
            name="spotify-consent"
            defaultChecked={data.spotifyConsent}
            onChange={handleFormChange('spotifyConsent')}
            required
            type="checkbox"
          />
        </div>

        {
          error
          && (
            <div className="alert alert-danger alert-dismissible mt-3 mb-0">
              { error }

              <button type="button" className="close" onClick={handleDismissError}>
                <span> &times; </span>
              </button>
            </div>
          )
        }

        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>
      </form>
    </ScreenContainer>
  );
};

export default withRouter(VenueRegistration);
