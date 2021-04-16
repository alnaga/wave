import React from 'react';

import './ScreenContainer.scss';

const ScreenContainer = (props) => {

  return (
    <div className="screen" {...props} >
      { props.children }
    </div>
  );
};

export default ScreenContainer;
