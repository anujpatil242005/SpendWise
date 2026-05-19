const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense 
} = require('../controllers/expenseController');
const { verifyToken } = require('../middleware/auth');

// All expense routes require a verified Privy token
router.use(verifyToken);

// CRUD routes
router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
