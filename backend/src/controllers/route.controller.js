const Route = require('../models/Route');
const { generateRouteCandidates } = require('../services/routeOptimizer.service');

// POST /api/v1/routes/generate
async function generateRoutes(req, res, next) {
  try {
    const { originDistrictId, destinationDistrictId } = req.body;

    if (!originDistrictId || !destinationDistrictId) {
      return res.status(400).json({
        success: false,
        error: 'Origin and Destination district IDs are required.'
      });
    }

    const candidates = await generateRouteCandidates(originDistrictId, destinationDistrictId);

    res.status(200).json({
      success: true,
      originDistrictId,
      destinationDistrictId,
      candidates
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/routes/save
async function saveRoute(req, res, next) {
  try {
    const routeData = req.body;
    
    if (!routeData.originNodeId || !routeData.destinationNodeId) {
      return res.status(400).json({ success: false, error: 'Incomplete route data.' });
    }

    const routeId = routeData.routeId || `RTE-SAVED-${Date.now()}`;
    const route = await Route.findOneAndUpdate(
      { routeId },
      { ...routeData, routeId, isSaved: true, createdBy: req.user?._id || null },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Route saved to tactical route catalog.',
      data: route
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/routes
async function getSavedRoutes(req, res, next) {
  try {
    const routes = await Route.find({ isSaved: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateRoutes,
  saveRoute,
  getSavedRoutes
};
