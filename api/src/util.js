import app from './index';
import { Request, Response } from 'oauth2-server';
import { User } from './models/user';
import { Token } from './models/token';

export const getToken = async (req, res) => {
  const request = new Request(req);
  const response = new Response(res);

  // Gets around weird behaviour where oauth2-server ignores the query parameters.
  request.body = request.query;

  try {
    const token = await app.oauth2.token(request, response);
    res.status(200).send(token);
  } catch (error) {
    res.status(error.status).send(error);
  }
};

export const getUsersByIds = async (userIds, res, callback) => {
  const users = await userIds.map(async (userId) => {
    return User.findOne({ _id: userId }, (error) => {
      if (error) {
        res.status(500).send({
          message: 'Internal server error.'
        });
      }
    }).select({
      _id: 0,
      firstName: 1,
      lastName: 1,
      username: 1
    });
  });

  callback(await Promise.all(users));
}

export const getUserByAccessToken = async (accessToken, res, callback) => {
  await Token.findOne({ accessToken }, async (error, token) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error.'
      });
    } else if (!token) {
      res.status(400).send({
        message: 'Invalid access token.'
      });
    } else {
      await User.findOne({ username: token.user.username }, (error, user) => {
        if (error) {
          res.status(500).send({
            message: 'Internal server error'
          });
        } else if (!user) {
          res.status(400).send({
            message: 'Invalid user.'
          });
        } else {
          callback(user);
        }
      })
    }
  });
};

export const authenticate = async (req, res, next) => {
  const request = new Request(req);
  const response = new Response(res);

  try {
    const result = await app.oauth2.authenticate(request, response);
    next();
  } catch(error) {
    res.status(error.status).send(error);
  }
}