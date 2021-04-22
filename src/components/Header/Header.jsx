import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHome, faUserCircle } from '@fortawesome/free-solid-svg-icons';

import BackButton from '../BackButton/BackButton';
import SearchBar from '../SearchBar/SearchBar';
import SpotifyAuthorise from '../SpotifyAuthorise/SpotifyAuthorise';

import { clearHistory } from '../../actions/history/historyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './Header.scss';

const Header = () => {
  const dispatch = useAppDispatch();
  const { currentVenue, tokens } = useAppState();
  const { spotify, wave } = tokens;

  const handleGoHome = () => {
    clearHistory(dispatch);
  };

  return (
    <div id="header">
      <div className="container-fluid d-flex align-items-center height-full justify-content-between">
        <div id="logo">
          <BackButton />

          <Link to="/" onClick={handleGoHome}>
            <FontAwesomeIcon icon={faHome} size="lg" />
          </Link>
        </div>

        {
          wave.accessToken
            && (
              <div className="d-flex flex-grow-1 align-items-center justify-content-end">
                {
                  currentVenue
                    && (
                      <SearchBar
                        className="ml-3 mr-3"
                        resultsPage="/tracks/search"
                        searchType="tracks"
                        placeholder="Search for a song/artist"
                      />
                    )
                }

                {
                  !spotify.accessToken
                  && <SpotifyAuthorise className="mr-3" />
                }

                <Link to="/account" className="mr-3">
                  <FontAwesomeIcon icon={faUserCircle} size="lg" />
                </Link>

                <Link to="/settings">
                  <FontAwesomeIcon icon={faCog} size="lg" />
                </Link>
              </div>
            )
        }
      </div>
    </div>
  );
};

export default Header;
