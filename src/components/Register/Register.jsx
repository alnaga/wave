import React, { useState } from 'react';

import { registerAccount } from '../../actions/account/accountActions';
import { useAppDispatch } from '../../context/context';

const Register = () => {
  const [ data, setData ] = useState({
    username: '',
    password: '',
    passwordConfirmation: ''
  });
  const [ error, setError ] = useState('');

  const dispatch = useAppDispatch();

  const handleDismissError = () => {
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!data.username) setError('Please enter a username.');
    else if (!data.password) setError('Please enter a password.')
    else if (data.password !== data.passwordConfirmation) {
      setError('Passwords do not match.');
    } else {
      await registerAccount(dispatch, data);
    }
  };

  const handleTextChange = (field) => (event) => {
    const value = event.target.value;

    setData((prevState) => ({
      ...prevState,
      [field]: value
    }));
  };

  return (
    <div id="registration" className="container-sm d-flex justify-content-center">
      <form className="account-form card d-flex flex-column justify-content-center">
        <div className="card-header"> Registration </div>

        <div className="card-body d-flex flex-column justify-content-center">
          <div className="form-group">
            <label htmlFor="username"> Username </label>
            <input
              id="username"
              className="form-control"
              type="text"
              onChange={handleTextChange('username')}
              placeholder="Username"
              value={data.username}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password"> Password </label>
            <input
              id="password"
              className="form-control"
              type="password"
              onChange={handleTextChange('password')}
              placeholder={"Password"}
              value={data.password}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirmation"> Confirm Password </label>
            <input
              className="form-control"
              id="passwordConfirmation"
              type="password"
              onChange={handleTextChange('passwordConfirmation')}
              placeholder={"Confirm Password"}
              value={data.passwordConfirmation}
            />
          </div>

          {
            error
              && (
                <div className="alert alert-danger alert-dismissible">
                  { error }

                  <button type="button" className="close" onClick={handleDismissError}>
                    <span> &times; </span>
                  </button>
                </div>
              )
          }

          <button className="btn btn-primary" type="submit" onClick={handleSubmit}> Register </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
