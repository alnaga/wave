import React from 'react';
import { Switch, Route } from 'react-router-dom';

import CurrentlyPlaying from '../CurrentlyPlaying/CurrentlyPlaying';

import SearchResults from '../SearchResults/SearchResults';

const Dashboard = () => {
  return (
    <div id="dashboard" className="container-fluid d-flex flex-column pl-0 pr-0">
      <div className="d-flex flex-column align-items-center pl-0 pr-0">

        <Switch>
          <Route exact path="/search/:query" component={SearchResults} />
        </Switch>
      </div>

      <CurrentlyPlaying />
    </div>
  );
};

export default Dashboard;
