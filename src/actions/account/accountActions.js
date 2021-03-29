import axios from 'axios';

export const login = async (dispatch, userData) => {
  const response = await axios.post('http://localhost:8081/account/login', userData);

  if (response.status === 200) {
    // Handle successful login.
  }
};

export const registerAccount = async (dispatch, userData) => {
  const response = await axios.post('http://localhost:8081/account/register', userData);

  if (response.status === 200) {
    // Handle successful registration.
  }
};