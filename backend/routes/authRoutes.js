const express = require('express');
const router = express.Router();
const { syncUser, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Protected route to sync authenticated user data with MongoDB
router.post('/sync', verifyToken, syncUser);

// Profile endpoints
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
