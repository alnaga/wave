import React from 'react';
import styled from 'styled-components';

import { WAVE_COLOUR_MAIN } from '../../constants';

const StyledHeader = styled.header`
  background-color: ${WAVE_COLOUR_MAIN};
  height: 50px;
  position: fixed;
  width: 100%;
`;

const Header = () => {
  return (
    <StyledHeader>
      Header Placeholder
    </StyledHeader>
  );
};

export default Header;
