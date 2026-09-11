const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  severity: { 
    type: String, 
    enum: ['critical', 'warning', 'info'], 
    default: 'warning' 
  },
  scope: { 
    type: String, 
    enum: ['all', 'district', 'corridor', 'convoys_only'], 
    default: 'district' 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  affectedDistricts: [{ type: String }],
  affectedCorridors: [{ type: String }],
  channels: [{ 
    type: String, 
    enum: ['in_app', 'sms', 'push'] 
  }],
  translations: {
    type: Map,
    of: String,
    default: {}
  },
  isActive: { type: Boolean, default: true },
  broadcastBy: { type: String, default: 'NER Emergency Operation Command' },
  broadcastAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 3600 * 1000) }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', AlertSchema);
