import React from 'react';
import styled from 'styled-components';

import { WAVE_COLOUR_MAIN } from '../../constants';

const StyledHeader = styled.header`
  background-color: ${WAVE_COLOUR_MAIN};
  color: #fff;
  height: 56px;
  position: fixed;
  width: 100%;
`;

// TODO: YOU WERE HERE WHEN YOU SLEPT
// TODO: NEXT IMPLEMENT SPOTIFY API CALLS TO GET THE CURRENT SONG QUEUE
const Header = () => {
  return (
    <StyledHeader id="header">
      <div className="container d-flex align-items-center height-full">
        Wave
      </div>
    </StyledHeader>
  );
};

export default Header;
