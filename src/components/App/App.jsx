import React from 'react';

import DeviceSelection from '../DeviceSelection/DeviceSelection';
import Register from '../Register/Register';
import Search from '../Search/Search';
import SearchResults from '../SearchResults/SearchResults';
import SpotifyAuthorise from '../SpotifyAuthorise/SpotifyAuthorise';

import { getSongSearchResults, getUserDevices } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

const App = () => {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppState();

  // const test = async () => {
  //   await getUserDevices(dispatch, accessToken);
  // };

  return (
    <div>
      <SpotifyAuthorise />
      <Register />
      <Search onSubmit={getSongSearchResults(dispatch, accessToken)}/>
      <SearchResults />
      <DeviceSelection />
      {/*<button onClick={test}> Get Devices </button>*/}
    </div>
  );
};

export default App;
