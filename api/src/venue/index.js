import { Router } from 'express';
import { User } from '../models/user';
import { Token } from '../models/token';
import { Venue } from '../models/venue';

import {
  authenticate,
  getUserByAccessToken,
  getUsersByIds,
  getVenueById,
  userHasVoted,
  userIsCheckedIn
} from '../util';
import {VOTE_DOWN, VOTE_UP} from '../constants';

const router = Router();

// Specify the allowed methods for this subroute.
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'PATCH, POST, DELETE, GET').send();
});

// Attempts to delete a venue from the database. Only venue owners are authorised to successfully submit this request.
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

// Fetches information about a venue and returns it to the client.
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
              outputDeviceId: venue.outputDeviceId,
              owners,
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

// Attempts to update venue information in the database.
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

// Attempts to add a new venue to the database.
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
          message: 'Internal server error during venue registration.'
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
          votedUsers: [],
          votes: 0
        });

        await newVenue.save(async (error, venue) => {
          if (error) {
            res.status(500).send({
              message: 'Internal server error during venue registration.'
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
                votes: venue.votes
              },
              message: 'Venue registration successful!'
            });
          }
        });
      }
    });
  }
});

// Attempts to check a user into a venue.
router.post('/check-in', authenticate, async (req, res) => {
  const { venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

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
      await User.findOne({ username: token.user.username }, async (error, user) => {
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
            } else if (venue && venue.attendees.includes(user._id)) {
              res.status(400).send({
                message: 'User already checked in.'
              });
            } else {
              await Venue.updateOne({ _id: venueId }, {
                $addToSet: {
                  attendees: user._id
                }
              }, async (error, result) => {
                if (error || result.modifiedCount === 0) {
                  res.status(500).send({
                    message: 'Internal server error occurred while checking into venue.'
                  });
                } else {
                  // If the user is already checked in at another venue, check them out before checking them into
                  // the new one.
                  if (user.currentVenue !== venueId) {
                    await Venue.updateOne({ _id: user.currentVenue }, {
                      $pull: {
                        attendees: user._id
                      }
                    });
                  }

                  await User.updateOne({ _id: user._id }, {
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

// Attempts to check a user out of a venue.
router.post('/check-out', authenticate, async (req, res) => {
  const { venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

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
      await User.findOne({ username: token.user.username }, async (error, user) => {
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
            } else if (venue && !venue.attendees.includes(user._id)) {
              res.status(400).send({
                message: 'User not checked in.'
              });
            } else {
              await Venue.updateOne({ _id: venueId }, {
                $pull: {
                  attendees: `${user._id}`
                }
              }, async (error, result) => {
                if (error || result.modifiedCount === 0) {
                  res.status(500).send({
                    message: 'Internal server error occurred while checking out.'
                  });
                } else {
                  await User.updateOne({ _id: user._id }, {
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

// Searches the venues in the database to find the list of venues whose names contain a full or partial match for the search query.
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
        delete result.description;
        delete result.address;
        delete result.googleMapsLink;
        delete result.owners;
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

// Casts a vote for the currently playing song in a venue.
router.post('/vote', authenticate, async (req, res) => {
  const { venueId, vote } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  let voteValue = 0;

  if (vote === VOTE_UP) {
    voteValue = 1;
  } else if (vote === VOTE_DOWN) {
    voteValue = -1;
  }

  await getUserByAccessToken(accessToken, res, async (user) => {
    await getVenueById(venueId, res, async (venue) => {
      if (venue) {
        if (!userIsCheckedIn(venue, user)) {
          res.status(400).send({
            message: 'User casting vote is not checked into the target venue.'
          });
        } else if (venue.votedUsers && userHasVoted(venue, user)) {
          res.status(400).send({
            message: 'User casting vote has already voted this round.'
          });
        } else {
          Venue.updateOne({ _id: venueId }, {
            $addToSet: {
              votedUsers: user._id
            },
            $inc: {
              votes: voteValue
            }
          }, async (error, result) => {
            if (error) {
              res.status(500).send({
                message: 'Internal server error.'
              });
            } else if (result.nModified === 1) {
              let skipped = false;

              let newVotes = venue.votes + voteValue;

              // If the number of negative votes exceeds the threshold, skip the song and reset the votes value.
              if (newVotes < (-venue.attendees.length / 2)) {
                await skipTrack(venue.spotifyTokens.accessToken);
                await Venue.updateOne({ _id: venueId }, {
                  $set: {
                    votedUsers: [],
                    votes: 0
                  }
                });
                newVotes = 0;
                skipped = true;
              }

              await getUsersByIds(venue.attendees, res, async (attendees) => {
                await getUsersByIds(venue.owners, res, async (owners) => {
                  res.status(200).send({
                    venue: {
                      ...venue.toObject(),
                      _id: undefined,
                      id: venue._id,
                      attendees,
                      currentSong: undefined,
                      googleMapsLink: undefined,
                      owners,
                      spotifyConsent: undefined,
                      spotifyTokens: undefined,
                      votes: newVotes
                    },
                    skipped
                  });
                });
              });
            } else {
              console.error('Could not find venue.');
              res.status(500).send({
                message: 'Internal server error.'
              });
            }
          });
        }
      }
    });
  });
});

module.exports = router;
