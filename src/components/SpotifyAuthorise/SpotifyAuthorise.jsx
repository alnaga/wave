import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';

import { API_URL } from '../../constants';
import { getSpotifyAuthTokens } from '../../actions/spotify/spotifyActions';
import { useAppDispatch } from '../../context/context';

const SpotifyAuthorise = (props) => {
  const dispatch = useAppDispatch();

  // Navigates the user to the API's Spotify authorisation endpoint which takes them to
  // Spotify's application consent page so that they can decide on whether they want to link
  // their Wave account with Spotify.
  const handleAuthorise = (event) => {
    window.location.href = `${API_URL}/spotify/authorise/`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    // When the user returns from the Spotify consent page, Spotify appends a 'code' query parameter
    // which should be used to fetch access tokens from their API.
    // If the 'code' parameter has a value, the access tokens are fetched and then the 'code' parameter
    // is removed from the URL.
    (async () => {
      if (authCode && authCode.length) {
        if (await getSpotifyAuthTokens(dispatch, authCode)) {
          window.location.href = API_URL.slice(0, -1) + '0';
        }
      }
    })();
  }, [window.location.href]);

  return (
    <div {...props}>
      <span
        className="spotify"
        onClick={handleAuthorise}
        title="Link your account with Spotify"
      >
        <FontAwesomeIcon icon={faSpotify} size="lg" />
      </span>
    </div>
  );
};

export default SpotifyAuthorise;
