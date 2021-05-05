import { Buffer } from 'buffer';

export const ACCESS_TOKEN_LIFETIME = 60 * 60;
export const REFRESH_TOKEN_LIFETIME = 60 * 60 * 24 * 14;

export const CLIENT_ID = 'a7203aa64b924db48cc484745961043b';
export const CLIENT_SECRET = 'ddb1a4848fa546c3a12d13b91ba946ff';

export const MONGO_URI = 'mongodb://localhost:8082/wave';

export const VOTE_DOWN = 'VOTE_DOWN';
export const VOTE_UP = 'VOTE_UP';

// Used for several Spotify API calls, as well as some internal authorisation requests. Makes use of the client ID
// and client secret from the application dashboard on Spotify for Developers.
export const AUTHORISATION = new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

const localhost = 'https://localhost';

const lan = 'https://192.168.86.214';

export const APP_HOMEPAGE_URL = `${process.env.HOST_TYPE === 'localhost' ? localhost : lan}:8080`;
export const API_URL = `${process.env.HOST_TYPE === 'localhost' ? localhost : lan}:8081`;