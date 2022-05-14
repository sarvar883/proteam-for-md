const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const materialSchema = new Schema({
  // name of material
  material: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
});

module.exports = mongoose.model('Material', materialSchema);