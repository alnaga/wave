import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';

import { API_URL } from '../../constants';
import { getSpotifyAuthTokens } from '../../actions/spotify/spotifyActions';
import { useAppDispatch } from '../../context/context';

const SpotifyAuthorise = (props) => {
  const dispatch = useAppDispatch();

  const handleAuthorise = (event) => {
    window.location.href = `${API_URL}/spotify/authorise/`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

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
