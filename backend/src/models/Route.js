const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  originNodeId: { type: String, required: true },
  originName: { type: String, required: true },
  destinationNodeId: { type: String, required: true },
  destinationName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['fastest', 'safest', 'balanced'], 
    default: 'balanced' 
  },
  distanceKm: { type: Number, required: true },
  durationMin: { type: Number, required: true },
  overallRiskScore: { type: Number, required: true }, // 0 to 100
  riskBand: { 
    type: String, 
    enum: ['safe', 'moderate', 'high'], 
    default: 'safe' 
  },
  segments: [{ type: String }], // Array of segment IDs
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]],
      required: true
    }
  },
  elevationProfile: [{
    distanceKm: Number,
    elevationM: Number,
    slopeDeg: Number
  }],
  aiReasoning: { type: String, default: '' },
  weatherConditionSummary: { type: String, default: 'Clear / Moderate cloud cover' },
  isSaved: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', RouteSchema);
