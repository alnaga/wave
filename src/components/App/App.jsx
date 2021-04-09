import React, { useEffect, useRef } from 'react';

import CurrentlyPlaying from '../CurrentlyPlaying/CurrentlyPlaying';
import DeviceSelection from '../DeviceSelection/DeviceSelection';
import Login from '../Login/Login';
import Register from '../Register/Register';
import Search from '../Search/Search';
import SearchResults from '../SearchResults/SearchResults';
import SpotifyAuthorise from '../SpotifyAuthorise/SpotifyAuthorise';

import { refreshAccessToken } from '../../actions/account/accountActions';
import {
  getCurrentlyPlaying,
  getSongSearchResults,
  getUserDevices,
  getVenue,
  refreshSpotifyAuthToken
} from '../../actions/spotify/spotifyActions';
import { handleGetDevices } from '../DeviceSelection/DeviceSelection';
import { useAppDispatch, useAppState } from '../../context/context';
import { accessTokenExpired, spotifyTokenExpired } from '../../util';

const App = () => {
  const dispatch = useAppDispatch();
  const {
    currentlyPlaying,
    devices,
    tokens,
    venue
  } = useAppState();

  // We need to maintain a reference to the context tokens value as setInterval can't access it normally.
  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const { spotify, wave } = tokens;

  console.log(useAppState());

  useEffect(() => {
    const { spotify, wave } = tokensRef.current;

    const getNewAccessToken = async () => {
      if (tokensRef.current.wave.accessToken && accessTokenExpired(tokensRef.current.wave.accessTokenExpiresAt)) {
        console.log('Getting new access token.', tokensRef.current.wave.refreshToken);
        await refreshAccessToken(dispatch, tokensRef.current.wave.refreshToken);
      }
    };

    const getNewSpotifyToken = async () => {
      if (tokensRef.current.spotify.accessToken && spotifyTokenExpired(tokensRef.current.spotify.accessTokenExpiresAt)) {
        await refreshSpotifyAuthToken(dispatch, tokensRef.current.spotify.refreshToken);
      }
    };

    (async () => {
      if (wave.accessToken && spotify.accessToken) {
        if (!venue) {
          await getVenue(dispatch, spotify.accessToken);
        }

        if (!currentlyPlaying) {
          await getCurrentlyPlaying(dispatch, spotify.accessToken);
        }

        if (!devices.length > 0) {
          // await getUserDevices(dispatch, accessToken, spotify.accessToken);
          await handleGetDevices(dispatch, wave.accessToken, wave.refreshToken, spotify.accessToken, spotify.refreshToken);
        }
      }
      await getNewAccessToken();
      await getNewSpotifyToken();
    })();

    const checkAccessTokenExpiration = setInterval(async () => {
      await getNewAccessToken();
    }, 5000);

    const checkSpotifyTokenExpiration = setInterval(async () => {
      await getNewSpotifyToken();
    }, 60000);

    return () => {
      clearInterval(checkAccessTokenExpiration);
      clearInterval(checkSpotifyTokenExpiration)
    };
  }, []);

  return (
    <div>
      {
        !spotify.accessToken
          && (
            <SpotifyAuthorise />
          )
      }
      {
        (wave.accessToken && !accessTokenExpired(wave.accessTokenExpiresAt))
          ? (
            <>
              {
                (spotify.accessToken && !spotifyTokenExpired(spotify.accessTokenExpiresAt))
                  && (
                    <>
                      {
                        devices.length > 0
                          && (
                            <CurrentlyPlaying />
                          )
                      }
                      <Search onSubmit={getSongSearchResults(dispatch, spotify.accessToken)}/>
                      <SearchResults />
                      <DeviceSelection />
                    </>
                  )
              }
            </>
          ) : (
            <>
              <Login />
              <Register />
            </>
          )
      }
    </div>
  );
};

export default App;
