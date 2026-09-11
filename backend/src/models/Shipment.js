const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  time: { type: String, default: '--:--' }
}, { _id: false });

const ShipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  originDistrictId: { type: String, required: true },
  originName: { type: String, required: true },
  destinationDistrictId: { type: String, required: true },
  destinationName: { type: String, required: true },
  cargoType: { 
    type: String, 
    enum: ['Medicines', 'Food Supplies', 'Heavy Equipment', 'Agricultural Produce', 'Relief Kits', 'Fuel & Energy'],
    default: 'Food Supplies'
  },
  priority: { 
    type: String, 
    enum: ['critical', 'high', 'standard', 'low'],
    default: 'standard'
  },
  status: { 
    type: String, 
    enum: ['pending_dispatch', 'dispatched', 'in_transit', 'rerouted', 'delayed', 'delivered', 'cancelled'],
    default: 'pending_dispatch'
  },
  assignedVehicleId: { type: String, default: null },
  weightKg: { type: Number, default: 1000 },
  tempRequirementC: { type: String, default: 'Ambient' },
  currentTempC: { type: String, default: '22°C' },
  dispatchedAt: { type: Date, default: Date.now },
  estimatedArrival: { type: Date, default: () => new Date(Date.now() + 6 * 3600 * 1000) },
  actualDeliveredAt: { type: Date, default: null },
  milestones: [MilestoneSchema],
  rerouteHistory: [{
    timestamp: { type: Date, default: Date.now },
    reason: String,
    oldRouteId: String,
    newRouteId: String
  }],
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shipment', ShipmentSchema);
