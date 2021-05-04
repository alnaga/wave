import React, { useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { deleteAccount } from '../../actions/account/accountActions';

const DeleteAccount = () => {
  const dispatch = useAppDispatch();
  const { tokens } = useAppState();

  const [ deleteSuccess, setDeleteSuccess ] = useState(false);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleDeleteAccount = async () => {
    let result = await deleteAccount(dispatch, tokensRef.current.wave.accessToken);

    if (
      tokensRef.current.wave.accessToken
      && result === TOKENS_EXPIRED
    ) {
      result = await refreshExpiredTokens(dispatch, tokensRef.current.wave.accessToken);
      await deleteAccount(dispatch, tokensRef.current.wave.accessToken);
    }

    if (result) {
      setDeleteSuccess(true);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Confirm Account Deletion"
        subtitle="Are you sure you want to continue?"
      />

      {
        deleteSuccess
          && (
            <Redirect to="/" />
          )
      }

      <div className="p-3">
        <button onClick={handleDeleteAccount}>
          Yes, I want to delete my account.
        </button>
      </div>

    </ScreenContainer>
  );
};

export default withRouter(DeleteAccount);
