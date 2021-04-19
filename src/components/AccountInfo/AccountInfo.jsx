import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getAccountDetails, logout } from '../../actions/account/accountActions';

const AccountInfo = () => {
  const dispatch = useAppDispatch();
  const { accountDetails, tokens } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetAccountDetails = async () => {
    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.wave.user.username
      && await getAccountDetails(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.wave.user.username) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getAccountDetails(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.wave.user.username);
    }
  };

  const handleLogout = async () => {
    await logout(dispatch);
  };

  useEffect(() => {
    (async () => {
      if (!accountDetails.username) {
        await handleGetAccountDetails();
      }
    })();
  }, []);

  return (
    <ScreenContainer>
      <div className="p-3 pb-0">
        Account Info
      </div>

      <div className="p-3">
        <div>
          <label> Name </label>
          <div> { accountDetails.firstName + ' ' + accountDetails.lastName } </div>
        </div>

        <div>
          <label> Username </label>
          <div> { accountDetails.username } </div>
        </div>

        {
          (accountDetails.venues && accountDetails.venues.length > 0)
            && (
              <>
                <div>
                  Owned Venues
                </div>

                {
                  accountDetails.venues.map((ownedVenue) => {
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
