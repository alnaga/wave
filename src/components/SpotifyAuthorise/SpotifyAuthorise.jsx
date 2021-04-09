import React, { useEffect } from 'react';

import { getSpotifyAuthTokens } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

const SpotifyAuthorise = () => {
  const dispatch = useAppDispatch();

  const handleAuthorise = (event) => {
    window.location.href = 'http://localhost:8081/spotify/authorise/';
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    (async () => {
      if (authCode && authCode.length) {
        if (await getSpotifyAuthTokens(dispatch, authCode)) {
          window.location.href = 'http://localhost:8080';
        }
      }
    })();
  }, []);

  return (
    <div>
      <button onClick={handleAuthorise}>
        Link your account with Spotify.
      </button>
    </div>
  );
};

export default SpotifyAuthorise;
