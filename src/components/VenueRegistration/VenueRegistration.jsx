import React, { useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { TOKENS_EXPIRED } from '../../constants';
import { refreshExpiredTokens } from '../../util';
import { useAppDispatch, useAppState } from '../../context/context';
import { registerVenue } from '../../actions/venue/venueActions';

import './VenueRegistration.scss';

const VenueRegistration = (props) => {
  const dispatch = useAppDispatch();
  const { tokens, venue } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const venueRef = useRef(null);
  venueRef.current = venue;

  const [ data, setData ] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    spotifyConsent: true,
    googleMapsLink: '',
    postcode: '',
    name: ''
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
    } else if (!data.city) {
      setError('Please enter the city your venue is in.');
    } else if (!data.county) {
      setError('Please enter the county your venue is in.')
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
      <form id="venue-registration">
        <ScreenHeader
          title="Venue Registration"
          subtitle="Please enter the details for your venue below:"
        />

        <div id="venue-registration-body" className="p-3">
          <div className="mb-3 form-section">
            <label htmlFor="venue-name" className="mb-1"> Venue Name * </label>
            <input
              name="venue-name"
              onChange={handleFormChange('name')}
              placeholder="Venue Name"
              required
              value={data.name}
            />
          </div>

          <div className="mb-3 form-section">
            <label htmlFor="address-line-1" className="mb-1"> Address * </label>
            <input
              className="mb-2"
              name="address-line-1"
              onChange={handleFormChange('addressLine1')}
              placeholder="Address Line 1"
              required
              value={data.addressLine1}
            />
            <input
              className="mb-2"
              name="address-line-2"
              onChange={handleFormChange('addressLine2')}
              placeholder="Address Line 2"
              value={data.addressLine2}
            />

            <input
              className="mb-2"
              name="city"
              onChange={handleFormChange('city')}
              placeholder="City"
              required
              value={data.city}
            />

            <input
              className="mb-2"
              name="county"
              onChange={handleFormChange('county')}
              placeholder="County"
              required
              value={data.county}
            />

            <input
              name="postcode"
              onChange={handleFormChange('postcode')}
              placeholder="Postcode"
              required
              value={data.postcode}
            />
          </div>

          <div className="mb-3 form-section">
            <label className="mb-1"> Google Maps Link </label>
            <input
              name="google-maps-link"
              onChange={handleFormChange('googleMapsLink')}
              placeholder="Google Maps Link"
              required
              value={data.googleMapsLink}
            />
          </div>

          <div id="consent" className="form-section">
            <div>
              Authorisation with a Spotify account is required in order for Wave to control playback and song queuing.
              By ticking this box you are giving consent for Wave to use the Spotify account you have
              currently connected.
            </div>

            <input
              className="ml-3"
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

                <div className="close" onClick={handleDismissError}>
                  <span> &times; </span>
                </div>
              </div>
            )
          }

          <button className="mt-4" type="submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </form>
    </ScreenContainer>
  );
};

export default withRouter(VenueRegistration);
