import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getAccountInfo, logout } from '../../actions/account/accountActions';
import { checkOut } from '../../actions/venue/venueActions';

import './AccountInfo.scss';

const AccountInfo = () => {
  const dispatch = useAppDispatch();
  const { accountInfo, currentVenue, tokens } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetAccountInfo = async () => {
    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.wave.user.username
      && await getAccountInfo(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.wave.user.username) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getAccountInfo(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.wave.user.username);
    }
  };

  const handleLogout = async () => {
    if (
      tokensRef.current.wave.accessToken
      && currentVenue
      && await checkOut(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, false) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await checkOut(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, false);
    }

    await logout(dispatch);
  };

  useEffect(() => {
    (async () => {
      await handleGetAccountInfo();
    })();
  }, []);

  return (
    <ScreenContainer>
      <div id="account-info">
        <ScreenHeader title="Account Overview" />

        {
          accountInfo.username
            && (
              <div id="account-info-body" className="p-3">
                <div className="mb-3">
                  <label> Name </label>
                  <div> { accountInfo.firstName + ' ' + accountInfo.lastName } </div>
                </div>

                <div className="mb-3">
                  <label> Username </label>
                  <div> { accountInfo.username } </div>
                </div>

                <div className="mb-3">
                  <div id="account-venues-header">
                    <label className="mb-1"> Your Venues </label>

                    <Link to="/register-venue" title="Register a new venue">
                      Register a new venue
                    </Link>
                  </div>

                  {
                    (accountInfo.venues && accountInfo.venues.length > 0)
                      ? (
                        <div id="account-venues" className="list">
                          {
                            accountInfo.venues.map((ownedVenue) => {
                              return (
                                <Link
                                  to={`/venue/${ownedVenue._id}`}
                                  className="account-venue list-item clickable"
                                  key={ownedVenue._id}
                                  title={`Go to ${ownedVenue.name}`}
                                >
                                  <div className="venue-name">
                                    { ownedVenue.name }
                                  </div>

                                  <FontAwesomeIcon icon={faArrowCircleRight} size="lg" />
                                </Link>
                              );
                            })
                          }
                        </div>
                      ) : (
                        <div id="no-venues">
                          You currently have no registered venues.
                        </div>
                      )
                  }
                </div>

                <div id="account-links">
                  <Link to="/settings" className="mb-2">
                    App Settings
                  </Link>

                  <Link to="/account/delete" className="mb-2">
                    Delete account
                  </Link>

                  <Link
                    to="/"
                    className="mb-2"
                    title="Log out"
                    onClick={handleLogout}
                  >
                    Log out
                  </Link>

                  <a href="/wave-ios.p12" download> Download Wave for iOS </a>
                </div>
              </div>
            )
        }
      </div>
    </ScreenContainer>
  );
};

export default AccountInfo;
