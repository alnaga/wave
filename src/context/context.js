import React, {createContext, useContext, useReducer} from 'react';

import {
  SET_ACCESS_TOKEN,
  SET_CURRENTLY_PLAYING,
  SET_DEVICES,
  SET_REFRESH_TOKEN,
  SET_SEARCH_RESULTS,
  SET_VENUE
} from '../constants';

const DispatchContext = createContext();
const StateContext = createContext();

export const initialState = {
  accessToken: sessionStorage.getItem('accessToken'),
  currentlyPlaying: undefined,
  devices: [],
  refreshToken: sessionStorage.getItem('refreshToken'),
  searchResults: [],
  venue: undefined
};

const appReducer = (state, action) => {
  switch(action.type) {
    case SET_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.payload
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
    case SET_REFRESH_TOKEN:
      return {
        ...state,
        refreshToken: action.payload
      };
    case SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload
      };
    case SET_VENUE:
      return {
        ...state,
        venue: action.payload
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
