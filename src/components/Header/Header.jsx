import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

import SearchBar from '../SearchBar/SearchBar';
import SpotifyAuthorise from '../SpotifyAuthorise/SpotifyAuthorise';

import { useAppState } from '../../context/context';
import { WAVE_COLOUR_MAIN } from '../../constants';

import './Header.scss';

const StyledHeader = styled.header`
  background-color: ${WAVE_COLOUR_MAIN};
  color: #fff;
  height: 56px;
  position: fixed;
  width: 100%;
`;

const Header = () => {
  const { tokens } = useAppState();
  const { spotify, wave } = tokens;

  return (
    <StyledHeader id="header">
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
              <>
                <div className="d-flex flex-grow-1 justify-content-center">
                  <SearchBar />
                </div>

                <div>
                  <FontAwesomeIcon icon={faUserCircle} size="lg" />
                </div>
              </>
            )
        }
      </div>
    </StyledHeader>
  );
};

export default Header;
