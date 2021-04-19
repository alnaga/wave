import React from 'react';
import { Switch, Route } from 'react-router-dom';

import AccountInfo from '../AccountInfo/AccountInfo';
import AlbumInfo from '../AlbumInfo/AlbumInfo';
import ArtistInfo from '../ArtistInfo/ArtistInfo';
import CurrentlyPlaying from '../CurrentlyPlaying/CurrentlyPlaying';
import SearchResults from '../SearchResults/SearchResults';
import VenueInfo from '../VenueInfo/VenueInfo';
import VenueRegistration from '../VenueRegistration/VenueRegistration';

import './Dashboard.scss';

const Dashboard = () => {
  return (
    <div id="dashboard" className="container-fluid d-flex flex-column pl-0 pr-0">
      <div id="dashboard-content" className="d-flex flex-column align-items-center pl-0 pr-0">

        <Switch>
          <Route exact path="/account" component={AccountInfo} />
          <Route exact path="/album/:albumId" component={AlbumInfo} />
          <Route exact path="/artist/:artistId" component={ArtistInfo} />
          <Route exact path="/register-venue" component={VenueRegistration} />
          <Route exact path="/search/:query" component={SearchResults} />
          <Route exact path="/venue/:venueId" component={VenueInfo} />
        </Switch>
      </div>

      <CurrentlyPlaying />
    </div>
  );
};

export default Dashboard;
