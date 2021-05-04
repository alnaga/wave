import React, {createContext, useContext, useReducer} from 'react';
import Cookies from 'js-cookie';

import {
  CLEAR,
  CLEAR_HISTORY,
  SET_ACCOUNT_INFO,
  SET_ALBUM_INFO,
  ADD_ARTIST_INFO_ALBUMS,
  SET_ARTIST_INFO,
  SET_CURRENT_SONG,
  SET_CURRENT_VENUE,
  SET_DEVICES,
  SET_HISTORY,
  ADD_SONG_SEARCH_RESULTS,
  SET_SONG_SEARCH_RESULTS,
  SET_RECOMMENDATIONS,
  SET_SPOTIFY_TOKENS,
  SET_VENUE_INFO,
  SET_VENUE_SEARCH_RESULTS,
  SET_VOTES,
  SET_WAVE_TOKENS
} from '../constants';

const DispatchContext = createContext();
const StateContext = createContext();

export const initialState = {
  accountInfo: {
    firstName: undefined,
    lastName: undefined,
    username: undefined
  },
  albumInfo: undefined,
  artistInfo: undefined,
  currentSong: undefined,
  currentVenue: (() => {
    try {
      return JSON.parse(Cookies.get('currentVenue'));
    } catch (error) {
      return undefined;
    }
  })() || undefined,
  devices: [],
  history: (() => {
    try {
      return JSON.parse(Cookies.get('history'));
    } catch (error) {
      return undefined;
    }
  })() || [],
  recommendations: [],
  searchResults: {
    songs: [],
    venues: []
  },
  tokens: {
    spotify: (() => {
      try {
        return JSON.parse(Cookies.get('spotifyTokens'));
      } catch (error) {
        return undefined;
      }
    })() || {
      accessToken: undefined,
      accessTokenExpiresAt: undefined,
      refreshToken: undefined
    },
    wave: (() => {
      try {
        return JSON.parse(Cookies.get('waveTokens'));
      } catch (error) {
        return undefined;
      }
    })() || {
      accessToken: undefined,
      accessTokenExpiresAt: undefined,
      refreshToken: undefined,
      refreshTokenExpiresAt: undefined
    }
  },
  venueInfo: undefined
};

const appReducer = (state, action) => {
  switch(action.type) {
    case CLEAR:
      return initialState;
    case CLEAR_HISTORY:
      return {
        ...state,
        history: []
      };
    case SET_ACCOUNT_INFO:
      return {
        ...state,
        accountInfo: action.payload
      };
    case SET_ALBUM_INFO:
      return {
        ...state,
        albumInfo: action.payload
      };
    case ADD_ARTIST_INFO_ALBUMS:
      return {
        ...state,
        artistInfo: {
          ...state.artistInfo,
          albums: {
            ...state.artistInfo.albums,
            items: [
              ...state.artistInfo.albums.items,
              ...action.payload.items
            ],
            next: action.payload.next
          }
        }
      }
    case SET_ARTIST_INFO:
      return {
        ...state,
        artistInfo: action.payload
      };
    case SET_CURRENT_SONG:
      return {
        ...state,
        currentSong: action.payload
      };
    case SET_CURRENT_VENUE:
      return {
        ...state,
        currentVenue: action.payload
      };
    case SET_DEVICES:
      return {
        ...state,
        devices: action.payload
      };
    case SET_HISTORY:
      return {
        ...state,
        history: action.payload
      };
    case SET_RECOMMENDATIONS:
      return {
        ...state,
        recommendations: action.payload
      };
    case SET_SPOTIFY_TOKENS:
      return {
        ...state,
        tokens: {
          spotify: action.payload,
          wave: state.tokens.wave
        }
      };
    case ADD_SONG_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: {
          songs: {
            ...state.searchResults.songs,
            items: [
              ...state.searchResults.songs.items,
              ...action.payload.items
            ],
            next: action.payload.next
          },
          venues: state.searchResults.venues
        }
      };
    case SET_SONG_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: {
          songs: action.payload,
          venues: state.searchResults.venues
        }
      };
    case SET_VENUE_INFO:
      return {
        ...state,
        venueInfo: action.payload
      };
    case SET_VENUE_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: {
          songs: state.searchResults.songs,
          venues: action.payload
        }
      };
    case SET_VOTES:
      return {
        ...state,
        currentVenue: {
          ...state.currentVenue,
          votes: action.payload
        }
      };
    case SET_WAVE_TOKENS:
      return {
        ...state,
        tokens: {
          spotify: state.tokens.spotify,
          wave: action.payload
        }
      };
    default:
      return state;
  }
};

const Provider = (props) => {
  const { children } = props;

  const [ state, dispatch ] = useReducer(appReducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        { children }
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  return useContext(StateContext);
};

export const useAppDispatch = () => {
  return useContext(DispatchContext);
};

export default Provider;
