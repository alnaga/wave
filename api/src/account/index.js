import { Router } from 'express';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { User } from '../models/user';

import { AUTHORISATION } from '../constants';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username.length === 0 || password.length === 0) {
    res.status(400).send({
      message: 'Missing username or password.'
    });
  }

  User.findOne({ username }, async (error, user) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error.'
      });
    } else {
      if (user) {
        const match = await bcrypt.compare(password, user.password);

        if (match) {
          const tokenResponse = await axios.post('http://localhost:8081/oauth/token', null, {
            headers: {
              'Authorization': `Basic ${AUTHORISATION}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {
              grant_type: 'password',
              username,
              password: user.password
            }
          });

          if (tokenResponse.status === 200) {
            res.status(200).send(tokenResponse.data);
          } else {
            res.status(500).send({
              message: 'An error occurred while logging in. Please try again later.'
            });
          }
        } else {
          res.status(400).send({
            message: 'Invalid account credentials.'
          });
        }
      } else {
        res.status(400).send({
          message: 'Invalid account credentials.'
        });
      }
    }
  });
});

router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.query;

  const refreshResponse = await axios.post('http://localhost:8081/oauth/token', null, {
    headers: {
      'Authorization': `Basic ${AUTHORISATION}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      grant_type: 'refresh_token',
      refresh_token
    }
  }).catch((error) => {
    console.error(error.message);
  });
  
  if (refreshResponse && refreshResponse.status === 200) {
    res.status(200).send(refreshResponse.data);
  } else if (refreshResponse && refreshResponse.status === 400) {
    res.status(400).send({
      message: 'Invalid refresh token.'
    });
  } else {
    res.status(500).send({
      message: 'An error occurred while fetching a new access token. Please try again later.'
    });
  }
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (username.length === 0 || password.length === 0) {
    res.status(400).send({
      message: 'Missing username or password.'
    });
  }

  // Generate a hash of the user's password. This is what will be stored in the database.
  const passwordHash = await bcrypt.hash(password, 10);

  // Check to see whether the username already exists in the database and creates one if it doesn't.
  User.findOne({ username }, (error, user) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error.'
      });
    } else {
      if (user) {
        res.status(400).send({
          message: 'That username is already taken. Please select a different one.'
        });
      } else {
        const newUser = new User({
          username,
          password: passwordHash
        });

        newUser.save((error, user) => {
          if (error) {
            res.status(500).send({
              message: 'Something went wrong during registration. Please try again later.'
            });
          } else {
            console.log('New User:', user);
            res.status(200).send({
              message: 'Registration Successful'
            });
          }
        });
      }
    }
  });
});

module.exports = router;
