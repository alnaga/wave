import React, { useState } from 'react';

const Register = () => {
  const [ data, setData ] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = () => {
    console.log('Submitting', data);
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
