import express from 'express';
import 'regenerator-runtime';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import OAuth2Server from 'oauth2-server';

import { MONGO_URI } from './constants';
import * as Models from './oauth2';
import account from './account/index';
import spotify from './spotify/index';
import { getToken } from './util';

const app = express();
const port = 8081;

const corsOptions = {
  origin: 'http://localhost:8080'
};

app.use(cors());
app.use(bodyParser.json());

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
  accessTokenLifetime: 10,
  refreshTokenLifetime: 60 * 60 * 24 * 14,
  allowBearerTokensInQueryString: true
});

app.use('/account', account);
app.use('/spotify', spotify);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// Models.populateDatabase();
// Models.printDatabase();

app.all('/oauth/token', getToken);

export default app;
