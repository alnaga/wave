import React from 'react';
import styled from 'styled-components';

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
  const { spotify } = tokens;

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
      </div>
    </StyledHeader>
  );
};

export default Header;
