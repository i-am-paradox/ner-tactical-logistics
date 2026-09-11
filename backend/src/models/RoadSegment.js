const mongoose = require('mongoose');

const RoadSegmentSchema = new mongoose.Schema({
  segmentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  fromNode: { type: String, required: true },
  toNode: { type: String, required: true },
  distanceKm: { type: Number, required: true },
  baseDurationMin: { type: Number, required: true },
  roadType: { type: String, default: 'Mountain Highway' },
  avgSlopeDeg: { type: Number, default: 15.0 },
  maxElevationM: { type: Number, default: 1000 },
  baseRiskScore: { type: Number, default: 20 },
  currentRiskScore: { type: Number, default: 20 },
  riskBand: { 
    type: String, 
    enum: ['safe', 'moderate', 'high'], 
    default: 'safe' 
  },
  status: {
    type: String,
    enum: ['clear', 'restricted', 'blocked', 'flooded'],
    default: 'clear'
  },
  floodDepthM: { type: Number, default: 0 },
  blockageReason: { type: String, default: '' },
  rainfallMm: { type: Number, default: 0 },
  historicalIncidentCount: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  isDegraded: { type: Boolean, default: false },
  isSafeCorridor: { type: Boolean, default: true },
  bridgeCount: { type: Number, default: 2 },
  criticalCulverts: { type: Number, default: 5 },
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
  lastVerifiedAt: { type: Date, default: Date.now },
  lastAssessedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('RoadSegment', RoadSegmentSchema);
