export const CLEAR = 'CLEAR';

export const CLEAR_HISTORY = 'CLEAR_HISTORY';
export const SET_HISTORY = 'SET_HISTORY';

export const MAX_RETRIES = 3;

export const ADD_ARTIST_INFO_ALBUMS = 'ADD_ARTIST_INFO_ALBUMS';
export const SET_ARTIST_INFO = 'SET_ARTIST_INFO';

export const ADD_SONG_SEARCH_RESULTS = 'ADD_SONG_SEARCH_RESULTS';
export const SET_SONG_SEARCH_RESULTS = 'SET_SONG_SEARCH_RESULTS';

export const SET_ACCOUNT_INFO = 'SET_ACCOUNT_INFO';
export const SET_ALBUM_INFO = 'SET_ALBUM_INFO';
export const SET_CURRENT_SONG = 'SET_CURRENT_SONG';
export const SET_CURRENT_VENUE = 'SET_CURRENT_VENUE';
export const SET_DEVICES = 'SET_DEVICES';
export const SET_RECOMMENDATIONS = 'SET_RECOMMENDATIONS';
export const SET_SPOTIFY_TOKENS = 'SET_SPOTIFY_TOKENS';
export const SET_VENUE_INFO = 'SET_VENUE_INFO';
export const SET_VENUE_SEARCH_RESULTS = 'SET_VENUE_SEARCH_RESULTS';
export const SET_WAVE_TOKENS = 'SET_WAVE_TOKENS';

export const TOKENS_EXPIRED = 'TOKENS_EXPIRED';

export const SET_VOTES = 'SET_VOTES';
export const VOTE_DOWN = 'VOTE_DOWN';
export const VOTE_UP = 'VOTE_UP';

export const WAVE_COLOUR_DARK = '#6e5399';
export const WAVE_COLOUR_MAIN = '#a37cd9';

const localhost = 'https://localhost:8081';

const lan = 'https://192.168.86.214:8081';

export const API_URL = LOCALHOST ? localhost : lan;