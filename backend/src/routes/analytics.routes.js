const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

router.get('/', optionalAuthenticate, analyticsController.getAnalyticsData);

module.exports = router;
