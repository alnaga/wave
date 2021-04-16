import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { popHistory } from '../../actions/history/historyActions';
import { useAppDispatch, useAppState } from '../../context/context';

// TODO: Handle browser forward/back events
const BackButton = (props) => {
  const dispatch = useAppDispatch();
  const { history } = useAppState();

  const handleGoBack = () => {
    popHistory(dispatch, history);
  };

  return (
    <>
      {
        (history.length > 1 && props.history.location.pathname !== history[history.length - 2])
          && (
            <Link
              className="mr-3"
              onClick={handleGoBack}
              to={history[history.length - 2]}
            >
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </Link>
          )
      }
    </>
  );
};

export default withRouter(BackButton);
