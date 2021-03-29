import express from 'express';
import 'regenerator-runtime';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

import spotify from './spotify/index';

const app = express();
const port = 8081;

const corsOptions = {
  origin: 'http://localhost:8080'
};

app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient('mongodb://localhost:8082', {
  useUnifiedTopology: true
});
// (async () => {
//   await client.connect();
//
//   // const database = await client.db('wave').collection('users').findOne({ user: 'Alexander Naggar'});
//   // console.log(database);
// })();

app.use('/spotify', spotify);

app.post('/register', (req, res) => {
  console.log('Registration request received!');
});

app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Response Placeholder'
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
