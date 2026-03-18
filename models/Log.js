const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({
  action: String,
  details: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Log', logSchema);
