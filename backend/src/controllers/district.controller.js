const District = require('../models/District');
const Vehicle = require('../models/Vehicle');
const RoadSegment = require('../models/RoadSegment');
const Incident = require('../models/Incident');
const { getWeatherForCoordinates } = require('../services/weather.service');

// GET /api/v1/districts
async function getDistricts(req, res, next) {
  try {
    const { state, minAccessibility } = req.query;
    const query = {};

    if (state && state !== 'all') query.state = state;
    if (minAccessibility) query.currentAccessibilityScore = { $gte: Number(minAccessibility) };

    const districts = await District.find(query).sort({ currentAccessibilityScore: -1 });

    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/districts/:id
async function getDistrictById(req, res, next) {
  try {
    const district = await District.findOne({
      $or: [{ districtId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!district) {
      return res.status(404).json({ success: false, error: 'District not found.' });
    }

    // Refresh live weather
    const liveWeather = await getWeatherForCoordinates(
      district.centroid[0],
      district.centroid[1],
      district.name
    );

    // Find local road segments connected to this district
    const roadSegments = await RoadSegment.find({
      $or: [{ fromNode: district.districtId }, { toNode: district.districtId }]
    });

    // Find recent incidents
    const incidents = await Incident.find({ districtId: district.districtId }).limit(10).sort({ capturedAt: -1 });

    // Find active vehicles
    const vehicles = await Vehicle.find({ status: { $in: ['in_transit', 'caution_zone'] } }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        ...district.toObject(),
        weather: liveWeather,
        roadSegments,
        incidents,
        activeVehicles: vehicles
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDistricts,
  getDistrictById
};
