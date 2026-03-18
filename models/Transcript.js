const mongoose = require('mongoose');
const transcriptSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  channelId: String,
  userId: String,
  content: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Transcript', transcriptSchema);
