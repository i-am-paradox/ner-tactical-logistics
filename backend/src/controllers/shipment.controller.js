const Shipment = require('../models/Shipment');
const Vehicle = require('../models/Vehicle');

// GET /api/v1/shipments
async function getShipments(req, res, next) {
  try {
    const { cargoType, priority, status, limit = 50 } = req.query;
    const query = {};

    if (cargoType && cargoType !== 'all') query.cargoType = cargoType;
    if (priority && priority !== 'all') query.priority = priority;
    if (status && status !== 'all') query.status = status;

    const shipments = await Shipment.find(query).limit(Number(limit)).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/shipments/:id
async function getShipmentById(req, res, next) {
  try {
    const shipment = await Shipment.findOne({
      $or: [{ shipmentId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found.' });
    }

    let assignedVehicle = null;
    if (shipment.assignedVehicleId) {
      assignedVehicle = await Vehicle.findOne({ vehicleId: shipment.assignedVehicleId });
    }

    res.status(200).json({
      success: true,
      data: {
        ...shipment.toObject(),
        assignedVehicle
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/shipments
async function createShipment(req, res, next) {
  try {
    const {
      title,
      originDistrictId,
      originName,
      destinationDistrictId,
      destinationName,
      cargoType,
      priority,
      weightKg,
      assignedVehicleId,
      tempRequirementC
    } = req.body;

    const shipmentId = `SHP-${(cargoType || 'GEN').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const shipment = await Shipment.create({
      shipmentId,
      title: title || `${cargoType || 'Relief'} Consignment to ${destinationName}`,
      originDistrictId,
      originName,
      destinationDistrictId,
      destinationName,
      cargoType: cargoType || 'Food Supplies',
      priority: priority || 'standard',
      weightKg: Number(weightKg) || 2500,
      assignedVehicleId: assignedVehicleId || null,
      tempRequirementC: tempRequirementC || 'Ambient',
      status: 'in_transit',
      milestones: [
        { name: `${originName} Staging Loaded`, completed: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { name: 'District Highway Gate Clearance', completed: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { name: 'Mountain Ridge Checkpoint', completed: false, time: 'Est +2 hrs' },
        { name: `${destinationName} Delivery Receiving Bay`, completed: false, time: 'Est +5 hrs' }
      ]
    });

    // If vehicle assigned, link it
    if (assignedVehicleId) {
      await Vehicle.findOneAndUpdate(
        { vehicleId: assignedVehicleId },
        { $set: { assignedShipmentId: shipmentId, status: 'in_transit' } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Shipment created and scheduled for dispatch.',
      data: shipment
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/shipments/:id/reroute
async function rerouteShipment(req, res, next) {
  try {
    const { reason = 'Active landslide risk along primary corridor', newRouteId } = req.body;

    const shipment = await Shipment.findOne({
      $or: [{ shipmentId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found.' });
    }

    shipment.status = 'rerouted';
    shipment.rerouteHistory.push({
      timestamp: new Date(),
      reason,
      newRouteId: newRouteId || 'RTE-SAFEST-BYPASS-01'
    });
    shipment.notes = `Rerouted via alternate green corridor at ${new Date().toLocaleTimeString()}: ${reason}`;

    await shipment.save();

    res.status(200).json({
      success: true,
      message: 'Shipment successfully rerouted to optimal bypass corridor.',
      data: shipment
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getShipments,
  getShipmentById,
  createShipment,
  rerouteShipment
};
