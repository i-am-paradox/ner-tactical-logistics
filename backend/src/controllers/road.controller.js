const RoadSegment = require('../models/RoadSegment');

// GET /api/v1/roads
async function getRoadSegments(req, res, next) {
  try {
    const { status, isBlocked, isFlooded } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (isBlocked === 'true') query.isBlocked = true;
    if (isFlooded === 'true') query.floodDepthM = { $gt: 0 };

    const roads = await RoadSegment.find(query).sort({ currentRiskScore: -1 });

    res.status(200).json({
      success: true,
      count: roads.length,
      data: roads
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/roads/:id
async function getRoadSegmentById(req, res, next) {
  try {
    const road = await RoadSegment.findOne({ segmentId: req.params.id });
    if (!road) {
      return res.status(404).json({ success: false, error: 'Road segment not found.' });
    }
    res.status(200).json({ success: true, data: road });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/roads/:id/status
async function updateRoadStatus(req, res, next) {
  try {
    const { status, floodDepthM, blockageReason, isBlocked } = req.body;
    const updateFields = {
      lastVerifiedAt: new Date()
    };

    if (status !== undefined) updateFields.status = status;
    if (floodDepthM !== undefined) {
      updateFields.floodDepthM = Number(floodDepthM);
      if (Number(floodDepthM) > 0) {
        updateFields.isBlocked = true;
        updateFields.currentRiskScore = 95;
        updateFields.riskBand = 'high';
      }
    }
    if (blockageReason !== undefined) updateFields.blockageReason = blockageReason;
    if (isBlocked !== undefined) updateFields.isBlocked = isBlocked;

    const road = await RoadSegment.findOneAndUpdate(
      { segmentId: req.params.id },
      { $set: updateFields },
      { new: true }
    );

    if (!road) {
      return res.status(404).json({ success: false, error: 'Road segment not found.' });
    }

    res.status(200).json({ success: true, message: 'Road segment updated.', data: road });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRoadSegments,
  getRoadSegmentById,
  updateRoadStatus
};
