const mongoose = require('mongoose');

const SheetSchema = new mongoose.Schema({
  data: {
    type: Array,
    required: true,
    default: []
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sheet', SheetSchema);