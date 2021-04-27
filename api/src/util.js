import app from './index';
import { Request, Response } from 'oauth2-server';
import { User } from './models/user';
import { Token } from './models/token';
import {Venue} from './models/venue';
import axios from 'axios';
import { AUTHORISATION } from './constants';

/**
 * Method used by OAuth 2 to get a token.
 * @param req {Object} - Request object.
 * @param res {Object} - Response object.
 */
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

/**
 * Utility function to fetch an array of users based on an array of user IDs, and pass them into a callback function.
 * @param userIds
 * @param res
 * @param callback
 * @returns {Promise<void>}
 */
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
/**
 * Utility function to fetch a user object from the database based on an access token that is owned by a user,
 * and pass it into a callback function.
 * @param accessToken {String} - The access token of the desired user.
 * @param res {Object} - Response object of the calling endpoint.
 * @param callback {Function} - The callback function into which the user object will be passed.
 */
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

/**
 * Updates a venue's Spotify access token by using its refresh token.
 * @param venueId {String} - The ID of the venue to update.
 * @param refreshToken {String} - The refresh token of the venue to update.
 * @param callback {Function} - The callback function into which the new token will be passed.
 */
export const refreshSpotifyToken = async (venueId, refreshToken, callback) => {
  console.log('Refreshing Spotify Access Token', new Date().toISOString());
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

  if (spotifyResponse) {
    if (spotifyResponse.status === 200) {
      const newAccessToken = spotifyResponse.data.access_token;
      const newTokenExpiresAt = Date.now() + (spotifyResponse.data.expires_in * 1000);

      await Venue.updateOne({ _id: venueId }, {
        $set: {
          spotifyTokens: {
            accessToken: newAccessToken,
            accessTokenExpiresAt: newTokenExpiresAt,
            refreshToken
          }
        }
      });

      callback(newAccessToken);
    }
  }
};

/**
 * Utility function to fetch a venue object from the database based on its ID, and pass it into a callback function.
 * It will also update a venue's Spotify tokens if they have expired.
 * @param venueId {String} - The ID of the desired venue.
 * @param res {Object} - Response object of the calling endpoint.
 * @param callback {Function} - The callback function into which the venue object will be passed.
 */
export const getVenueById = async (venueId, res, callback) => {
  await Venue.findOne({ _id: venueId }, async (error, venue) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error.'
      });
    } else if (!venue) {
      res.status(400).send({
        message: 'Invalid venue ID.'
      });
    } else {
      // If the access token has expired, it is refreshed and then the new access token is fetched and passed
      // to the callback function.
      if (venue.spotifyTokens.accessTokenExpiresAt < Date.now()) {
        await refreshSpotifyToken(venueId, venue.spotifyTokens.refreshToken, async (refreshedAccessToken) => {
          callback({
            ...venue.toObject(),
            spotifyTokens: {
              ...venue.toObject().spotifyTokens,
              accessToken: refreshedAccessToken
            }
          });
        });
      } else {
        callback(venue.toObject());
      }
    }
  })
};

/**
 * Method used by OAuth 2 to authenticate a request.
 * @param req {Object} - Request object.
 * @param res {Object} - Response object.
 * @param next {Function} - The method that will be called if the request is authenticated successfully.
 */
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