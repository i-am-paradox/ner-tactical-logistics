const express = require('express');
const router = express.Router();
const roadController = require('../controllers/road.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

router.get('/', optionalAuthenticate, roadController.getRoadSegments);
router.get('/:id', optionalAuthenticate, roadController.getRoadSegmentById);
router.patch('/:id/status', optionalAuthenticate, roadController.updateRoadStatus);

module.exports = router;
