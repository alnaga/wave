import React, { useEffect } from 'react';

import { getAuthTokens, refreshAuthToken } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

const SpotifyAuthorise = () => {
  const { accessToken, refreshToken } = useAppState();
  const dispatch = useAppDispatch();

  const handleAuthorise = (event) => {
    window.location.href = 'http://localhost:8081/spotify/authorise/';
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const tokenExpirationTime = Number.parseInt(sessionStorage.getItem('tokenExpirationTime'));

    (async () => {
      if (authCode && authCode.length) {
        if (await getAuthTokens(dispatch, authCode)) {
          window.location.href = 'http://localhost:8080';
        }
      }

      if (accessToken && tokenExpirationTime < Date.now()) {
        await refreshAuthToken(dispatch, refreshToken);
      }
    })();
  }, []);

  return (
    <div>
      {
        !accessToken
          && (
            <button onClick={handleAuthorise}>
              Link your account with Spotify.
            </button>
          )
      }
    </div>
  );
};

export default SpotifyAuthorise;
