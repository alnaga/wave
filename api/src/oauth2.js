import { CLIENT_ID, CLIENT_SECRET } from './constants';

import { Client } from './models/client';
import { Token } from './models/token';
import { User } from './models/user';
import { Venue } from './models/venue';

/**
 * Debug function used to populate the database with the main application client entry.
 */
export const populateDatabase = async () => {
  const mainClient = new Client({
    id: CLIENT_ID,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    grants: [
      'password',
      'refresh_token'
    ],
    redirectUris: []
  });

  await mainClient.save((error) => {
    if (error) console.error('Error while populating database.', error);
  });
};

/**
 * Debug function used to print all of the entries currently in each
 * collection in the database.
 */
export const printDatabase = () => {
  Client.find(function(err, clients) {
    if (err) {
      return console.error(err);
    } else {
      console.log('Clients:', clients);
    }
  });

  Token.find(function(err, tokens) {
    if (err) {
      return console.error(err);
    } else {
      console.log('Tokens:', tokens);
    }
  });

  User.find(function(err, users) {
    if (err) {
      return console.error(err);
    } else {
      console.log('Users:', users);
    }
  });

  Venue.find(function(err, venues) {
    if (err) {
      return console.error(err);
    } else {
      console.log('Venues:', venues);
    }
  });
};

/**
 * Used to get an authentication token
 * @param accessToken {String}
 * @param callback {Function} - Callback function passed by the OAuth2 server instance.
 */
export const getAccessToken = async (accessToken, callback) => {
  Token.findOne({ accessToken }, (error, token) => {
    if (!token) console.error('Access: Token not found.', accessToken);
    if (error) console.error(error);

    callback(error, token);
  });
};

/**
 * Used to get a client entry from a client ID and client secret.
 * @param clientId {String} - Client ID
 * @param clientSecret {String} - Client Secret
 * @param callback {Function} - Callback function passed by the OAuth2 server instance.
 */
export const getClient = (clientId, clientSecret, callback) => {
  Client.findOne({ clientId, clientSecret }, (error, client) => {
    if (!client) console.error('Client not found.');
    if (error) console.error(error);

    callback(error, client);
  });
};

/**
 * Adds a new Token object to the tokens collection.
 * @param token {Object} - Token object to add to the database.
 * @param client {Object} - Client object containing information to append to the new token object.
 * @param user {Object} - User object containing information to append to the new token object.
 * @param callback {Function} - Callback function passed by the OAuth2 server instance.
 */
export const saveToken = async (token, client, user, callback) => {
  const newToken = new Token({
    ...token,
    client: {
      ...token.client,
      id: client.clientId
    },
    user: {
      ...token.user,
      username: user.username
    }
  });

  await newToken.save((error, token) => {
    if (!token) console.error('Something went wrong while saving the token. Not saved.');
    else {
      token = token.toObject();
      delete token._id;
      delete token.__v;
    }

    callback(error, token);
  })
};

/**
 * Used for authentication using the 'refresh_token' grant type.
 * @param refreshToken {String} - Refresh token for the queried token.
 * @param callback {Function} - Callback function passed by the OAuth2 server instance.
 */
export const getRefreshToken = (refreshToken, callback) => {
  Token.findOne({ refreshToken }, (error, token) => {
    if (!token) console.error('Refresh: Token not found.');
    if (error) console.error(error);

    callback(error, token);
  });
};

/**
 * Used for authentication using the 'password' grant type.
 * @param username {String} - Username for the queried user.
 * @param password {String} - Password for the queried user.
 * @param callback {Function} - Callback function passed by the OAuth2 server instance.
 */
export const getUser = (username, password, callback) => {
  User.findOne({ username, password }, (error, user) => {
    if (!user) console.error(`User '${username} not found.`);
    if (error) console.error(error);

    callback(error, user);
  });
};

/**
 * Used for authentication using the 'client_credentials' grant type.
 * @param client {Object} - Object representing the queried client.
 * @param callback {Function} - Callback function passed by the OAuth2 server instance.
 */
export const getUserFromClient = (client, callback) => {
  Client.findOne({
    clientId: client.clientId,
    clientSecret: client.clientSecret,
    grants: 'client_credentials'
  }, (error, client) => {
    if (!client) console.error('Client not found.');
    if (error) console.error(error);

    callback(error, { username: '' });
  });
};

/**
 * Used to revoke an authentication token by removing it from the tokens collection.
 * @param refreshToken {String} - Refresh token of the token to revoke.
 * @param callback {Function} - Callback function passed by the OAuth2 server instance.
 */
export const revokeToken = (token, callback) => {
  const { refreshToken } = token;

  Token.deleteOne({ refreshToken }, (error, result) => {
    const success = result && result.deletedCount === 1;

    if (error) console.error(error);
    if (!success) console.error('Something went wrong when deleting the token. Not deleted.');

    callback(error, success);
  });
};
