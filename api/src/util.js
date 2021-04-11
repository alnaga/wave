import app from './index';
import { Request, Response } from 'oauth2-server';

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