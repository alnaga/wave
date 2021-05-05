import { Router } from 'express';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { Token } from '../models/token';
import { User } from '../models/user';
import { Venue } from '../models/venue';

import { authenticate } from '../util';
import { API_URL, AUTHORISATION } from '../constants';

const router = Router();

const getVenuesByIds = async (venueIds, res, callback) => {
  const venues = await venueIds.map(async (venueId) => {
    return Venue.findOne({ _id: venueId }, (error) => {
      if (error) {
        res.status(500).send({
          message: 'Internal server error.'
        });
      }
    }).select({
      address: 1,
      name: 1
    });
  });

  callback(await Promise.all(venues));
};

// Specify the allowed methods for this subroute.
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST, DELETE, GET').send();
});

router.delete('/', authenticate, async (req, res) => {
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  if (accessToken) {
    await Token.findOne({ accessToken }, async (error, token) => {
      if (error) {
        res.status(500).send({
          message: 'Internal server error occurred while deleting account.'
        });
      } else if (!token) {
        res.status(400).send({
          message: 'Invalid access token.'
        })
      } else {
        // We need to find the user so we can check whether we need to delete any venues.
        await User.findOne({ username: token.user.username }, async (error, user) => {
          if (error) {
            res.status(500).send({
              message: 'Internal server error occurred while deleting user.'
            });
          } else if (!user) {
            res.status(400).send({
              message: 'Invalid user.'
            });
          } else {
            // If the user owns any venues, check to see whether they need to be deleted (if they are the only owner).
            await getVenuesByIds(user.venues, res, async (venues) => {
              if (venues.length > 0) {
                const deletingVenues = await venues.map((venue) => {
                  // If this owner is the last owner left, the venue must be deleted.
                  if (venue.owners.length === 1) {
                    return Venue.deleteOne({ _id: venue._id }, (error, result) => {
                      if (error || result.nModified === 0) {
                        res.status(500).send({
                          message: 'Internal server error occurred while deleting user\'s owned venues.'
                        });
                      }
                    });
                  }
                });

                await Promise.all(deletingVenues);
              }
            });

            // We need to check whether the user is checked into any venues, and check them out if they are.
            await Venue.find({ attendees: user._id }, async (error, venues) => {
              if (venues.length > 0) {
                const checkingOutOfVenues = await venues.map((venue) => {
                  return Venue.updateOne({ _id: venue._id }, {
                    $pull: {
                      attendees: user._id
                    }
                  });
                });

                await Promise.all(checkingOutOfVenues);
              }
            });

            await User.deleteOne({ _id: user._id }, (error, result) => {
              if (error || result.nModified === 0) {
                res.status(500).send({
                  message: 'Internal server error occurred while deleting user.'
                });
              } else {
                res.status(200).send({
                  message: 'Account deleted successfully.'
                });
              }
            });
          }
        });
      }
    });
  }
});

// Fetches details about a specific account.
router.get('/', authenticate, async (req, res) => {
  const { username } = req.query;

  User.findOne({ username }, async (error, user) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error.'
      });
    } else if (user) {
      await getVenuesByIds(user.venues, res, (venues) => {
        // Remove the password field from the user object that is returned to the user to preserve security.
        res.status(200).send({
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          venues
        });
      });
    } else {
      res.status(400).send({
        message: 'Invalid user.'
      });
    }
  });
});

// Attempts to log the user in and return the authorisation tokens needed for all subsequent requests.
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
          const tokenResponse = await axios.post(`${API_URL}/oauth/token`, null, {
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

// Gets a new set of authorisation tokens from the OAuth 2 server and returns them to the client.
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.query;

  const refreshResponse = await axios.post(`${API_URL}/oauth/token`, null, {
    headers: {
      'Authorization': `Basic ${AUTHORISATION}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      grant_type: 'refresh_token',
      refresh_token
    }
  }).catch((error) => error.response);

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

// Attempts to add a new user to the database.
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
          message: 'That username is already taken. Please enter a different one.'
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
