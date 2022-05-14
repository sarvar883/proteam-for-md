import axios from 'axios';
import {
  LOADING_ALL_MATERIALS,
  GET_ALL_MATERIALS,
  GET_ERRORS,
} from './types';


export const addNewMaterial = (object, history, occupation) => async (dispatch) => {
  try {
    await axios.post('/material/add-new', { object });

    dispatch({ type: LOADING_ALL_MATERIALS });

    // get all materials again (with the new created one)
    const res = await axios.post('/material/get-all');

    dispatch({
      type: GET_ALL_MATERIALS,
      payload: res.data
    });

    history.push(`/${occupation}`);

  } catch (err) {
    dispatch({ type: GET_ERRORS, payload: err, });
  }
};


export const getAllMaterials = () => async (dispatch) => {
  dispatch({ type: LOADING_ALL_MATERIALS });

  try {
    const res = await axios.post('/material/get-all');

    dispatch({
      type: GET_ALL_MATERIALS,
      payload: res.data
    });

  } catch (err) {
    dispatch({ type: GET_ERRORS, payload: err });
  }
};


export const deleteMaterialFromDB = (object) => async (dispatch) => {
  try {
    await axios.post('/material/delete', { object });

    dispatch({ type: LOADING_ALL_MATERIALS });

    // get all materials again
    const res = await axios.post('/material/get-all');

    dispatch({
      type: GET_ALL_MATERIALS,
      payload: res.data
    });

  } catch (err) {
    dispatch({ type: GET_ERRORS, payload: err });
  }
};