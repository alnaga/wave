import React, { useState } from 'react';

import { registerAccount } from '../../actions/account/accountActions';
import { useAppDispatch, useAppState } from '../../context/context';

const Register = () => {
  const [ data, setData ] = useState({
    email: '',
    username: '',
    password: ''
  });

  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    await registerAccount(dispatch, data);
  };

  const handleTextChange = (field) => (event) => {
    const value = event.target.value;

    setData((prevState) => ({
      ...prevState,
        [field]: value
    }));
  };

  return (
    <div>
      <div>
        <input type="text" onChange={handleTextChange('username')} placeholder="Username" />
      </div>

      <div>
        <input type="password" onChange={handleTextChange('password')} placeholder={"Password"} />
      </div>

      <div>
        <button onClick={handleSubmit}> Submit </button>
      </div>
    </div>
  );
};

export default Register;
