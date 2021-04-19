import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getAccountInfo, logout } from '../../actions/account/accountActions';

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
      <div className="p-3 pb-0">
        Account Overview
      </div>

      <div className="p-3">
        <div>
          <label> Name </label>
          <div> { accountInfo.firstName + ' ' + accountInfo.lastName } </div>
        </div>

        <div>
          <label> Username </label>
          <div> { accountInfo.username } </div>
        </div>

        {
          (accountInfo.venues && accountInfo.venues.length > 0)
            && (
              <>
                <div>
                  Owned Venues
                </div>

                {
                  accountInfo.venues.map((ownedVenue) => {
                    return (
                      <div key={ownedVenue._id}>
                        <Link to={`/venue/${ownedVenue._id}`}>
                          { ownedVenue.name }
                        </Link>
                      </div>
                    );
                  })
                }
              </>
            )
        }

        <Link to="/register-venue">
          Register a Venue
        </Link>

        <div onClick={handleLogout}>
          Log Out
        </div>
      </div>
    </ScreenContainer>
  );
};

export default AccountInfo;
