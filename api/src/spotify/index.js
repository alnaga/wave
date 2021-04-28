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

const getArtistInfo = async (res, artistId, accessToken) => {
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

      return {
        albums: {
          ...artistAlbumsResponse.data,
          items
        },
        ...artistResponse.data
      }

      // res.status(artistResponse.status).send({
      //   albums: {
      //     ...artistAlbumsResponse.data,
      //     items
      //   },
      //   ...artistResponse.data
      // });
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
};

const getNextPage = async (res, nextPageUrl, spotifyAccessToken) => {
  const spotifyResponse = await axios.get(nextPageUrl, {
    headers: {
      'Authorization': `Bearer ${spotifyAccessToken}`
    }
  }).catch((error) => error.response);

  if (spotifyResponse) {
    if (spotifyResponse.status === 200 || spotifyResponse.status === 204) {
      return spotifyResponse.data
    } else if (spotifyResponse.status === 401) {
      res.status(401).send({
        message: 'Spotify API access token expired.'
      });
    }
  } else {
    res.status(500).send({
      message: 'Internal server error occurred while fetching next page.'
    });
  }
};

const getVenueSpotifyToken = async (venue, callback) => {
  if (venue.spotifyTokens.accessTokenExpiresAt < Date.now()) {
    await refreshSpotifyToken(venue._id, venue.spotifyTokens.refreshToken, async (refreshedAccessToken) => {
      return callback(refreshedAccessToken);
    });
  } else {
    return callback(venue.spotifyTokens.accessToken);
  }
}

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
});

// Fetches the available playback devices from Spotify.
router.get('/devices', authenticate, async (req, res) => {
  const { venueId } = req.query;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, res, async (user) => {
    await Venue.findOne({ _id: venueId }, async (error, venue) => {
      if (error) {
        res.status(500).send({
          message: 'Internal server error occurred while getting available devices.'
        });
      } else if (!venue) {
        res.status(400).send({
          message: 'Invalid venue ID.'
        });
      } else if (!venue.owners.includes(user._id)) {
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
        })
      }
    });
  })


});

// Selects a device for playback through Spotify.
router.put('/devices', authenticate, async (req, res) => {
  const { device, venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, res, async (user) => {
    await Venue.findOne({ _id: venueId }, async (error, venue) => {
      if (error) {
        res.status(500).send({
          message: 'Internal server error occurred while selecting output device.'
        });
      } else if (!venue) {
        res.status(400).send({
          message: 'Invalid venue ID.'
        });
      } else if (!venue.owners.includes(user._id)) {
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
        })
      }
    });
  });
});

// Pause the current track for a venue on Spotify.
router.put('/pause', authenticate, async (req, res) => {
  const { venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, req, async (user) => {
    await Venue.findOne({ _id: venueId }, async (error, venue) => {
      if (error) {
        res.status(500).send({
          message: 'Internal server error occurred while pausing track.'
        });
      } else if (!venue) {
        res.status(400).send({
          message: 'Invalid venue ID.'
        });
      } else if (!venue.owners.includes(user._id)) {
        res.status(401).send({
          message: 'User making request is not authorised to pause playback.'
        });
      } else {
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
      }
    });
  })
});

router.put('/play', authenticate, async (req, res) => {
  const { venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, req, async (user) => {
    await Venue.findOne({ _id: venueId }, async (error, venue) => {
      if (error) {
        res.status(500).send({
          message: 'Internal server error occurred while resuming track.'
        });
      } else if (!venue) {
        res.status(400).send({
          message: 'Invalid venue ID.'
        });
      } else if (!venue.owners.includes(user._id)) {
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
              message: 'Track resumed successfully.'
            });
          } else {
            res.status(500).send({
              message: 'Resume track request to Spotify API failed.'
            });
          }
        } else {
          res.status(500).send({
            message: 'Resume track to Spotify API failed.'
          })
        }
      }
    });
  })
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

      // Create a list of genres artists are related to and keep track of the occurrences of each.
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
            const onRepeatPlaylistResponse = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent('On Repeat')}&type=playlist`, {
              headers: {
                "Authorization": `Bearer ${venueSpotifyAccessToken}`
              }
            }).catch((error) => error.response);

            if (onRepeatPlaylistResponse) {
              const playlists = onRepeatPlaylistResponse.data.playlists.items;

              const onRepeatPlaylist = playlists.find((playlist) => playlist.name === 'On Repeat' && playlist.owner.display_name === 'Spotify');

              if (onRepeatPlaylist) {
                const onRepeatTracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${onRepeatPlaylist.id}/tracks`, {
                  headers: {
                    'Authorization': `Bearer ${venueSpotifyAccessToken}`
                  }
                }).catch((error) => error.response);

                if (onRepeatTracksResponse) {
                  const onRepeatItems = onRepeatTracksResponse.data.items;

                  const calculateMatchPoints = await onRepeatItems.map(async (item) => {
                    const trackArtist = item.track.artists[0];
                    const trackArtistInfo = await getArtistInfo(res, trackArtist.id, venueSpotifyAccessToken);

                    const artistIsTopListened = topArtistResults.find((userTopArtist) => userTopArtist.id === trackArtistInfo.id);

                    if (artistIsTopListened) {
                      return 10;
                    } else {
                      if (trackArtistInfo.genres) {
                        for (let artistGenre of trackArtistInfo.genres) {
                          if (preferredGenres.find((match) => match.name === artistGenre)) {
                            return 1;
                          }
                        }
                      }
                    }
                  });

                  const matches = await Promise.all(calculateMatchPoints);

                  let score = 0;

                  matches.forEach((matchScore) => {
                    if (matchScore) {
                      score += matchScore;
                    }
                  });

                  return {
                    venue,
                    score
                  };
                }
              }
            }
          })
        });

        const finalScores = await Promise.all(gettingVenuesMusicTaste);

        res.status(200).send({
          recommendations: finalScores
        });
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

// Skips the currently playing track in a venue.
router.post('/skip', authenticate, async (req, res) => {
  const { venueId } = req.body;
  const accessToken = req.headers.authorization.split('Bearer ')[1];

  await getUserByAccessToken(accessToken, res, async (user) => {
    await Venue.findOne({ _id: venueId }, async (error, venue) => {
      if (error) {
        res.status(500).send({
          message: 'Internal server error occurred while skipping track.'
        });
      } else if (!venue) {
        res.status(400).send({
          message: 'Invalid venue ID.'
        });
      } else if (!venue.owners.includes(user._id)) {
        res.status(401).send({
          message: 'User making request is not authorised to skip track.'
        });
      } else {
        const spotifyResponse = await axios.post('https://api.spotify.com/v1/me/player/next', null, {
          headers: {
            'Authorization': `Bearer ${venue.spotifyTokens.accessToken}`
          }
        }).catch((error) => error.response);

        if (spotifyResponse) {
          if (spotifyResponse.status === 204) {
            res.status(200).send({
              message: 'Track skipped successfully.'
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
      }
    })
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
  const { trackUri, venueId } = req.body;

  await getVenueById(venueId, res, async (venue) => {
    if (venue.spotifyTokens && venue.spotifyTokens.accessToken) {
      const deviceId = venue.outputDeviceId;

      const spotifyResponse = await axios.post(`https://api.spotify.com/v1/me/player/queue?uri=${trackUri}&device_id=${deviceId}`, null, {
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
