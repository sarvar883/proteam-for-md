const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  type: {
    type: String
  },
  name: {
    type: String
  },
  inn: {
    type: String
  },
  phone: {
    type: String
  },

  // old address field
  address: {
    type: String
  },
  // 28.02.2022 now address contains info about city, district, street, etc.
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

  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }],
  contracts: [String],
  createdAt: {
    type: Date
  }
});

module.exports = mongoose.model('Client', clientSchema);