import React, {createContext, useContext, useReducer} from 'react';

import {
  SET_ACCESS_TOKEN,
  SET_REFRESH_TOKEN
} from '../constants';

const DispatchContext = createContext();
const StateContext = createContext();

export const initialState = {
  accessToken: sessionStorage.getItem('accessToken'),
  refreshToken: sessionStorage.getItem('refreshToken')
};

const appReducer = (state, action) => {
  switch(action.type) {
    case SET_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.payload
      };
    case SET_REFRESH_TOKEN:
      return {
        ...state,
        refreshToken: action.payload
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