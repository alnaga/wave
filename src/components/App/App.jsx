import React, { useEffect, useRef, useState } from 'react';

import Dashboard from '../Dashboard/Dashboard';
import DeviceSelection from '../DeviceSelection/DeviceSelection';
import Header from '../Header/Header';
import LoginRegister from '../LoginRegister/LoginRegister';
import Search from '../Search/Search';
import SearchResults from '../SearchResults/SearchResults';

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
        await refreshAccessToken(dispatch, tokensRef.current.wave.refreshToken);
      }
    };

    const getNewSpotifyToken = async () => {
      if (tokensRef.current.spotify.accessToken && spotifyTokenExpired(tokensRef.current.spotify.accessTokenExpiresAt)) {
        await refreshSpotifyAuthToken(dispatch, tokensRef.current.spotify.refreshToken);
      }
    };

    const checkAccessTokenExpiration = setInterval(async () => {
      await getNewAccessToken();
    }, 60000);

    const checkSpotifyTokenExpiration = setInterval(async () => {
      await getNewSpotifyToken();
    }, 60000);

    (async () => {
      if (wave.accessToken && spotify.accessToken) {
        if (!venue) {
          await getVenue(dispatch, spotify.accessToken);
        }

        // if (spotify.accessToken && !currentlyPlaying) {
        //   await getCurrentlyPlaying(dispatch, spotify.accessToken);
        // }
        // if (!devices.length > 0) {
        //   // await getUserDevices(dispatch, accessToken, spotify.accessToken);
        //   await handleGetDevices(dispatch, tokens);
        // }
      }

      await getNewAccessToken();
      await getNewSpotifyToken();
    })();

    return () => {
      clearInterval(checkAccessTokenExpiration);
      clearInterval(checkSpotifyTokenExpiration)
    };
  }, [ , tokens]);

  return (
    <div id="app">
      <Header />

      <div id="app-content" className="d-flex justify-content-center header-spacing">
        {
          wave.accessToken
            ? (
              <Dashboard />
            ) : (
              <LoginRegister />
            )
        }
      </div>

      {/*{*/}
      {/*  !spotify.accessToken*/}
      {/*    && (*/}
      {/*      <SpotifyAuthorise />*/}
      {/*    )*/}
      {/*}*/}
      {/*{*/}
      {/*  (wave.accessToken && !accessTokenExpired(wave.accessTokenExpiresAt))*/}
      {/*    ? (*/}
      {/*      <>*/}
      {/*        {*/}
      {/*          (spotify.accessToken && !spotifyTokenExpired(spotify.accessTokenExpiresAt))*/}
      {/*            && (*/}
      {/*              <>*/}
      {/*                {*/}
      {/*                  devices.length > 0*/}
      {/*                    && (*/}
      {/*                      <CurrentlyPlaying />*/}
      {/*                    )*/}
      {/*                }*/}
      {/*                <Search onSubmit={getSongSearchResults(dispatch, spotify.accessToken)}/>*/}
      {/*                <SearchResults />*/}
      {/*                <DeviceSelection />*/}
      {/*              </>*/}
      {/*            )*/}
      {/*        }*/}
      {/*      </>*/}
      {/*    ) : (*/}
      {/*      <>*/}
      {/*        <Login />*/}
      {/*        <Register />*/}
      {/*      </>*/}
      {/*    )*/}
      {/*}*/}
    </div>
  );
};

export default App;
