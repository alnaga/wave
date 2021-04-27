import React, { useEffect, useRef } from 'react';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { useAppDispatch, useAppState } from '../../context/context';

const Recommendations = () => {
  const dispatch = useAppDispatch();
  const { tokens } = useAppState();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Our Recommendations"
      />

    </ScreenContainer>
  );
};

export default Recommendations;
