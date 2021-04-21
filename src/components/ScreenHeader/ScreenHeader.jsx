import React from 'react';

import './ScreenHeader.scss';

const ScreenHeader = (props) => {
  const { subtitle, title } = props;

  return (
    <div className="screen-header p-3 pb-2">
      <div className="title"> { title } </div>

      {
        subtitle
          && <div> { subtitle } </div>
      }
    </div>
  );
};

export default ScreenHeader;
