import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

import SearchBar from '../SearchBar/SearchBar';
import SpotifyAuthorise from '../SpotifyAuthorise/SpotifyAuthorise';

import { useAppState } from '../../context/context';
import { WAVE_COLOUR_MAIN } from '../../constants';

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
        <div>
          Wave
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
