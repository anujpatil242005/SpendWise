const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for initial setup ease, can restrict to client domain later
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Basic Status Route
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Orchid Expense Tracker Backend API is active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

// Mount authentication API routes
app.use('/api/auth', authRoutes);

// Mount transactional API routes
app.use('/api/transactions', transactionRoutes);

// Mount expense API routes
app.use('/api/expenses', expenseRoutes);

// Mount income API routes
app.use('/api/incomes', incomeRoutes);

// Mount budget API routes
app.use('/api/budget', budgetRoutes);

// Mount analytics API routes
app.use('/api/analytics', analyticsRoutes);

// Catch-all API Page Not Found (404)
app.use('*', (req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - Path: ${req.originalUrl}`);
  next(error);
});

// Error handling middleware
app.use(errorHandler);

// Listen to port
app.listen(PORT, () => {
  console.log(`[Server] Orchid Expense Tracker Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
