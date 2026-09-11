const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true },
  model: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Heavy Cargo', 'Reefer Vaccine Hauler', 'Quick Response Patrol', 'Grain & Rations Hauler', 'Medical Oxygen Hauler', 'Light Emergency Relief'],
    default: 'Heavy Cargo'
  },
  capacityTons: { type: Number, default: 10.0 },
  currentLoadTons: { type: Number, default: 0.0 },
  fuelLevelPct: { type: Number, default: 100 },
  engineTempC: { type: Number, default: 85 },
  batteryPct: { type: Number, default: 98 },
  altitudeM: { type: Number, default: 100 },
  driver: {
    name: { type: String, default: 'Unassigned Driver' },
    phone: { type: String, default: '+91 94000 00000' },
    license: { type: String, default: 'NER-DL-MOCK' },
    experienceYears: { type: Number, default: 5 },
    rating: { type: Number, default: 4.8 }
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      default: [91.7362, 26.1445]
    }
  },
  heading: { type: Number, default: 0 },
  speedKmph: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['in_transit', 'caution_zone', 'delayed', 'idle', 'maintenance', 'emergency_standby'],
    default: 'idle'
  },
  assignedSegmentId: { type: String, default: null },
  assignedShipmentId: { type: String, default: null },
  activeRoutePolyline: {
    type: [[Number]], // Array of [lng, lat] coordinates
    default: []
  },
  routeProgressIndex: { type: Number, default: 0 },
  lastPingAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

VehicleSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Vehicle', VehicleSchema);
