import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

import Error from '../Error/Error';
import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { login, registerAccount } from '../../actions/account/accountActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './LoginRegister.scss';

const LoginRegister = () => {
  const [ data, setData ] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    passwordConfirmation: ''
  });
  const [ error, setError ] = useState('');
  const [ showLogin, setShowLogin ] = useState(true);

  const dispatch = useAppDispatch();
  const { tokens } = useAppState();

  const handleDismissError = () => {
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!showLogin && !data.firstName) {
      setError('Please enter a first name.');
    } else if (!showLogin && !data.lastName) {
      setError('Please enter a last name.');
    } else if (!data.username) {
      setError('Please enter a username.');
    } else if (!data.password) {
      setError('Please enter a password.')
    }  else if (!showLogin && data.password !== data.passwordConfirmation) {
      setError('Passwords do not match.');
    } else {
      setError('');
      if (showLogin) await login(dispatch, data);
      else await registerAccount(dispatch, data);
    }
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;

    setData((prevState) => ({
      ...prevState,
      [field]: value
    }));
  };

  const handleToggleShowLogin = () => {
    setError('');
    setShowLogin(!showLogin);
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title={showLogin ? 'Login' : 'Register'}
        subtitle={
          `The way you interact with music is about to change. Enter your details to ${showLogin ? 'log in' : 'get started'}!`
        }
      />

      {
        tokens.wave.accessToken
        && <Redirect to="/" />
      }

      <form className="mr-3 ml-3">
        {
          !showLogin
            && (
              <>
                <div className="form-section mt-3">
                  <label className="mb-1" htmlFor="first-name"> First Name </label>
                  <input
                    id="first-name"
                    type="text"
                    onChange={handleFormChange('firstName')}
                    placeholder="First Name"
                    required
                    value={data.firstName}
                  />
                </div>

                <div className="form-section mt-3">
                  <label className="mb-1" htmlFor="last-name"> Last Name </label>
                  <input
                    id="last-name"
                    type="text"
                    onChange={handleFormChange('lastName')}
                    placeholder="Last Name"
                    required
                    value={data.lastName}
                  />
                </div>
              </>
            )
        }

        <div className="form-section mt-3">
          <label className="mb-1" htmlFor="username"> Username </label>
          <input
            id="username"
            type="text"
            onChange={handleFormChange('username')}
            placeholder="Username"
            required
            value={data.username}
          />
        </div>

        <div className="form-section mt-3">
          <label className="mb-1" htmlFor="password"> Password </label>
          <input
            id="password"
            type="password"
            onChange={handleFormChange('password')}
            placeholder={"Password"}
            required
            value={data.password}
          />
        </div>

        {
          !showLogin
            && (
              <div className="form-section mt-3">
                <label className="mb-1" htmlFor="passwordConfirmation"> Confirm Password </label>
                <input
                  id="passwordConfirmation"
                  type="password"
                  onChange={handleFormChange('passwordConfirmation')}
                  placeholder={"Confirm Password"}
                  required
                  value={data.passwordConfirmation}
                />
              </div>
            )
        }

        <Error
          className="mt-3"
          message={error}
          onDismiss={handleDismissError}
          show={error}
        />

        <div className="form-group d-flex flex-column justify-content-center mt-3">
          <button
            className="btn btn-primary flex-grow-1"
            type="submit"
            onClick={handleSubmit}
          >
            {
              showLogin
                ? 'Log In'
                : 'Register'
            }
          </button>
        </div>
      </form>

      <div className="text-center mt-4 mb-4 ml-3 mr-3">
        <a className="pointer" onClick={handleToggleShowLogin}>
          {
            showLogin
              ? 'Want to register instead? Click here.'
              : 'Already have an account? Click here to log in.'
          }
        </a>
      </div>
    </ScreenContainer>
  );
};

export default LoginRegister;
