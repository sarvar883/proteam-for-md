import {
  GET_SORTED_ORDERS,
  GET_NOT_COMPLETED_ORDERS,
  GET_COMPLETE_ORDERS,
  SET_COMPLETE_ORDERS_TIME_PARAMS,
  GET_COMPLETE_ORDER_BY_ID,
  DELETE_QUERY_FROM_STATE,
  GOT_STATS_FOR_OPERATOR,
  GET_REPEAT_ORDERS,
  SET_REPEAT_ORDER_SEARCH_VARS,
  SET_LOADING_SORTED_ORDERS,
  SET_LOADING_COMPLETE_ORDERS,
  SET_LOADING_OPERATOR_STATS
} from '../actions/types';


const initialState = {
  sortedOrders: [],

  completeOrders: [],
  completeOrdersTimeParams: {
    type: '',
    days: [],
    day: '',
  },

  repeatOrders: [],
  repeatOrderSearchVars: {
    method: '',
    headingDay: '',
    selectedDays: []
  },
  notCompleteOrders: [],
  orderToConfirm: {
    orderId: {},
    disinfectorId: {},
    userCreated: {},
    userAcceptedOrder: {},
    whoDealtWithClient: {},
    clientId: {
      contracts: []
    },
    disinfectors: [],
    prevFailedOrder: {},
    nextOrdersAfterFailArray: [],

    // we no longer use this field
    nextOrderAfterFail: {},
  },
  stats: {
    sortedOrders: [],
    method: ''
  },
  loadingSortedOrders: false,
  loadingCompleteOrders: false,
  loadingStats: false
};


export default function (state = initialState, action) {
  switch (action.type) {
    case SET_LOADING_SORTED_ORDERS:
      return {
        ...state,
        loadingSortedOrders: true
      };

    case SET_LOADING_COMPLETE_ORDERS:
      return {
        ...state,
        loadingCompleteOrders: true
      };

    case SET_LOADING_OPERATOR_STATS:
      return {
        ...state,
        loadingStats: true
      };

    case GET_SORTED_ORDERS:
      return {
        ...state,
        sortedOrders: action.payload,
        date: action.date,
        loadingSortedOrders: false
      };

    case GET_NOT_COMPLETED_ORDERS:
      return {
        ...state,
        // sortedOrders: action.payload,
        notCompleteOrders: action.payload,
        loadingSortedOrders: false
      };

    case GET_COMPLETE_ORDERS:
      return {
        ...state,
        completeOrders: action.payload,
        loadingCompleteOrders: false
      };

    case SET_COMPLETE_ORDERS_TIME_PARAMS:
      return {
        ...state,
        completeOrdersTimeParams: {
          ...state.completeOrdersTimeParams,
          type: action.payload.type || '',
          days: action.payload.days || [],
          day: action.payload.day || '',
        },
      };

    case GET_COMPLETE_ORDER_BY_ID:
      return {
        ...state,
        orderToConfirm: action.payload,
        loadingCompleteOrders: false
      };

    case DELETE_QUERY_FROM_STATE:
      return {
        ...state,
        completeOrders: state.completeOrders.filter(item => item._id !== action.payload)
      };


    case GOT_STATS_FOR_OPERATOR:
      return {
        ...state,
        stats: {
          ...state.stats,
          sortedOrders: action.payload.sortedOrders,
          method: action.payload.method
        },
        loadingStats: false
      };

    case GET_REPEAT_ORDERS:
      return {
        ...state,
        loadingSortedOrders: false,
        repeatOrders: action.payload
      };

    case SET_REPEAT_ORDER_SEARCH_VARS:
      return {
        ...state,
        repeatOrderSearchVars: {
          ...state.repeatOrderSearchVars,
          method: action.payload.method,
          headingDay: action.payload.headingDay,
          selectedDays: action.payload.selectedDays,
        }
      };

    default:
      return state;
  }
}