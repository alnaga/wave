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

import './AccountInfo.scss';

const AccountInfo = () => {
  const dispatch = useAppDispatch();
  const { accountInfo, tokens } = useAppState();

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
    await logout(dispatch);
  };

  useEffect(() => {
    (async () => {
      if (!accountInfo.username) {
        await handleGetAccountInfo();
      }
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

                  <Link to="/delete" className="mb-2">
                    Delete account
                  </Link>

                  <Link
                    to="/"
                    title="Log out"
                    onClick={handleLogout}
                  >
                    Log out
                  </Link>
                </div>
              </div>
            )
        }
      </div>
    </ScreenContainer>
  );
};

export default AccountInfo;
