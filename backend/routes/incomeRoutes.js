const express = require('express');
const router = express.Router();
const { 
  getIncomes, 
  getIncomeStats,
  createIncome, 
  updateIncome, 
  deleteIncome 
} = require('../controllers/incomeController');
const { verifyToken } = require('../middleware/auth');

// All income routes require a verified Privy token
router.use(verifyToken);

// CRUD routes
router.get('/', getIncomes);
router.get('/stats', getIncomeStats);
router.post('/', createIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
