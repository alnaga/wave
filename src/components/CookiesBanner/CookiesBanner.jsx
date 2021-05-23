import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

import './CookiesBanner.scss';

const CookiesBanner = () => {
  // The banner is only shown if the 'cookieConsent' cookie is not present in the browser.
  const [ show, setShow ] = useState(() => {
    try {
      const cookieConsent = JSON.parse(Cookies.get('cookieConsent'));
      if (cookieConsent) {
        return false;
      }
    } catch (error) {
      return true;
    }
  });

  // Sets the 'cookieConsent' cookie on the browser so that it will no longer be shown on subsequent page visits.
  const handleGiveConsent = () => {
    Cookies.set('cookieConsent', JSON.stringify(true));
    setShow(false);
  };

  return (
    <>
      {
        show
          && (
            <div id="cookies-banner" className="ml-3 mr-3">
              <div>
                This application uses browser cookies in order to function correctly.
              </div>

              <button className="ml-3" onClick={handleGiveConsent}>
                Accept
              </button>
            </div>
          )
      }
    </>
  );
};

export default CookiesBanner;
