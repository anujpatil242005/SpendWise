const express = require('express');
const router = express.Router();
const { 
  getBudget, 
  setBudget, 
  deleteBudget 
} = require('../controllers/budgetController');
const { verifyToken } = require('../middleware/auth');

// All budget endpoints require a verified token
router.use(verifyToken);

// CRUD routes for user budget configuration
router.get('/', getBudget);
router.post('/', setBudget);
router.delete('/', deleteBudget);

module.exports = router;
