import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

import Dashboard from '../Dashboard/Dashboard';
import Header from '../Header/Header';
import LoginRegister from '../LoginRegister/LoginRegister';

import { pushToHistory } from '../../actions/history/historyActions';
import { useAppDispatch, useAppState } from '../../context/context';

const App = (props) => {
  const dispatch = useAppDispatch();
  const { history, tokens } = useAppState();
  const { wave } = tokens;

  // console.log(useAppState());

  useEffect(() => {
    if (props.history.location.pathname !== history[history.length - 1]) {
      pushToHistory(dispatch, history, props.history.location.pathname);
    }
  }, [props.history, window.location.pathname]);

  return (
    <div id="app">
      <Header />

      <div id="app-content" className="d-flex justify-content-center">
        {
          wave.accessToken
            ? (
              <Dashboard />
            ) : (
              <LoginRegister />
            )
        }
      </div>
    </div>
  );
};

export default withRouter(App);
