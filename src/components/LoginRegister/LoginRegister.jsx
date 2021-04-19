import React, { useState } from 'react';

import { login, registerAccount } from '../../actions/account/accountActions';
import { useAppDispatch } from '../../context/context';

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
  const [ showLogin, setShowLogin ] = useState(false);

  const dispatch = useAppDispatch();

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
    <div id="login-register" className="container-sm d-flex justify-content-center pl-0 pl-sm-3 pr-0 pr-sm-3">
      <form className="card d-flex flex-column justify-content-center mt-0 mt-sm-5">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-center mt-2">
            {
              showLogin
                ? 'Log In'
                : 'Register'
            }
          </h5>

          <div className="flex-grow-1">
            <div className="mt-2 text-center">
              The way you interact with music is about to change.
              <br />
              Enter your details to
              {
                showLogin
                  ? ' log in!'
                  : ' get started!'
              }
            </div>

            {
              !showLogin
                && (
                  <>
                    <div className="form-group mt-3">
                      <label className="mb-1" htmlFor="first-name"> First Name </label>
                      <input
                        id="first-name"
                        className="form-control"
                        type="text"
                        onChange={handleFormChange('firstName')}
                        placeholder="First Name"
                        required
                        value={data.firstName}
                      />
                    </div>

                    <div className="form-group mt-3">
                      <label className="mb-1" htmlFor="last-name"> Last Name </label>
                      <input
                        id="last-name"
                        className="form-control"
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

            <div className="form-group mt-3">
              <label className="mb-1" htmlFor="username"> Username </label>
              <input
                id="username"
                className="form-control"
                type="text"
                onChange={handleFormChange('username')}
                placeholder="Username"
                required
                value={data.username}
              />
            </div>

            <div className="form-group mt-3">
              <label className="mb-1" htmlFor="password"> Password </label>
              <input
                id="password"
                className="form-control"
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
                <div className="form-group mt-3">
                  <label className="mb-1" htmlFor="passwordConfirmation"> Confirm Password </label>
                  <input
                    className="form-control"
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
          </div>


          {
            error
            && (
              <div className="alert alert-danger alert-dismissible mt-3 mb-0">
                { error }

                <button type="button" className="close" onClick={handleDismissError}>
                  <span> &times; </span>
                </button>
              </div>
            )
          }

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

            <div className="mt-4 text-center">
              <a className="pointer" onClick={handleToggleShowLogin}>
                {
                  showLogin
                    ? 'Want to register instead? Click here.'
                    : 'Already have an account? Click here to log in.'
                }
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginRegister;
