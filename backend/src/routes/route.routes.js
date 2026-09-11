const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

router.post('/generate', optionalAuthenticate, routeController.generateRoutes);
router.post('/save', optionalAuthenticate, routeController.saveRoute);
router.get('/', optionalAuthenticate, routeController.getSavedRoutes);

module.exports = router;
