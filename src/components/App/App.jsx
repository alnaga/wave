import React, { useEffect } from 'react';
import { getSongSearchResults, getVenue } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import CurrentlyPlaying from '../CurrentlyPlaying/CurrentlyPlaying';
import DeviceSelection from '../DeviceSelection/DeviceSelection';
import Register from '../Register/Register';
import Search from '../Search/Search';
import SearchResults from '../SearchResults/SearchResults';
import SpotifyAuthorise from '../SpotifyAuthorise/SpotifyAuthorise';

const App = () => {
  const dispatch = useAppDispatch();
  const { accessToken, venue } = useAppState();

  console.log(useAppState());

  useEffect(() => {
    (async () => {
      if (accessToken && !venue) {
        await getVenue(dispatch, accessToken);
      }
    })();
  }, []);

  return (
    <div>
      <SpotifyAuthorise />
      <Register />
      {
        accessToken
          && (
            <>
              <CurrentlyPlaying />
              <Search onSubmit={getSongSearchResults(dispatch, accessToken)}/>
              <SearchResults />
              <DeviceSelection />
            </>
          )
      }
    </div>
  );
};

export default App;
