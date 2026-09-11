const express = require('express');
const router = express.Router();
const districtController = require('../controllers/district.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

router.get('/', optionalAuthenticate, districtController.getDistricts);
router.get('/:id', optionalAuthenticate, districtController.getDistrictById);

module.exports = router;
