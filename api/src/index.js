import express from 'express';
import 'regenerator-runtime';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import mongoose from 'mongoose';
import OAuth2Server from 'oauth2-server';

import {
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
  MONGO_URI
} from './constants';
import * as Models from './oauth2';
import account from './account/index';
import venue from './venue/index';
import spotify from './spotify/index';
import { getToken } from './util';

// Necessary to allow the use of the self-signed certificate.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const app = express();
const port = 8081;

const privateKey = fs.readFileSync(__dirname + '/cert-key.pem', 'utf-8');
const certificate = fs.readFileSync(__dirname + '/cert.pem', 'utf-8');

const credentials = {
  key: privateKey,
  cert: certificate,
};

// const corsOptions = {
//   origin: 'http://localhost:8080'
// };

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
})

// Initiate the connection to the database.
mongoose.connect(MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (error) => {
  if (error) {
    return console.error(`Error connecting to database.`, error);
  } else {
    console.log('Successfully connected to database!');
  }
});

// Start the authorisation server.
app.oauth2 = new OAuth2Server({
  model: Models,
  accessTokenLifetime: ACCESS_TOKEN_LIFETIME,
  refreshTokenLifetime: REFRESH_TOKEN_LIFETIME,
  allowBearerTokensInQueryString: true
});

app.use('/account', account);
app.use('/venue', venue);
app.use('/spotify', spotify);

// Models.populateDatabase();
// Models.printDatabase();

app.all('/oauth/token', getToken);

const secureApp = https.createServer(credentials, app);

secureApp.listen(port, () => {
  console.log(`HTTPS Listening on port ${port}...`);
});

export default app;
