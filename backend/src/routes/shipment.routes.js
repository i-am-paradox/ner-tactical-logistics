const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipment.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

router.get('/', optionalAuthenticate, shipmentController.getShipments);
router.get('/:id', optionalAuthenticate, shipmentController.getShipmentById);
router.post('/', optionalAuthenticate, shipmentController.createShipment);
router.post('/:id/reroute', optionalAuthenticate, shipmentController.rerouteShipment);

module.exports = router;
