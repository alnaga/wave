import { Router } from 'express';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { User } from '../models/user';
import { Venue } from '../models/venue';

import { authenticate } from '../util';
import { AUTHORISATION } from '../constants';

const router = Router();

router.get('/account', authenticate, async (req, res) => {
  const { username } = req.query;

  User.findOne({ username }, async (error, user) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error.'
      });
    } else if (user) {
      let venues = [];

      // Fetch the foreign key data for each item in the user's venues array.
      for (let venueId of user.venues) {
        await Venue.findOne({
          _id: venueId
        }, async (error, venue) => {
          if (error) {
            res.status(500).send({
              message: 'Internal server error occurred while fetching account data.'
            });
          } else if (!venue) {
            // The venue no longer exists and so it must be deleted from the User object.
            const removedIndex = user.venues.findIndex((removed) => removed === venueId);

            const newVenues = user.venues;
            newVenues.splice(removedIndex, 1);

            await User.updateOne({ username }, {
              venues: newVenues
            });
          } else {
            venues.push({
              _id: venue._id,
              address: venue.address,
              name: venue.name
            });
          }
        })
      }

      // Remove the password field from the user object that is returned to the user to preserve security.
      res.status(200).send({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        venues
      });
    } else {
      res.status(400).send({
        message: 'Invalid user.'
      });
    }
  });
});

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
  const {
    firstName,
    lastName,
    username,
    password
  } = req.body;

  if (
    firstName.length === 0
    || lastName.length === 0
    ||username.length === 0
    || password.length === 0
  ) {
    res.status(400).send({
      message: 'Missing account information.'
    });
  }

  // Generate a hash of the user's password. This is what will be stored in the database.
  const passwordHash = await bcrypt.hash(password, 10);

  // Check to see whether the username already exists in the database and creates one if it doesn't.
  User.findOne({ username }, (error, user) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error during account registration.'
      });
    } else {
      if (user) {
        res.status(400).send({
          message: 'That username is already taken. Please select a different one.'
        });
      } else {
        const newUser = new User({
          firstName,
          lastName,
          username,
          password: passwordHash,
          venues: []
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
