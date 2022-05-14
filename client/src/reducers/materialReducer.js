import {
  LOADING_ALL_MATERIALS,
  GET_ALL_MATERIALS,
} from '../actions/types';


const initialState = {
  materials: [],
  loading: false,
};


export default function (state = initialState, action) {
  switch (action.type) {
    case LOADING_ALL_MATERIALS:
      return {
        ...state,
        loading: true,
      };

    case GET_ALL_MATERIALS:
      return {
        ...state,
        materials: action.payload,
        loading: false,
      };

    default: return state;
  }
}