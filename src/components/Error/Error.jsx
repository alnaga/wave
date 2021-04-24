import React from 'react';
import classNames from 'classnames';

import './Error.scss';

const Error = ({ className, message, onDismiss, show }) => (
  <>
    {
      show
        && (
          <div className={classNames({
            'error': true,
            [className]: className
          })}>
            <div className="p-3 pr-0">
              { message }
            </div>

            <div className="dismiss pl-3 pr-3" onClick={onDismiss}>
              &times;
            </div>
          </div>
        )
    }
  </>
);

export default Error;
