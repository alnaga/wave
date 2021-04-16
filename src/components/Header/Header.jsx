import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

import SearchBar from '../SearchBar/SearchBar';
import SpotifyAuthorise from '../SpotifyAuthorise/SpotifyAuthorise';

import { useAppState } from '../../context/context';

import './Header.scss';

const Header = () => {
  const { tokens } = useAppState();
  const { spotify, wave } = tokens;

  return (
    <div id="header">
      <div className="container-fluid d-flex align-items-center height-full justify-content-between">
        <div id="logo">
          <Link to="/">
            Wave
          </Link>
        </div>

        {
          !spotify.accessToken
            && <SpotifyAuthorise />
        }

        {
          wave.accessToken
            && (
              <div className="d-flex flex-grow-1 align-items-center justify-content-end">
                <SearchBar className="ml-3 mr-3" />

                <div>
                  <FontAwesomeIcon icon={faUserCircle} size="lg" />
                </div>
              </div>
            )
        }
      </div>
    </div>
  );
};

export default Header;
