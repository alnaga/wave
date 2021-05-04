import axios from 'axios';
import { Router } from 'express';

import {
  authenticate,
  getUserByAccessToken,
  getUsersByIds,
  getVenueById,
  refreshSpotifyToken
} from '../util';
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

const wait = (delay) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const getArtistInfo = async (res, artistId, accessToken) => {
  const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      return response.data;
    } else if (
      response.status === 429
      || (response.data && response.data.error && response.data.error.status === 429)
    ) {
      const waitTime = Number.parseInt(response.headers['retry-after']);

      await wait(waitTime * 1000);
      return await getArtistInfo(res, artistId, accessToken);
    }
  } else {
    res.status(500).send({
      message: 'Internal server error occurred while fetching artist information.'
    });
  }
};

const getNextPage = async (res, nextPageUrl, spotifyAccessToken) => {
  const response = await axios.get(nextPageUrl, {
    headers: {
      'Authorization': `Bearer ${spotifyAccessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200 || response.status === 204) {
      return response.data
    } else if (response.status === 401) {
      res.status(401).send({
        message: 'Spotify API access token expired.'
      });
    } else if (response.status === 429) {
      const waitTime = response.headers['retry-after'];
      await wait(waitTime * 1000);
      return getNextPage(res, nextPageUrl, spotifyAccessToken);
    }
  } else {
    res.status(500).send({
      message: 'Internal server error occurred while fetching next page.'
    });
  }
};

const getOnRepeatPlaylist = async (res, accessToken) => {
  const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent('On Repeat')}&type=playlist`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 429) {
      const waitTime = response.headers['retry-after'];
      await wait(waitTime * 1000);
      return await getOnRepeatPlaylist(res, accessToken);
    } else {
      res.status(500).send({
        message: 'Internal server error occurred while getting venue recommendations.'
      });
    }
  } else {
    res.status(500).send({
      message: 'Internal server error occurred while getting venue recommendations.'
    });
  }
}

const getPlaylistTracks = async (res, playlistId, accessToken) => {
  const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch((error) => error.response);

  if (response) {
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 429) {
      const waitTime = response.headers['retry-after'];
      await wait(waitTime * 1000);
      return await getPlaylistTracks(res, playlistId, accessToken);
    } else {
      res.status(500).send({
        message: 'Internal server error occurred while getting venue recommendations.'
      });
    }
  } else {
    res.status(500).send({
      message: 'Internal server error occurred while getting venue recommendations.'
    });
  }
}

const getVenueSpotifyToken = async (venue, callback) => {
  if (venue.spotifyTokens.accessTokenExpiresAt < Date.now()) {
    await refreshSpotifyToken(venue._id, venue.spotifyTokens.refreshToken, async (refreshedAccessToken) => {
      return callback(refreshedAccessToken);
    });
  } else {
    return callback(venue.spotifyTokens.accessToken);
  }
}

const userIsCheckedIn = (venue, user) => {
  const attendees = venue.attendees.map((attendee) => attendee.toString());

  return attendees.includes(user._id.toString());
};

const userIsOwner = (venue, user) => {
  const owners = venue.owners.map((owner) => owner.toString());
  
  return owners.includes(user._id.toString());
};

const skipTrack = async (accessToken) => {
  const spotifyResponse = await axios.post('https://api.spotify.com/v1/me/player/next', null, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
};

// Specify the allowed methods for this subroute.
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET').send();
});

// Sends the user to the Spotify app authorisation page to get their permission to link their account with Wave.
// Returns an authorisation code which can be exchanged with an access token later on in the app flow.
router.get('/authorise', (req, res) => {
  // TODO: remove the following unused scopes
  // user-follow-read
  // user-follow-modify
  // user-read-email
  // streaming
  // app-remote-control
  // user-read-currently-playing
  const spotifyScopes = `
    user-top-read 
    user-read-playback-state 
    user-modify-playback-state 
    user-follow-read 
    user-follow-modify
    user-read-email
    streaming 
    app-remote-control 
    user-read-currently-playing 
  `;
  // const redirectUri = 'http://localhost:8080';
  const redirectUri = 'https://192.168.86.214:8080';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    `&client_id=${CLIENT_ID}` +
    (spotifyScopes ? `&scope=${encodeURIComponent(spotifyScopes)}` : '') +
    `&redirect_uri=${redirectUri}`
  );
});

// Fetches album information from Spotify's API and forwards the result of the request to the user.
router.get('/album', authenticate, async (req, res) => {
  const { albumId, venueId } = req.query;

  await getVenueById(venueId, res, async (venue) => {
    if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
      const spotifyResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
        headers: {
          'Authorization': `Bearer ${venue.spotifyTokens.accessToken}`
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
    } else {
      res.status(400).send({
        message: 'Venue has not linked their Spotify account.'
      });
    }
  });
});

// Fetches information about an artist from Spotify's API and forwards the result of the request to the user.
router.get('/artist', authenticate, async (req, res) => {
  const { artistId, venueId } = req.query;

  await getVenueById(venueId, res, async (venue) => {
    if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
      const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          'Authorization': `Bearer ${venue.spotifyTokens.accessToken}`
        }
      }).catch((error) => error.response);

      if (artistResponse) {
        let artistAlbumsResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums?market=${resultMarket}`, {
          headers: {
            'Authorization': `Bearer ${venue.spotifyTokens.accessToken}`
          }
        }).catch((error) => error.response);

        if (artistAlbumsResponse) {
          let { items } = artistAlbumsResponse.data;

          // TODO: Add a next button on the album list to save on performance
          // If there are multiple pages of albums, keep fetching and adding them to the items list until there are no more.
          // while (artistAlbumsResponse.data.next !== null) {
          //   artistAlbumsResponse = await axios.get(artistAlbumsResponse.data.next, {
          //     headers: {
          //       'Authorization': `Bearer ${accessToken}`
          //     }
          //   }).catch((error) => error.response);
          //
          //   if (artistAlbumsResponse) {
          //     items.push(...artistAlbumsResponse.data.items);
          //   }
          // }

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
    } else {
      res.status(400).send({
        message: 'Venue has not linked their Spotify account.'
      });
    }
  });
});

// Fetches the available playback devices from Spotify.
router.get('/devices', authenticate, async (req, res) => {
  const { venueId } = req.query;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, res, async (user) => {
    await getVenueById(venueId, res, async (venue) => {
      if (venue) {
        if (!userIsOwner(venue, user)) {
          res.status(401).send({
            message: 'User making request is not authorised to see playback devices.'
          });
        } else if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
          const spotifyResponse = await axios.get('https://api.spotify.com/v1/me/player/devices', {
            headers: {
              "Authorization": `Bearer ${venue.spotifyTokens.accessToken}`
            }
          }).catch((error) => error.response);

          res.status(spotifyResponse.status).send(spotifyResponse.data);
        } else {
          res.status(400).send({
            message: 'Venue has not linked their Spotify account.'
          });
        }
      }
    });
  });
});

// Selects a device for playback through Spotify.
router.put('/devices', authenticate, async (req, res) => {
  const { device, venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, res, async (user) => {
    await getVenueById(venueId, res, async (venue) => {
      if (venue) {
        if (!userIsOwner(venue, user)) {
          res.status(401).send({
            message: 'User making request is not authorised to change playback device.'
          });
        } else if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
          const spotifyResponse = await axios.put('https://api.spotify.com/v1/me/player', {
            device_ids: [ device.id ]
          }, {
            headers: {
              "Authorization": `Bearer ${venue.spotifyTokens.accessToken}`
            }
          });

          if (spotifyResponse) {
            if (spotifyResponse.status === 204) {
              await Venue.updateOne({ _id: venueId }, {
                $set: {
                  outputDeviceId: device.id
                }
              }, (error, result) => {
                if (error) {
                  res.status(500).send({
                    message: 'Internal server error occurred while selecting output device.'
                  });
                } else {
                  res.status(spotifyResponse.status).send();
                }
              })
            }
          }
        } else {
          res.status(400).send({
            message: 'Venue has not linked their Spotify account.'
          });
        }
      }
    });
  });
});

// Pause the current song for a venue on Spotify.
router.put('/pause', authenticate, async (req, res) => {
  const { venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, req, async (user) => {
    await getVenueById(venueId, res, async (venue) => {
      if (venue) {
        if (!userIsOwner(venue, user)) {
          res.status(401).send({
            message: 'User making request is not authorised to pause playback.'
          });
        } else if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
          const spotifyResponse = await axios.put('https://api.spotify.com/v1/me/player/pause', null, {
            headers: {
              'Authorization': `Bearer ${venue.spotifyTokens.accessToken}`
            }
          }).catch((error) => error.response);

          if (spotifyResponse) {
            if (spotifyResponse.status === 204) {
              res.status(200).send({
                message: 'Track paused successfully.'
              });
            } else {
              res.status(500).send({
                message: 'Pause request to Spotify API failed.'
              });
            }
          } else {
            res.status(500).send({
              message: 'Pause request to Spotify API failed.'
            })
          }
        } else {
          res.status(400).send({
            message: 'Venue has not linked their Spotify account.'
          });
        }
      }
    });
  })
});

// Resumes the current song for a venue on Spotify.
router.put('/play', authenticate, async (req, res) => {
  const { venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, req, async (user) => {
    await getVenueById(venueId, res, async (venue) => {
      if (venue) {
        if (!userIsOwner(venue, user)) {
          res.status(401).send({
            message: 'User making request is not authorised to resume playback.'
          });
        } else {
          const spotifyResponse = await axios.put('https://api.spotify.com/v1/me/player/play', null, {
            headers: {
              'Authorization': `Bearer ${venue.spotifyTokens.accessToken}`
            }
          }).catch((error) => error.response);

          if (spotifyResponse) {
            if (spotifyResponse.status === 204) {
              res.status(200).send({
                message: 'Song resumed successfully.'
              });
            } else {
              res.status(500).send({
                message: 'Resume song request to Spotify API failed.'
              });
            }
          } else {
            res.status(500).send({
              message: 'Resume song to Spotify API failed.'
            })
          }
        }
      }
    });
  })
});

// Calculates and returns the list of recommended venues to the user.
router.get('/recommendations', authenticate, async (req, res) => {
  const { spotifyAccessToken } = req.query;

  // Fetch the user's top artists from Spotify
  let spotifyResponse = await axios.get(`https://api.spotify.com/v1/me/top/artists`, {
    headers: {
      'Authorization': `Bearer ${spotifyAccessToken}`
    }
  }).catch((error) => error.response);
  
  if (spotifyResponse) {
    if (spotifyResponse.status === 200) {
      let topArtistResults = spotifyResponse.data.items;

      // Fetch data from all pages until all results have been gathered.
      if (spotifyResponse.data.next) {
        let nextPageResults = spotifyResponse.data;
        do {
          nextPageResults = await getNextPage(res, nextPageResults.next, spotifyAccessToken);
          topArtistResults = topArtistResults.concat(nextPageResults.items);
        } while (nextPageResults.next);
      }

      // Create a list of genres artists are related to and keep song of the occurrences of each.
      let preferredGenres = []
      for (let artist of topArtistResults) {
        for (let genre of artist.genres) {
          const genreIndex = preferredGenres.findIndex((target) => target.name === genre);

          if (genreIndex === -1) {
            preferredGenres.push({
              name: genre,
              occurrences: 1
            });
          } else {
            preferredGenres[genreIndex].occurrences = preferredGenres[genreIndex].occurrences + 1;
          }
        }
      }

      // Sort the user's preferred genres in descending order.
      preferredGenres = preferredGenres.sort((genre, otherGenre) => otherGenre.occurrences - genre.occurrences);

      await Venue.find({}, async (error, venues) => {
        const gettingVenuesMusicTaste = await venues.map(async (venue) => {
          return getVenueSpotifyToken(venue, async (venueSpotifyAccessToken) => {
            const onRepeatPlaylistData = await getOnRepeatPlaylist(res, venueSpotifyAccessToken);

            if (onRepeatPlaylistData) {
              const playlists = onRepeatPlaylistData.playlists.items;

              const onRepeatPlaylist = playlists.find((playlist) => playlist.name === 'On Repeat' && playlist.owner.display_name === 'Spotify');

              if (onRepeatPlaylist) {
                const onRepeatTracksData = await getPlaylistTracks(res, onRepeatPlaylist.id, venueSpotifyAccessToken);

                if (onRepeatTracksData) {
                  const onRepeatItems = onRepeatTracksData.items;

                  const getOnRepeatArtists = await onRepeatItems.map(async (item) => {
                    const trackArtist = item.track.artists[0];
                    if (trackArtist) {
                      return await Promise.all([
                        await getArtistInfo(res, trackArtist.id, venueSpotifyAccessToken),
                        await (async (resolve) => setTimeout(resolve, 1000))
                      ]);
                    }
                  });

                  const onRepeatArtists = await Promise.all(getOnRepeatArtists);

                  let score = 0;
                  onRepeatArtists.forEach((artistArray) => {
                    const artist = artistArray[0];
                    const artistIsTopListened = topArtistResults.find((userTopArtist) => userTopArtist.id === artist.id);

                    if (artistIsTopListened) {
                      score += 10;
                    } else if (artist.genres) {
                      for (let artistGenre of artist.genres) {
                        if (preferredGenres.find((match) => match.name === artistGenre)) {
                          score += 1;
                        }
                      }
                    }
                  });

                  return {
                    venue,
                    score
                  };
                } else {
                  res.status(500).send({
                    message: 'Internal server error occurred while getting venue recommendations.'
                  })
                }
              }
            } else {
              res.status(500).send({
                message: 'Internal server error occurred while getting venue recommendations.'
              })
            }
          })
        });

        const finalScores = await Promise.all(gettingVenuesMusicTaste);

        if (finalScores) {
          res.status(200).send({
            recommendations: finalScores
          });
        }
      });
    } else if (spotifyResponse.status === 401) {
      res.status(401).send({
        message: 'Spotify API access token expired.'
      });
    }
  } else {
    res.status(500).send({
      message: 'Internal server error occurred while getting venue recommendations.'
    });
  }
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
  const { query, venueId } = req.query;

  await getVenueById(venueId, res, async (venue) => {
    if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
      const spotifyResponse = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=${resultMarket}`, {
        headers: {
          "Authorization": `Bearer ${venue.spotifyTokens.accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      res.status(spotifyResponse.status).send({
        query,
        ...spotifyResponse.data
      });
    } else {
      res.status(400).send({
        message: 'Venue has not linked their Spotify account.'
      });
    }
  });
});

// Skips the currently playing song in a venue.
router.post('/skip', authenticate, async (req, res) => {
  const { venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, res, async (user) => {
    await getVenueById(venueId, res, async (venue) => {
      if (venue) {
        if (!userIsOwner(venue, user)) {
          res.status(400).send({
            message: 'User making request is not authorised to skip song.'
          });
        } else if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
          const spotifyResponse = await axios.post('https://api.spotify.com/v1/me/player/next', null, {
            headers: {
              'Authorization': `Bearer ${venue.spotifyTokens.accessToken}`
            }
          }).catch((error) => error.response);

          if (spotifyResponse) {
            if (spotifyResponse.status === 204) {
              res.status(200).send({
                message: 'Song skipped successfully.'
              });
            } else {
              res.status(500).send({
                message: 'Skip song request to Spotify API failed.'
              });
            }
          } else {
            res.status(500).send({
              message: 'Skip song request to Spotify API failed.'
            });
          }
        } else {
          res.status(400).send({
            message: 'Venue has not linked their Spotify account.'
          });
        }
      }
    });
  });
});

// Gets the currently playing song for the venue's Spotify account.
router.get('/song', authenticate, async (req, res) => {
  const { venueId } = req.query;

  await getVenueById(venueId, res, async (venue) => {
    if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
      const spotifyResponse = await axios.get(`https://api.spotify.com/v1/me/player`, {
        headers: {
          "Authorization": `Bearer ${venue.spotifyTokens.accessToken}`
        }
      }).catch((error) => error.response);

      if (spotifyResponse) {
        if (spotifyResponse.status === 200 || spotifyResponse.status === 204) {
          // If the output device on Spotify is different from the currently stored output device in the database, update it.
          if (spotifyResponse.data.device && spotifyResponse.data.device.id !== venue.outputDeviceId) {
            await Venue.updateOne({ _id: venueId }, {
              $set: {
                outputDeviceId: spotifyResponse.data.device.id
              }
            });
          }

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
      res.status(400).send({
        message: 'Venue has not linked their Spotify account.'
      });
    }
  });
});

// Adds a song to the queue on a venue's Spotify account.
router.post('/song', authenticate, async (req, res) => {
  const { songUri, venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, res, async (user) => {
    await getVenueById(venueId, res, async (venue) => {
      if (venue) {
        if (!userIsCheckedIn(venue, user)) {
          res.status(400).send({
            message: 'User making the request is not checked into the target venue.'
          });
        } else if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
          const deviceId = venue.outputDeviceId;

          const spotifyResponse = await axios.post(`https://api.spotify.com/v1/me/player/queue?uri=${songUri}&device_id=${deviceId}`, null, {
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
          res.status(400).send({
            message: 'Venue has not linked their Spotify account.'
          });
        }
      }
    });
  });
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
      "redirect_uri": "https://192.168.86.214:8080"
    }
  }).catch((error) => error.response);

  res.status(spotifyResponse.status).send(spotifyResponse.data);
});

// Updates the output volume in a venue.
router.put('/volume', authenticate, async (req, res) => {
  const { venueId, volume } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  let volumePercent = volume;
  if (volumePercent > 100) volumePercent = 100;

  await getUserByAccessToken(accessToken, res, async (user) => {
    await getVenueById(venueId, res, async (venue) => {
      if (venue) {
        if (!userIsOwner(venue, user)) {
          res.status(401).send({
            message: 'User making the request is not authorised to adjust volume.'
          });
        } else if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
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
        } else {
          res.status(400).send({
            message: 'Venue has not linked their Spotify account.'
          });
        }
      }
    });
  });
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
        } else {
          Venue.updateOne({ _id: venueId }, {
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
