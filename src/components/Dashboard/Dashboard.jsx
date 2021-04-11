import React from 'react';

import CurrentlyPlaying from '../CurrentlyPlaying/CurrentlyPlaying';

const Dashboard = () => {

  return (
    <div id="dashboard" className="container-fluid d-flex flex-column pl-0 pr-0">
      <div className="container-fluid d-flex flex-column pl-0 pr-0">

      </div>

      <CurrentlyPlaying />
    </div>
  );
};

export default Dashboard;
