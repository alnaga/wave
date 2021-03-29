import express from 'express';
import 'regenerator-runtime';
import cors from 'cors';
import axios from 'axios';
import bodyParser from 'body-parser';
import { Buffer } from 'buffer';

import { CLIENT_ID, CLIENT_SECRET } from './constants';

const app = express();
const port = 8081;

const corsOptions = {
  origin: 'http://localhost:8080'
};

app.use(cors());
app.use(bodyParser.json());

// Used for several Spotify API calls. Makes use of the client ID and client secret from the application dashboard
// on Spotify for Developers.
const authorisation = new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Response Placeholder'
  });
});

// Sends the user to the Spotify app authorisation page to get their permission to link their account with Wave.
// Returns an authorisation code which can be exchanged with an access token later on in the app flow.
app.get('/spotify/authorise', (req, res) => {
  const spotifyScopes = 'user-follow-read user-follow-modify user-top-read';
  const redirectUri = 'http://localhost:8080';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    `&client_id=${CLIENT_ID}` +
    (spotifyScopes ? `&scope=${encodeURIComponent(spotifyScopes)}` : '') +
    `&redirect_uri=${redirectUri}`
  );
});


// Exchanges the authorisation code acquired previously for an access and refresh token.
app.post('/spotify/tokens', async (req, res) => {
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
app.post('/spotify/refresh', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
