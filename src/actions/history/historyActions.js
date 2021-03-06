import Cookies from 'js-cookie';
import { CLEAR_HISTORY, SET_HISTORY } from '../../constants';

/**
 * Clears the currently stored history context object.
 * @param dispatch - Application Dispatch
 */
export const clearHistory = (dispatch) => {
  Cookies.set('history', JSON.stringify([]));

  dispatch({
    type: CLEAR_HISTORY
  });
};

/**
 * Removes the last item in the history context object.
 * @param dispatch - Application Dispatch
 * @param history - History context object
 */
export const popHistory = (dispatch, history) => {
  const newHistory = history;
  newHistory.pop();

  Cookies.set('history', JSON.stringify(newHistory));

  dispatch({
    type: SET_HISTORY,
    payload: newHistory
  });
};

/**
 * Pushes a new pathname to the history context object.
 * @param dispatch - Application Dispatch
 * @param history - History context object
 * @param pathname - The pathname to add
 */
export const pushToHistory = (dispatch, history, pathname) => {
  const newHistory = [
    ...history,
    pathname
  ];

  Cookies.set('history', JSON.stringify(newHistory));

  dispatch({
    type: SET_HISTORY,
    payload: newHistory
  });
};
