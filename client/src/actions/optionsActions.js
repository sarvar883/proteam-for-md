import {
  SET_THEME,
  SET_DATE_IN_CALENDAR,
  BACK_BUTTON_ENABLED,
} from './types';


export const setTheme = (theme) => (dispatch) => {
  // edit localStorage
  localStorage.setItem('proTeamTheme', theme);

  // edit in redux
  dispatch({ type: SET_THEME, payload: theme });
};


export const setBackButtonEnabled = (value) => (dispatch) => {
  dispatch({ type: BACK_BUTTON_ENABLED, payload: value, });
};


export const setDateInCalendar = (date = new Date()) => (dispatch) => {
  dispatch({ type: SET_DATE_IN_CALENDAR, payload: date });
};