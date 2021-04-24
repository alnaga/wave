import React from 'react';
import { Link } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

const NotFound = () => {
  return (
    <ScreenContainer>
      <ScreenHeader
        title="Oops!"
        subtitle="The page you are looking for does not exist."
      />

      <div className="p-3">
        <Link to="/">
          Click here to go home.
        </Link>
      </div>
    </ScreenContainer>
  )
};

export default NotFound;
