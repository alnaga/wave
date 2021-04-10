import React, { useState } from 'react';

import { login, registerAccount } from '../../actions/account/accountActions';
import { useAppDispatch } from '../../context/context';

const LoginRegister = () => {
  const [ data, setData ] = useState({
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

    if (!data.username) setError('Please enter a username.');
    else if (!data.password) setError('Please enter a password.')
    else if (!showLogin && data.password !== data.passwordConfirmation) {
      setError('Passwords do not match.');
    } else {
      setError('');
      if (showLogin) await login(dispatch, data);
      else await registerAccount(dispatch, data);
    }
  };

  const handleTextChange = (field) => (event) => {
    const value = event.target.value;

    setData((prevState) => ({
      ...prevState,
      [field]: value
    }));
  };

  const handleToggleShowLogin = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div id="login-register" className="container-sm d-flex justify-content-center">
      <form className="account-form card d-flex flex-column justify-content-center">
        <div className="card-body d-flex flex-column justify-content-center">
          <h5 className="card-title">
            {
              showLogin
                ? 'Log In'
                : 'Register'
            }
          </h5>

          <div className="mt-2">
            The way you interact with music is about to change.
            Enter your details to
            {
              showLogin
                ? ' log in!'
                : ' get started!'
            }
          </div>

          <div className="form-group mt-3">
            <label className="mb-1" htmlFor="username"> Username </label>
            <input
              id="username"
              className="form-control"
              type="text"
              onChange={handleTextChange('username')}
              placeholder="Username"
              value={data.username}
            />
          </div>

          <div className="form-group mt-3">
            <label className="mb-1" htmlFor="password"> Password </label>
            <input
              id="password"
              className="form-control"
              type="password"
              onChange={handleTextChange('password')}
              placeholder={"Password"}
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
                  onChange={handleTextChange('passwordConfirmation')}
                  placeholder={"Confirm Password"}
                  value={data.passwordConfirmation}
                />
              </div>
              )
          }

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

          <div className="form-group d-flex justify-content-center mt-3">
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

          <div className="mt-4 text-center">
            <a className="pointer" onClick={handleToggleShowLogin}> Already have an account? Click here to log in. </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginRegister;
