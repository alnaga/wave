import { Router } from 'express';
import { User } from '../models/user';
import { Token } from '../models/token';
import { Venue } from '../models/venue';

import { authenticate } from '../util';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const { id } = req.query;

  await Venue.findOne({ _id: id }, async (error, venue) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error occurred while fetching venue data.'
      });
    } else if (venue) {
      const attendees = [];

      for (let userId of venue.attendees) {
        await User.findOne({ _id: userId }, async (error, user) => {
          if (error) {
            res.status(500).send({
              message: 'Internal server error occurred while fetching venue data.'
            });
          } else if (!user) {
            // The user no longer exists and so it must be deleted from the venue attendees array.
            await Venue.updateOne({ _id: id }, {
              $pull: {
                attendees: userId
              }
            });
          } else {
            attendees.push({
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username
            });
          }
        });
      }

      res.status(200).send({
        venue: {
          id: venue._id,
          address: venue.address,
          attendees,
          googleMapsLink: venue.googleMapsLink,
          name: venue.name,
          songHistory: venue.songHistory,
          votes: venue.votes || 0
        }
      });
    } else {
      res.status(400).send({
        message: 'Invalid venue.'
      });
    }
  });
});

router.post('/', authenticate, async (req, res) => {
  const {
    addressLine1,
    addressLine2,
    city,
    county,
    spotifyConsent,
    googleMapsLink,
    name,
    ownerUsername,
    postcode,
    spotifyTokens
  } = req.body;

  const address = {
    addressLine1,
    addressLine2,
    city,
    county,
    postcode
  }

  await User.findOne({
    username: ownerUsername
  }, async (error, user) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error during business registration.'
      });
    } else {
      const newVenue = new Venue({
        address,
        attendees: [],
        googleMapsLink,
        name,
        owners: [ user._id ],
        spotifyConsent,
        spotifyTokens,
        votes: 0
      });

      await newVenue.save(async (error, venue) => {
        if (error) {
          res.status(500).send({
            message: 'Internal server error during business registration.'
          });
        } else {
          await User.updateOne({ _id: user._id }, {
            $addToSet: {
              venues: venue._id
            }
          });

          res.status(200).send({
            venue: {
              _id: venue._id,
              address: venue.address,
              googleMapsLink: venue.googleMapsLink,
              name: venue.name,
              owners: [ user ],
              songHistory: venue.songHistory
            },
            message: 'Business registration successful!'
          });
        }
      });
    }
  });
});

router.post('/check-in', authenticate, async (req, res) => {
  const { accessToken, venueId } = req.body;

  await Token.findOne({ accessToken }, async (error, token) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error occurred while checking into venue.'
      });
    } else if (token && new Date(token.accessTokenExpiresAt).getTime() < Date.now()) {
      res.status(401).send({
        message: 'Access token expired.'
      });
    } else if (!token) {
      res.status(400).send({
        message: 'Invalid access token.'
      });
    } else {
      const userCheckingIn = await User.findOne({ username: token.user.username }, async (error, user) => {
        if (error) {
          res.status(500).send({
            message: 'Internal server error occurred while checking into venue.'
          });
        } else if (!user) {
          res.status(400).send({
            message: 'Invalid user.'
          });
        } else {
          await Venue.findOne({ _id: venueId }, async (error, venue) => {
            if (error) {
              res.status(500).send({
                message: 'Internal server error occurred while checking into venue.'
              });
            } else if (!venue) {
              res.status(400).send({
                message: 'Invalid venue ID.'
              });
            } else if (venue && venue.attendees.includes(userCheckingIn._id)) {
              res.status(400).send({
                message: 'User already checked in.'
              });
            } else {
              await Venue.updateOne({ _id: venueId }, {
                $addToSet: {
                  attendees: userCheckingIn._id
                }
              }, async (error, result) => {
                if (error || result.modifiedCount === 0) {
                  res.status(500).send({
                    message: 'Internal server error occurred while checking into venue.'
                  });
                } else {
                  // If the user is already checked in at another venue, check them out before checking them into
                  // the new one.
                  if (userCheckingIn.currentVenue !== venueId) {
                    await Venue.updateOne({ _id: userCheckingIn.currentVenue }, {
                      $pull: {
                        attendees: userCheckingIn._id
                      }
                    });
                  }

                  await User.updateOne({ _id: userCheckingIn._id }, {
                    $set: {
                      currentVenue: venue._id
                    }
                  });

                  res.status(200).send({
                    id: venue._id,
                    name: venue.name,
                    votes: venue.votes || 0
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

router.post('/check-out', authenticate, async (req, res) => {
  const { accessToken, venueId } = req.body;

  await Token.findOne({ accessToken }, async (error, token) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error occurred while checking out.'
      });
    } else if (token && new Date(token.accessTokenExpiresAt).getTime() < Date.now()) {
      res.status(401).send({
        message: 'Access token expired.'
      });
    } else if (!token) {
      res.status(400).send({
        message: 'Invalid access token.'
      });
    } else {
      const userCheckingOut = await User.findOne({ username: token.user.username }, async (error, user) => {
        if (error) {
          res.status(500).send({
            message: 'Internal server error occurred while checking out.'
          });
        } else if (!user) {
          res.status(400).send({
            message: 'Invalid user.'
          });
        } else {
          await Venue.findOne({ _id: venueId }, async (error, venue) => {
            if (error) {
              res.status(500).send({
                message: 'Internal server error occurred while checking out.'
              });
            } else if (!venue) {
              res.status(400).send({
                message: 'Invalid venue ID.'
              });
            } else if (venue && !venue.attendees.includes(userCheckingOut._id)) {
              res.status(400).send({
                message: 'User not checked in.'
              });
            } else {
              await Venue.updateOne({ _id: venueId }, {
                $pull: {
                  attendees: `${userCheckingOut._id}`
                }
              }, async (error, result) => {
                if (error || result.modifiedCount === 0) {
                  res.status(500).send({
                    message: 'Internal server error occurred while checking out.'
                  });
                } else {
                  await User.updateOne({ _id: userCheckingOut._id }, {
                    $set: {
                      currentVenue: undefined
                    }
                  });

                  res.status(200).send({
                    message: 'User checked out successfully.'
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

router.get('/search', authenticate, async (req, res) => {
  const query = req.query.q;

  await Venue.find({
    name: {
      $regex: query,
      $options: 'i'
    }
  }, (error, results) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error occurred while searching for venue.'
      });
    } else {
      const returned = [];

      for (let result of results) {
        result = result.toObject();
        delete result.attendees;
        delete result.address;
        delete result.googleMapsLink;
        delete result.owners;
        delete result.songHistory;
        delete result.spotifyConsent;
        delete result.spotifyTokens;
        delete result.votes;
        delete result.__v;
        returned.push(result);
      }

      res.status(200).send([
        ...returned
      ]);
    }
  })
});

module.exports = router;
