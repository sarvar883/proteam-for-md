import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

import {
  GET_ERRORS,
  SET_CURRENT_USER,

  GET_ALL_ORDERS,

  SET_FAIL_SEARCH_VARS,
  GET_FAILED_ORDERS,
  SET_DATE_IN_CALENDAR,
} from './types';


// Register User
export const registerUser = (userData, history) => (dispatch) => {
  axios.post('/register', userData)
    .then(res => history.push('/admin'))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};


// Login - Get User Token
export const loginUser = (userData, history) => (dispatch) => {
  axios
    .post('/login', userData)
    .then(res => {
      // Save to localStorage
      const { token } = res.data;
      // Set token to ls
      localStorage.setItem('jwtToken', token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));

      history.push(`/${res.data.user.occupation}`);
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};


// Set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};


// Log user out
export const logoutUser = (history) => (dispatch) => {
  // Remove token from localStorage
  localStorage.removeItem('jwtToken');
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));

  // clean up redux
  // set this.props.order.orders to empty string
  dispatch({ type: GET_ALL_ORDERS, payload: [] });

  // set this.props.fail.fails and its search vars to empty array 
  dispatch({ type: SET_FAIL_SEARCH_VARS, payload: {} });
  dispatch({ type: GET_FAILED_ORDERS, payload: [] });

  dispatch({ type: SET_DATE_IN_CALENDAR, payload: null });

  history.push('/login');
};