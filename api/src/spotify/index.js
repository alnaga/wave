import axios from 'axios';
import { Router } from 'express';

import { authenticate, getUserByAccessToken, getUsersByIds, getVenueById } from '../util';
import { Venue } from '../models/venue';
import {
  AUTHORISATION,
  CLIENT_ID,
  VOTE_DOWN,
  VOTE_UP
} from '../constants';

const router = Router();

// The application is currently only concerned with the UK.
const resultMarket = 'GB';

const skipTrack = async (accessToken) => {
  const spotifyResponse = await axios.post('https://api.spotify.com/v1/me/player/next', null, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
};

// Sends the user to the Spotify app authorisation page to get their permission to link their account with Wave.
// Returns an authorisation code which can be exchanged with an access token later on in the app flow.
router.get('/authorise', (req, res) => {
  const spotifyScopes = `
    user-follow-read 
    user-follow-modify 
    user-top-read 
    app-remote-control 
    streaming 
    user-read-playback-state 
    user-modify-playback-state 
    user-read-currently-playing 
    user-read-email
  `;
  const redirectUri = 'http://localhost:8080';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    `&client_id=${CLIENT_ID}` +
    (spotifyScopes ? `&scope=${encodeURIComponent(spotifyScopes)}` : '') +
    `&redirect_uri=${redirectUri}`
  );
});

// Fetches album information from Spotify's API and forwards the result of the request to the user.
router.get('/album', authenticate, async (req, res) => {
  const { accessToken, albumId } = req.query;

  const spotifyResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (spotifyResponse) {
    if (spotifyResponse.status === 200) {
      res.status(200).send(spotifyResponse.data);
    } else {
      res.status(spotifyResponse.status).send(spotifyResponse.data);
    }
  } else {
    res.status(500).send({
      message: 'Internal server error occurred while fetching album information.'
    });
  }
});

// Fetches information about an artist from Spotify's API and forwards the result of the request to the user.
router.get('/artist', authenticate, async (req, res) => {
  const { accessToken, artistId } = req.query;

  const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (artistResponse) {
    let artistAlbumsResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums?market=${resultMarket}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }).catch((error) => error.response);

    if (artistAlbumsResponse) {
      let { items } = artistAlbumsResponse.data;

      // If there are multiple pages of albums, keep fetching and adding them to the items list until there are no more.
      while (artistAlbumsResponse.data.next !== null) {
        artistAlbumsResponse = await axios.get(artistAlbumsResponse.data.next, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }).catch((error) => error.response);

        if (artistAlbumsResponse) {
          items.push(...artistAlbumsResponse.data.items);
        }
      }

      res.status(artistResponse.status).send({
        albums: {
          ...artistAlbumsResponse.data,
          items
        },
        ...artistResponse.data
      });
    } else {
      res.status(500).send({
        message: 'Internal server error occurred while fetching artist albums.'
      });
    }
  } else {
    res.status(500).send({
      message: 'Internal server error occurred while fetching artist information.'
    });
  }
});

// Fetches the available playback devices from Spotify.
router.get('/devices', authenticate, async (req, res) => {
  const { accessToken } = req.query;

  const spotifyResponse = await axios.get('https://api.spotify.com/v1/me/player/devices', {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  res.status(spotifyResponse.status).send(spotifyResponse.data);
});

// Selects a device for playback through Spotify.
router.put('/devices', authenticate, async (req, res) => {
  const { device } = req.body;
  const { accessToken } = req.query;

  const spotifyResponse = await axios.put('https://api.spotify.com/v1/me/player', {
    device_ids: [ device.id ]
  }, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });

  res.status(spotifyResponse.status).send();
});

// Exchanges the authorisation code acquired previously for an access and refresh token.
router.post('/tokens', async (req, res) => {
  const { authCode } = req.body;

  const spotifyResponse = await axios.post('https://accounts.spotify.com/api/token', null, {
    headers: {
      "Authorization": `Basic ${AUTHORISATION}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    params: {
      "grant_type": "authorization_code",
      "code": authCode,
      "redirect_uri": "http://localhost:8080"
    }
  });

  res.status(spotifyResponse.status).send(spotifyResponse.data);
});

// Fetches a new access token from the Spotify API using the refresh token.
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  const spotifyResponse = await axios.post('https://accounts.spotify.com/api/token', null, {
    headers: {
      "Authorization": `Basic ${AUTHORISATION}`,
      "Content-Type": 'application/x-www-form-urlencoded'
    },
    params: {
      "grant_type": "refresh_token",
      "refresh_token": refreshToken
    }
  });

  res.status(spotifyResponse.status).send(spotifyResponse.data);
});

// Fetches a list of songs from Spotify that matches the user's query.
router.get('/search', async (req, res) => {
  const { accessToken, query } = req.query;

  const spotifyResponse = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=${resultMarket}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  res.status(spotifyResponse.status).send({
    query,
    ...spotifyResponse.data
  });
});

// Gets the currently playing song for the venue's Spotify account.
router.get('/song', authenticate, async (req, res) => {
  const { venueId } = req.query;

  await getVenueById(venueId, res, async (venue) => {
    if (venue.spotifyTokens.accessToken) {
      const spotifyResponse = await axios.get(`https://api.spotify.com/v1/me/player`, {
        headers: {
          "Authorization": `Bearer ${venue.spotifyTokens.accessToken}`
        }
      }).catch((error) => error.response);

      if (spotifyResponse) {
        if (spotifyResponse.status === 200 || spotifyResponse.status === 204) {
          // If the song has changed since the last time this endpoint was queried, update the current song
          // and reset the vote count.
          let votes = venue.votes;

          if (spotifyResponse.status === 200) {
            if (venue.currentSong !== spotifyResponse.data.item.id) {
              votes = 0;
              await Venue.updateOne({ _id: venueId }, {
                $set: {
                  currentSong: spotifyResponse.data.item.id,
                  votes: 0
                }
              });
            }
          } else {
            votes = 0;
            await Venue.updateOne({ _id: venueId }, {
              $set: {
                currentSong: undefined,
                votes: 0
              }
            });
          }

          res.status(spotifyResponse.status).send({
            ...spotifyResponse.data,
            votes
          })
        } else {
          res.status(spotifyResponse.status).send({
            message: 'Current song request to Spotify API failed.'
          });
        }
      } else {
        res.status(500).send({
          message: 'Internal server error occurred while fetching current song.'
        });
      }
    } else {
      res.status(500).send({
        message: 'Internal server error while fetching current song.'
      });
    }
  });
});

// Adds a song to the queue on a venue's Spotify account.
router.post('/song', authenticate, async (req, res) => {
  const { trackUri, venueId } = req.body;

  await getVenueById(venueId, res, async (venue) => {
    if (venue.spotifyTokens.accessToken) {
      const spotifyResponse = await axios.post(`https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`, null, {
        headers: {
          "Authorization": `Bearer ${venue.spotifyTokens.accessToken}`
        }
      }).catch((error) => error.response);

      if (spotifyResponse) {
        if (spotifyResponse.status === 200 || spotifyResponse.status === 204) {
          res.status(200).send({
            message: 'Song queued successfully.'
          });
        } else {
          res.status(spotifyResponse.status).send({
            message: 'Queuing request to Spotify API failed.'
          });
        }
      } else {
        res.status(500).send({
          message: 'Internal server error occurred while queuing song.'
        });
      }
    } else {
      res.status(500).send({
        message: 'Internal server error occurred while queuing song.'
      });
    }
  });
});

// Gets details about a venue and returns them to the client.
router.get('/venue', authenticate, async (req, res) => {
  const { accessToken } = req.query;
  
  try {
    const spotifyResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    }).catch((error) => error.response);

    if (spotifyResponse.status === 200) {
      const { data } = spotifyResponse;
      Venue.findOne({ uri: data.uri }, (error, venue) => {
        if (error) {
          res.status(500).send({
            message: 'Internal server error.'
          });
        } else if (venue) {
          res.status(200).send(venue);
        } else {
          const newVenue = new Venue({
            attendees: 0,
            name: data.display_name,
            uri: data.uri,
            votes: 0
          });

          newVenue.save((error) => {
            if (error) {
              res.status(500).send({
                message: 'Error occurred while adding venue. Not added.'
              });
            } else {
              res.status(200).send(newVenue);
            }
          })
        }
      });
    } else {
      console.error('An error occurred fetching venue.', spotifyResponse.status);
      res.status(500).send({
        message: 'Internal server error.'
      });
    }
  } catch (error) {
    console.error('An error occurred fetching venue.', error);
    res.status(error.status).send(error);
  }
});

router.put('/volume', authenticate, async (req, res) => {
  const { venueId, volume } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  let volumePercent = volume;
  if (volumePercent > 100) volumePercent = 100;

  await getUserByAccessToken(accessToken, res, async (user) => {
    await Venue.findOne({ _id: venueId }, async (error, venue) => {
      if (!venue.owners.includes(user._id)) {
        res.status(401).send({
          message: 'User making the request is not authorised to adjust volume.'
        });
      } else {
        const spotifyResponse = await axios.put(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}`,  null, {
          headers: {
            'Authorization': `Bearer ${venue.spotifyTokens.accessToken}`
          }
        }).catch((error) => error.response);

        if (spotifyResponse) {
          if (spotifyResponse.status === 204) {
            res.status(204).send({
              message: 'Volume changed successfully.'
            });
          }
        } else {
          res.status(500).send({
            message: 'Volume change request to Spotify API failed.'
          })
        }
      }
    });
  });
});

// Casts a vote for the currently playing song in a venue.
router.post('/vote', async (req, res) => {
  const { venueId, vote } = req.body;
  const { accessToken } = req.query;

  let voteValue = 0;

  if (vote === VOTE_UP) {
    voteValue = 1;
  } else if (vote === VOTE_DOWN) {
    voteValue = -1;
  }
  
  Venue.findOneAndUpdate(
    { _id: venueId },
    {
      $inc: {
        votes: voteValue
      }
    },
    {
      new: true,
      useFindAndModify: false
    },
    async (error, updatedVenue) => {
      if (error) {
        console.error('Error occurred while updating vote value.', error);
        res.status(500).send({
          message: 'Internal server error.'
        });
      } else if (updatedVenue) {
        let skipped = false;

        // If the number of negative votes exceeds the threshold, skip the song and reset the votes value.
        if (updatedVenue.votes < (-updatedVenue.attendees.length / 2)) {
          await skipTrack(accessToken);
          await Venue.updateOne({ _id: venueId }, { votes: 0 });
          updatedVenue.votes = 0;
          skipped = true;
        }

        await getUsersByIds(updatedVenue.attendees, res, async (attendees) => {
          await getUsersByIds(updatedVenue.owners, res, async (owners) => {
            const venue = {
              ...updatedVenue.toObject(),
              _id: undefined,
              id: updatedVenue._id,
              attendees,
              currentSong: undefined,
              googleMapsLink: undefined,
              owners,
              spotifyConsent: undefined,
              spotifyTokens: undefined
            };

            res.status(200).send({
              venue,
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
    }
  );
});

module.exports = router;
