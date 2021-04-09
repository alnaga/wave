import React, { useState } from 'react';

import { registerAccount } from '../../actions/account/accountActions';
import { useAppDispatch } from '../../context/context';

const Register = () => {
  const [ data, setData ] = useState({
    username: '',
    password: ''
  });

  const dispatch = useAppDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    <form className="flex-column">
      <div>
        <input
          type="text"
          onChange={handleTextChange('username')}
          placeholder="Username"
          value={data.username}
        />
      </div>

      <div>
        <input
          type="password"
          onChange={handleTextChange('password')}
          placeholder={"Password"}
          value={data.password}
        />
      </div>

      <button type="submit" onClick={handleSubmit}> Register </button>
    </form>
  );
};

export default Register;
