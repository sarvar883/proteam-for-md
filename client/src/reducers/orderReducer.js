import {
  CORPORATE_CLIENTS,
  GET_ALL_USERS,
  GET_DISINFECTORS,
  SET_LOADING,
  SET_LOADING_REPEAT_ORDER,
  GET_ALL_ORDERS,
  ADD_ORDER,
  GET_ORDER_BY_ID,
  CLEAR_ORDER_BY_ID,
  SEARCH_ORDERS,
  SET_SEARCH_ORDER_METHOD,
  GET_REPEAT_ORDER_FORM,
  GET_COMPLETE_ORDERS_IN_MONTH,
  SET_COMP_ORDER_METHOD_INPUT,
  UPDATE_GRADE_OF_ORDER,
} from '../actions/types';

const emptyOrderObject = {
  disinfectorId: {},
  clientId: {
    contracts: []
  },
  userCreated: {},
  userAcceptedOrder: {},
  whoDealtWithClient: {},
  disinfectors: [],
  prevFailedOrder: {},
  nextOrdersAfterFailArray: [],
  typeOfService: '',

  // we no longer use this field
  nextOrderAfterFail: {},
};

const initialState = {
  corporateClients: [],
  allUsers: [],
  disinfectors: [],

  orders: [],

  searchOrderMethod: '',
  searchOrderInput: '',


  orderById: { ...emptyOrderObject },
  repeatOrder: {
    disinfectorId: {},
    previousOrder: {},
    userCreated: {}
  },
  completeOrdersInMonth: [],
  compOrderMethod: '',
  compOrderInput: {
    month: 0,
    year: 0,
    days: [],
    day: ''
  },

  loading: false,
  loadingRepeatOrder: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: true
      };

    case SET_LOADING_REPEAT_ORDER:
      return {
        ...state,
        loadingRepeatOrder: true
      };

    case CORPORATE_CLIENTS:
      return {
        ...state,
        corporateClients: action.payload
      };

    case GET_ALL_USERS:
      return {
        ...state,
        allUsers: action.payload,
        loading: false
      };

    case GET_DISINFECTORS:
      return {
        ...state,
        disinfectors: action.payload,
        loading: false
      };

    case GET_ALL_ORDERS:
      return {
        ...state,
        orders: action.payload,
        loading: false
      };

    case ADD_ORDER:
      return {
        ...state,
        orders: [...state.orders, action.payload]
      };

    case GET_ORDER_BY_ID:
      return {
        ...state,
        orderById: action.payload,
        loading: false
      };

    case CLEAR_ORDER_BY_ID:
      return {
        ...state,
        orderById: { ...emptyOrderObject }
      };

    case SEARCH_ORDERS:
      return {
        ...state,
        orders: action.payload,
        loading: false
      };

    case SET_SEARCH_ORDER_METHOD:
      return {
        ...state,
        searchOrderMethod: action.payload.method,
        searchOrderInput: action.payload.payload
      };

    case GET_REPEAT_ORDER_FORM:
      return {
        ...state,
        repeatOrder: action.payload,
        loadingRepeatOrder: false
      };

    case GET_COMPLETE_ORDERS_IN_MONTH:
      return {
        ...state,
        completeOrdersInMonth: action.payload,
        loading: false
      };

    case SET_COMP_ORDER_METHOD_INPUT:
      let object = { ...action.payload };
      return {
        ...state,
        compOrderMethod: object.type,
        compOrderInput: {
          ...state.compOrderInput,
          day: object.type === 'day' ? object.day : '',
          days: object.type === 'week' ? object.days : [],
          month: object.type === 'month' ? object.month : 0,
          year: object.type === 'month' ? object.year : 0
        }
      };

    case UPDATE_GRADE_OF_ORDER:
      const indexOfOrderWithID = state.orders.findIndex(item => item._id === action.payload.orderId);
      const newArray = [...state.orders];
      newArray[indexOfOrderWithID].adminGrade = action.payload.grade;
      newArray[indexOfOrderWithID].adminGaveGrade = true;

      return {
        ...state,
        orders: newArray,
      };

    default:
      return state;
  }
};