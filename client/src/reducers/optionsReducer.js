import {
  SET_THEME,
  SET_DATE_IN_CALENDAR,
  BACK_BUTTON_ENABLED,
} from '../actions/types';


const initialState = {
  theme: localStorage.getItem('proTeamTheme') || 'light',

  // date in calendar, so that the correct date is displayed when we go to calendar from another page
  // by default, the todays date is displayed in calendar 
  dateInCalendar: null,

  // whether "Go Back" button is enabled
  backButtonEnabled: true,
};


export default function (state = initialState, action) {
  switch (action.type) {
    case SET_THEME:
      return {
        ...state,
        theme: action.payload
      };

    case SET_DATE_IN_CALENDAR:
      return {
        ...state,
        dateInCalendar: action.payload
      };

    case BACK_BUTTON_ENABLED:
      return {
        ...state,
        backButtonEnabled: action.payload
      };

    default:
      return state;
  }
};