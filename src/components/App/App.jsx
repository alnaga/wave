import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

import CookiesBanner from '../CookiesBanner/CookiesBanner';
import Dashboard from '../Dashboard/Dashboard';
import Header from '../Header/Header';
import StatusBar from '../StatusBar/StatusBar';

import { pushToHistory } from '../../actions/history/historyActions';
import { useAppDispatch, useAppState } from '../../context/context';

const App = (props) => {
  const dispatch = useAppDispatch();
  const { history, tokens } = useAppState();

  // Whenever the URL changes (i.e. the user navigates around the app), the new URL is added to the 'history' context
  // array to enable the back button in the header to keep track of where to redirect the user to when it is clicked.
  useEffect(() => {
    if (props.history.location.pathname !== history[history.length - 1]) {
      pushToHistory(dispatch, history, props.history.location.pathname);
    }
  }, [props.history, window.location.pathname]);

  return (
    <div id="app">
      <Header />

      <div id="app-content" className="d-flex justify-content-center">
        <Dashboard />
      </div>

      <CookiesBanner />

      <StatusBar />
    </div>
  );
};

export default withRouter(App);
