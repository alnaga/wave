import React, { forwardRef } from 'react';

import './ScreenContainer.scss';

const ScreenContainer = forwardRef((props, ref) => {
  return (
    <div className="screen" ref={ref} {...props} >
      {props.children}
    </div>
  );
});

export default ScreenContainer;
