const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  disinfectorId: {
    // кому давали заказ
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  clientType: {
    type: String
  },

  // for corporate clients only
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },

  client: {
    type: String
  },

  // for corporate clients only
  filial: {
    type: String
  },

  // old address field
  address: {
    type: String
  },
  // 28.02.2022 now address contains info about city, district, street, etc.
  // any time we change this address_v2 field, we have to change address_v2 in Client model !!!
  address_v2: {
    // город / вилоят
    region: {
      type: String
    },
    // туман
    district: {
      type: String
    },
    // квартал / махалля / улица
    block_or_street: {
      type: String
    },
    // улица (необязательно)
    // street: {
    //   type: String
    // },
    // номер дома
    houseNumber: {
      type: String
    },
    // номер квартиры (необязательно)
    apartmentNumber: {
      type: String
    },
    // этаж (необязательно)
    floor: {
      type: String
    },
    // ориентир 
    referencePoint: {
      type: String
    },
  },

  phone: {
    type: String
  },

  // номер заявки
  orderNumber: {
    type: String
  },

  phone2: {
    type: String
  },
  dateFrom: {
    type: Date
  },
  typeOfService: {
    type: String
  },
  advertising: {
    type: String
  },
  comment: {
    type: String
  },
  disinfectorComment: {
    type: String
  },
  userCreated: {
    // who filled created-order form
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  userAcceptedOrder: {
    // кто принял заказ
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  whoDealtWithClient: {
    // 28.03.2022 кто общался с клиентом, предлагал услуги и т.д.
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  createdAt: {
    // когда заказ добавлен
    type: Date,
    default: Date.now
  },

  // repeat order (повторная продажа)
  repeatedOrder: {
    type: Boolean,
    default: false
  },
  timeOfRepeat: {
    type: Date // приблизительное время повторного заказа
  },
  previousOrder: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  repeatedOrderDecided: {
    type: Boolean,
    default: false
  },
  repeatedOrderNeeded: {
    type: Boolean
  },

  // disinfector completes the order
  disinfectors: [{
    user: {
      // дезинфекторы, которые выполняли заказ
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    consumption: [{
      material: {
        type: String
      },
      amount: {
        type: Number
      },
      unit: {
        type: String
      }
    }]
  }],
  completed: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String
  },


  guarantee: {
    type: Number // in months
  },
  // 17.01.2022 now each typeOfService has its own guarantee period (in months)
  // in "guarantee" field we write the minimum guarantee among types of services
  guarantee_v2: [{
    service: String,
    guaranteePeriod: Number, // in months
  }],


  contractNumber: {
    type: String
  },
  cost: {
    type: Number
  },
  completedAt: {
    type: Date
  },


  // failed order
  failed: {
    type: Boolean,
    default: false
  },
  prevFailedOrder: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },


  // --------------------------
  // do not use this field (nextOrderAfterFail)
  // this field is replaced by "nextOrdersAfterFailArray" (21.05.2021)
  // так как некачественные заказы могут иметь несколько повторных заказов
  nextOrderAfterFail: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  },
  // --------------------------

  // новый атрибут, который хранит повторные заказы
  nextOrdersAfterFailArray: [{
    type: Schema.Types.ObjectId,
    ref: 'Order',
    default: []
  }],


  // operator
  clientReview: {
    type: String
  },
  score: {
    type: Number
  },
  operatorCheckedAt: {
    type: Date
  },
  operatorDecided: {
    type: Boolean,
    default: false
  },
  operatorConfirmed: {
    type: Boolean,
    default: false
  },


  // accountant confirms order (he also inputs cost)
  accountantDecided: {
    type: Boolean,
    default: false
  },
  accountantConfirmed: {
    type: Boolean,
    default: false
  },
  invoice: {
    type: String
  },
  accountantCheckedAt: {
    type: Date
  },


  // for admin
  adminCheckedAt: {
    type: Date
  },
  adminDecided: {
    type: Boolean,
    default: false
  },
  adminConfirmed: {
    type: Boolean,
    default: false
  },

  // оценка админа за заказ
  adminGrade: {
    type: Number,
  },
  adminGaveGrade: {
    type: Boolean,
    default: false
  },
  adminGradeComment: {
    type: String,
  },

  // if admin decided to return the query back to disinfector
  adminDecidedReturn: {
    type: Boolean,
    default: false
  },
  // query is filled incorrectly, so admin returns the query to disinfector to refill the form
  returnedBack: {
    type: Boolean,
    default: false
  },
  // disinfector refilled the returned query
  returnHandled: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Order', orderSchema);