import React from 'react';

import Dashboard from '../Dashboard/Dashboard';
import Header from '../Header/Header';
import LoginRegister from '../LoginRegister/LoginRegister';

import { useAppState } from '../../context/context';

const App = () => {
  const { tokens } = useAppState();
  const { wave } = tokens;

  // console.log(useAppState());

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

export default App;
