const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const vehicleRoutes = require('./vehicle.routes');
const shipmentRoutes = require('./shipment.routes');
const routeRoutes = require('./route.routes');
const incidentRoutes = require('./incident.routes');
const alertRoutes = require('./alert.routes');
const districtRoutes = require('./district.routes');
const emergencyRoutes = require('./emergency.routes');
const analyticsRoutes = require('./analytics.routes');
const roadRoutes = require('./road.routes');
const importRoutes = require('./import.routes');

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/routes', routeRoutes);
router.use('/incidents', incidentRoutes);
router.use('/alerts', alertRoutes);
router.use('/districts', districtRoutes);
router.use('/emergency', emergencyRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/roads', roadRoutes);
router.use('/import', importRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'NER Tactical Logistics Platform API v1'
  });
});

module.exports = router;
