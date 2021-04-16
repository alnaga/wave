import React, {createContext, useContext, useReducer} from 'react';

import {
  SET_ALBUM_INFO,
  SET_CURRENTLY_PLAYING,
  SET_DEVICES,
  SET_SEARCH_RESULTS,
  SET_SPOTIFY_TOKENS,
  SET_VENUE,
  SET_WAVE_TOKENS
} from '../constants';

const DispatchContext = createContext();
const StateContext = createContext();

export const initialState = {
  albumInfo: undefined,
  currentlyPlaying: undefined,
  devices: [],
  searchResults: [],
  tokens: {
    spotify: JSON.parse(sessionStorage.getItem('spotifyTokens')) || {
      accessToken: undefined,
      accessTokenExpiresAt: undefined,
      refreshToken: undefined
    },
    wave: JSON.parse(sessionStorage.getItem('waveTokens')) || {
      accessToken: undefined,
      accessTokenExpiresAt: undefined,
      refreshToken: undefined,
      refreshTokenExpiresAt: undefined
    }
  },
  venue: undefined
};

const appReducer = (state, action) => {
  switch(action.type) {
    case SET_ALBUM_INFO:
      return {
        ...state,
        albumInfo: action.payload
      };
    case SET_CURRENTLY_PLAYING:
      return {
        ...state,
        currentlyPlaying: action.payload
      };
    case SET_DEVICES:
      return {
        ...state,
        devices: action.payload
      };
    case SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload
      };
    case SET_SPOTIFY_TOKENS:
      return {
        ...state,
        tokens: {
          spotify: action.payload,
          wave: state.tokens.wave
        }
      };
    case SET_VENUE:
      return {
        ...state,
        venue: action.payload
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
