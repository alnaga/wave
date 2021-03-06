import React from 'react';
import { Switch, Route } from 'react-router-dom';

import AccountInfo from '../AccountInfo/AccountInfo';
import AlbumInfo from '../AlbumInfo/AlbumInfo';
import ArtistInfo from '../ArtistInfo/ArtistInfo';
import DeleteAccount from '../DeleteAccount/DeleteAccount';
import Home from '../Home/Home';
import LoginRegister from '../LoginRegister/LoginRegister';
import NotFound from '../NotFound/NotFound';
import Recommendations from '../Recommendations/Recommendations';
import Settings from '../Settings/Settings';
import SongSearchResults from '../SongSearchResults/SongSearchResults';
import VenueInfo from '../VenueInfo/VenueInfo';
import VenueRegistration from '../VenueRegistration/VenueRegistration';
import VenueSearchResults from '../VenueSearchResults/VenueSearchResults';

import './Dashboard.scss';

// Handles conditionally rendering different pages of the application based upon the URL the user is on.
const Dashboard = () => {
  return (
    <div id="dashboard" className="container-fluid d-flex flex-column pl-0 pr-0">
      <div id="dashboard-content" className="d-flex flex-column align-items-center pl-0 pr-0">

        <Switch>
          <Route exact path="/account" component={AccountInfo} />
          <Route exact path="/account/delete" component={DeleteAccount} />
          <Route exact path="/album/:albumId" component={AlbumInfo} />
          <Route exact path="/artist/:artistId" component={ArtistInfo} />
          <Route exact path="/login" component={LoginRegister} />
          <Route exact path="/recommendations" component={Recommendations} />
          <Route exact path="/register" component={LoginRegister} />
          <Route exact path="/register-venue" component={VenueRegistration} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/tracks/search/:query" component={SongSearchResults} />
          <Route exact path="/venues/search/:query" component={VenueSearchResults} />
          <Route exact path="/venue/:venueId" component={VenueInfo} />
          <Route exact path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </div>

    </div>
  );
};

export default Dashboard;
