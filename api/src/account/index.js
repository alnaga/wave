import { Router } from 'express';
import bcrypt from 'bcrypt';

import { useMongoClient } from '../util';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const client = await useMongoClient().connect();

  const user = await client.db('wave').collection('users').findOne({ 'username': username });

  if (!user) {
    // User wasn't found
    res.status(400).send({
      message: 'Invalid login credentials.'
    });
  } else {
    // Compare the password with the stored hash in the database.
    const match = await bcrypt.compare(password, user.passwordHash);

    if (match) {
      // Do login stuff.
      // return session token
      res.status(200).send({
        message: 'Login successful.'
      });
    } else {
      res.status(400).send({
        message: 'Invalid login credentials.'
      });
    }

    client.close();
  }
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Generate a hash of the user's password. This is what will be stored in the database.
  const passwordHash = await bcrypt.hash(password, 10);

  // Open a connection with the database.
  const client = await useMongoClient().connect();

  // Check to see whether the entered username already exists.
  const userExists = await client.db('wave').collection('users').findOne({ 'username': username });

  // Check to see whether the username already exists and creates one if it doesn't.
  if (userExists) {
    res.status(400).send({
      message: 'That username is already taken. Please enter a different one.'
    });
  } else {
    const newUser = {
      username,
      passwordHash
    };

    await client.db('wave').collection('users').insertOne(newUser, (err, result) => {
      if (err) {
        res.status(500).send({
          'message': 'Something went wrong during registration. Please try again later.'
        });
      } else {
        res.status(200).send({
          'message': 'Registration successful'
        });
      }

      // Close the connection to the database.
      client.close();
    });
  }
});

module.exports = router;
