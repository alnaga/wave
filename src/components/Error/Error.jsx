import React from 'react';
import classNames from 'classnames';

import './Error.scss';

const Error = ({ className, message, dismissible = true, onDismiss, show }) => (
  <>
    {
      show
        && (
          <div className={classNames({
            'error': true,
            [className]: className
          })}>
            <div
              className={classNames({
                'p-3': true,
                'pr-0': dismissible
              })}
            >
              { message }
            </div>

            {
              dismissible
                && (
                  <div className="dismiss pl-3 pr-3" onClick={onDismiss}>
                    &times;
                  </div>
                )
            }

          </div>
        )
    }
  </>
);

export default Error;
