const mongoose = require('mongoose');
const panelSchema = new mongoose.Schema({
  name: String,
  roles: [String],
  categoryId: String,
  type: { type: String, default: 'individual' },
  mergedGroup: { type: String, default: '' },
  uiType: { type: String, default: 'button' },
  embedTitle: String,
  embedDescription: String,
  embedColor: String,
  targetChannelId: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Panel', panelSchema);
