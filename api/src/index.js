import express from 'express';
import 'regenerator-runtime';
import bodyParser from 'body-parser';
import cors from 'cors';

import account from './account/index';
import spotify from './spotify/index';

const app = express();
const port = 8081;

const corsOptions = {
  origin: 'http://localhost:8080'
};

app.use(cors());
app.use(bodyParser.json());

app.use('/account', account);
app.use('/spotify', spotify);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
