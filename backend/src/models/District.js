const mongoose = require('mongoose');

const DistrictSchema = new mongoose.Schema({
  districtId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  state: { 
    type: String, 
    required: true,
    enum: ['Assam', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Sikkim']
  },
  hq: { type: String, required: true },
  centroid: {
    type: [Number], // [lng, lat]
    required: true
  },
  boundaryCoordinates: {
    type: [[[Number]]], // Polygon coordinate ring
    default: []
  },
  elevationM: { type: Number, default: 500 },
  avgSlopeDeg: { type: Number, default: 15.0 },
  floodSusceptibility: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'moderate' },
  landslideSusceptibility: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'moderate' },
  baseAccessibilityScore: { type: Number, min: 0, max: 100, default: 80 },
  currentAccessibilityScore: { type: Number, min: 0, max: 100, default: 80 },
  activeConvoysCount: { type: Number, default: 0 },
  activeIncidentsCount: { type: Number, default: 0 },
  emergencyContacts: [{
    title: String,
    name: String,
    phone: String
  }],
  checkpoints: [{
    name: String,
    coordinates: [Number],
    status: { type: String, enum: ['open', 'restricted', 'closed'], default: 'open' }
  }],
  weather: {
    tempC: { type: Number, default: 24 },
    rainfallMm: { type: Number, default: 5 },
    condition: { type: String, default: 'Partly Cloudy' },
    windKmph: { type: Number, default: 12 },
    lastFetchedAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('District', DistrictSchema);
