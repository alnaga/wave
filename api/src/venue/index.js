import { Router } from 'express';
import { User } from '../models/user';
import { Token } from '../models/token';
import { Venue } from '../models/venue';

import { authenticate, getUserByAccessToken, getUsersByIds } from '../util';

const router = Router();

router.delete('/', authenticate, async (req, res) => {
  const { venueId } = req.query;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  if (venueId) {
    await getUserByAccessToken(accessToken, res, async (user) => {
      await Venue.findOne({ _id: venueId }, async (error, venue) => {
        if (error) {
          res.status(500).send({
            message: 'Internal server error occurred while deleting venue.'
          });
        } else if (!venue.owners.includes(user._id)) {
          res.status(401).send({
            message: 'User making request is not authorised to delete venue.'
          });
        } else {
          await User.find({ venues: venueId }, async (error, owners) => {
            const removingVenueFromOwners = await owners.map(async (owner) => {
              return User.updateOne({ _id: owner._id }, {
                $pull: {
                  venues: venue._id
                }
              });
            });

            await Promise.all(removingVenueFromOwners);
            await Venue.deleteOne({ _id: venueId }, (error, result) => {
              if (error || result.nModified === 0) {
                res.status(500).send({
                  message: 'Internal server error occurred while deleting venue.'
                });
              } else {
                res.status(200).send({
                  message: 'Venue deleted successfully.'
                });
              }
            });
          });
        }
      });
    });
  } else {
    res.status(400).send({
      message: 'Missing venue ID.'
    });
  }
});

router.get('/', authenticate, async (req, res) => {
  const { id } = req.query;

  await Venue.findOne({ _id: id }, async (error, venue) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error occurred while fetching venue data.'
      });
    } else if (venue) {
      await getUsersByIds(venue.attendees, res, async (attendees) => {
        await getUsersByIds(venue.owners, res, (owners) => {
          res.status(200).send({
            venue: {
              id: venue._id,
              address: venue.address,
              attendees,
              description: venue.description,
              googleMapsLink: venue.googleMapsLink,
              name: venue.name,
              owners,
              songHistory: venue.songHistory,
              votes: venue.votes || 0
            }
          });
        });
      });
    } else {
      res.status(400).send({
        message: 'Invalid venue.'
      });
    }
  });
});

router.patch('/', authenticate, async (req, res) => {
  const { venueData, venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];
  
  if (venueData && venueId) {
    await getUserByAccessToken(accessToken, res, async (user) => {
      await Venue.findOne({ _id: venueId }, async (error, venue) => {
        if (error) {
          res.status(500).send({
            message: 'Internal server error occurred while updating venue details.'
          });
        } else if (!venue) {
          res.status(400).send({
            message: 'Invalid venue ID.'
          });
        } else {
          if (!venue.owners.includes(user._id)) {
            res.status(401).send({
              message: 'User making request is not authorised to change venue details.'
            });
          } else {
            const {
              name,
              description,
              addressLine1,
              addressLine2,
              city,
              county,
              postcode,
              googleMapsLink
            } = venueData;
            if (!name || !description || !addressLine1 || !city || !county || !postcode) {
              res.status(400).send({
                message: 'Missing fields in update request.'
              });
            } else {
              const address = {
                addressLine1,
                addressLine2,
                city,
                county,
                postcode
              };

              await Venue.updateOne({ _id: venueId }, {
                $set: {
                  name,
                  description,
                  address,
                  googleMapsLink
                }
              }, (error, result) => {
                if (error) {
                  res.status(500).send({
                    message: 'Internal server error occurred while updating venue details.'
                  });
                } else {
                  res.status(200).send({
                    message: 'Venue details updated successfully.'
                  });
                }
              });
            }
          }
        }
      })
    });
  } else {
    res.status(400).send({
      message: 'Missing venue data or venue ID.'
    });
  }
});

router.post('/', authenticate, async (req, res) => {
  const {
    addressLine1,
    addressLine2,
    city,
    county,
    description,
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

  if (!spotifyTokens) {
    res.status(400).send({
      message: 'Missing Spotify tokens.'
    });
  } else {
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
          description,
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
                attendees: venue.attendees,
                description: venue.description,
                googleMapsLink: venue.googleMapsLink,
                name: venue.name,
                owners: [ user ],
                songHistory: venue.songHistory,
                votes: venue.votes
              },
              message: 'Business registration successful!'
            });
          }
        });
      }
    });
  }
});

router.post('/check-in', authenticate, async (req, res) => {
  const { accessToken, venueId } = req.body;

  // Find the user from the access token the request was made with.
  await Token.findOne({ accessToken }, async (error, token) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error occurred while checking into venue.'
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

                  await getUsersByIds(venue.attendees, res, async (attendees) => {
                    await getUsersByIds(venue.owners, res, (owners) => {
                      res.status(200).send({
                        attendees: [
                          ...attendees,
                          {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username
                          }
                        ],
                        id: venue._id,
                        name: venue.name,
                        owners,
                        votes: venue.votes || 0
                      });
                    })
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
