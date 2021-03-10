import express from 'express';
import 'regenerator-runtime';
import cors from 'cors';

const app = express();
const port = 8081;

const corsOptions = {
  origin: 'http://localhost:8080'
};

app.use(cors());

app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Response Placeholder'
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
