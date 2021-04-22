import React from 'react';
import classNames from 'classnames';

import './ScreenHeader.scss';

const ScreenHeader = ({ subtitle, title, className }) => (
  <div
    className={classNames({
      'screen-header': true,
      'p-3': true,
      'pb-2': true,
      [className]: className
    })}
  >
    <div className="title"> { title } </div>

    {
      subtitle
        && <div> { subtitle } </div>
    }
  </div>
);

export default ScreenHeader;
