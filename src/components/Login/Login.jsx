import React, { useState } from 'react';

import { login } from '../../actions/account/accountActions';
import { useAppDispatch } from '../../context/context';

const Login = () => {
  const [ data, setData ] = useState({
    username: '',
    password: ''
  });

  const dispatch = useAppDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(dispatch, data);
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
          placeholder="Password"
          onChange={handleTextChange('password')}
          value={data.password}
        />
      </div>

      <button type="submit" onClick={handleSubmit}> Log In </button>
    </form>
  );
};

export default Login;
