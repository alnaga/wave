import React from 'react';

import Register from '../Register/Register';
import SpotifyAuthorise from '../SpotifyAuthorise/SpotifyAuthorise';

const App = () => {
  return (
    <div>
      <SpotifyAuthorise />
      <Register />
    </div>
  );
};

export default App;
