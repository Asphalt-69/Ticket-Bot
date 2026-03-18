const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Panel' },
  userId: String,
  username: String,
  claimId: String,
  claimerTag: String,
  channelName: String,
  closed: { type: Boolean, default: false },
  closedBy: String,
  closedByTag: String,
  closedAt: Date,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Ticket', ticketSchema);
