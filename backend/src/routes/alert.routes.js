const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

router.get('/', optionalAuthenticate, alertController.getAlerts);
router.get('/:id', optionalAuthenticate, alertController.getAlertById);
router.post('/broadcast', optionalAuthenticate, alertController.broadcastAlert);

module.exports = router;
