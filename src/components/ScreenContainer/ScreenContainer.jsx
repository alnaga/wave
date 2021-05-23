import React, { forwardRef } from 'react';

import './ScreenContainer.scss';

const ScreenContainer = forwardRef((props, ref) => {
  // To enable consistent UI design language across the application, this component adds a 'screen'
  // CSS class which adds CSS to various kinds of elements inside of it.
  return (
    <div className="screen" ref={ref} {...props} >
      {props.children}
    </div>
  );
});

export default ScreenContainer;
