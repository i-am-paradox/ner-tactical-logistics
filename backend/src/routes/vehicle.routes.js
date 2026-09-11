const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

router.get('/', optionalAuthenticate, vehicleController.getVehicles);
router.get('/:id', optionalAuthenticate, vehicleController.getVehicleById);
router.patch('/:id/position', optionalAuthenticate, vehicleController.updateVehiclePosition);

module.exports = router;
