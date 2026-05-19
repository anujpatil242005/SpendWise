const express = require('express');
const router = express.Router();
const { 
  getTransactionStats, 
  getTransactions, 
  createTransaction 
} = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/auth');

// All endpoints inside this router require a verified Privy token
router.use(verifyToken);

// Stats route
router.get('/stats', getTransactionStats);

// Base CRUD routes for recent transactions list
router.get('/', getTransactions);
router.post('/', createTransaction);

module.exports = router;
