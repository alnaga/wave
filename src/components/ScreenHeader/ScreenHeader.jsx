import React from 'react';
import classNames from 'classnames';

import './ScreenHeader.scss';

// Allows developers to define the title (and subtitle if necessary) of a page.
// This improves consistency across the application and reduces the amount of duplicate code.
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
