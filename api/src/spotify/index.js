import axios from 'axios';
import { Router } from 'express';

import { CLIENT_ID, CLIENT_SECRET } from '../constants';
import { Buffer } from 'buffer';

const router = Router();

// Used for several Spotify API calls. Makes use of the client ID and client secret from the application dashboard
// on Spotify for Developers.
const authorisation = new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

// The application is currently only concerned with the UK.
const resultMarket = 'GB';

// Sends the user to the Spotify app authorisation page to get their permission to link their account with Wave.
// Returns an authorisation code which can be exchanged with an access token later on in the app flow.
router.get('/authorise', (req, res) => {
  const spotifyScopes = 'user-follow-read user-follow-modify user-top-read app-remote-control streaming user-read-playback-state user-modify-playback-state user-read-currently-playing';
  const redirectUri = 'http://localhost:8080';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    `&client_id=${CLIENT_ID}` +
    (spotifyScopes ? `&scope=${encodeURIComponent(spotifyScopes)}` : '') +
    `&redirect_uri=${redirectUri}`
  );
});

router.get('/devices', async (req, res) => {
  const { accessToken } = req.query;

  const spotifyResponse = await axios.get('https://api.spotify.com/v1/me/player/devices', {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });

  res.status(spotifyResponse.status).send(spotifyResponse.data);
});

router.put('/devices', async (req, res) => {
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
      "Authorization": `Basic ${authorisation}`,
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
      "Authorization": `Basic ${authorisation}`,
      "Content-Type": 'application/x-www-form-urlencoded'
    },
    params: {
      "grant_type": "refresh_token",
      "refresh_token": refreshToken
    }
  });

  res.status(spotifyResponse.status).send(spotifyResponse.data);
});

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

router.get('/song', async (req, res) => {
  const { accessToken } = req.query;
  
  const spotifyResponse = await axios.get(`https://api.spotify.com/v1/me/player?market=${resultMarket}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  
  res.status(spotifyResponse.status).send(spotifyResponse.data);
});

router.post('/song', async (req, res) => {
  const { accessToken, uri } = req.query;

  const spotifyResponse = await axios.post(`https://api.spotify.com/v1/me/player/queue?uri=${uri}`, null, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });

  res.status(spotifyResponse.status).send();
});

module.exports = router;
