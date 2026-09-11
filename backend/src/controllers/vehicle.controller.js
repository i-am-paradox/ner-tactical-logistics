const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');
const RoadSegment = require('../models/RoadSegment');

// GET /api/v1/vehicles
async function getVehicles(req, res, next) {
  try {
    const { status, type, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    const vehicles = await Vehicle.find(query).limit(Number(limit)).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/vehicles/:id
async function getVehicleById(req, res, next) {
  try {
    const vehicle = await Vehicle.findOne({
      $or: [{ vehicleId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found.' });
    }

    // Lookup linked shipment if any
    let activeShipment = null;
    if (vehicle.assignedShipmentId) {
      activeShipment = await Shipment.findOne({ shipmentId: vehicle.assignedShipmentId });
    }

    // Lookup road segment if any
    let currentSegment = null;
    if (vehicle.assignedSegmentId) {
      currentSegment = await RoadSegment.findOne({ segmentId: vehicle.assignedSegmentId });
    }

    res.status(200).json({
      success: true,
      data: {
        ...vehicle.toObject(),
        activeShipment,
        currentSegment
      }
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/vehicles/:id/position (called by simulation job / GPS ping)
async function updateVehiclePosition(req, res, next) {
  try {
    const { coordinates, heading, speedKmph, altitudeM, assignedSegmentId, status } = req.body;

    const updateFields = {
      lastPingAt: new Date()
    };

    if (coordinates) {
      updateFields.currentLocation = {
        type: 'Point',
        coordinates
      };
    }
    if (heading !== undefined) updateFields.heading = heading;
    if (speedKmph !== undefined) updateFields.speedKmph = speedKmph;
    if (altitudeM !== undefined) updateFields.altitudeM = altitudeM;
    if (assignedSegmentId !== undefined) updateFields.assignedSegmentId = assignedSegmentId;
    if (status !== undefined) updateFields.status = status;

    const vehicle = await Vehicle.findOneAndUpdate(
      { $or: [{ vehicleId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }] },
      { $set: updateFields },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found.' });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getVehicles,
  getVehicleById,
  updateVehiclePosition
};
