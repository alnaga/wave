import React from 'react';
import { getSongSearchResults } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import CurrentlyPlaying from '../CurrentlyPlaying/CurrentlyPlaying';
import DeviceSelection from '../DeviceSelection/DeviceSelection';
import Register from '../Register/Register';
import Search from '../Search/Search';
import SearchResults from '../SearchResults/SearchResults';
import SpotifyAuthorise from '../SpotifyAuthorise/SpotifyAuthorise';

const App = () => {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppState();

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
