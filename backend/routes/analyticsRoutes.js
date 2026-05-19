const express = require('express');
const router = express.Router();
const { getOverviewStats } = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');

// All analytics endpoints require a verified token
router.use(verifyToken);

// Analytics aggregation routes
router.get('/overview', getOverviewStats);

module.exports = router;
