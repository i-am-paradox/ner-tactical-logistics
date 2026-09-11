const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incident.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');
const { incidentLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/', incidentLimiter, optionalAuthenticate, incidentController.submitIncident);
router.get('/', optionalAuthenticate, incidentController.getIncidents);
router.get('/:id', optionalAuthenticate, incidentController.getIncidentById);
router.patch('/:id/status', optionalAuthenticate, incidentController.updateIncidentStatus);
router.post('/:id/translate', optionalAuthenticate, incidentController.translateIncident);

module.exports = router;
