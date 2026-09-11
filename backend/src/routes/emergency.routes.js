const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergency.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

router.get('/status', optionalAuthenticate, emergencyController.getEmergencyStatus);
router.post('/toggle', optionalAuthenticate, emergencyController.toggleEmergencyMode);
router.post('/sitrep', optionalAuthenticate, emergencyController.generateSitRep);

module.exports = router;
