const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Speeds up retrieval for individual user dashboards
    },
    title: {
      type: String,
      required: [true, 'Please provide a transaction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a transaction amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Please specify transaction type'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
    },
    category: {
      type: String,
      required: [true, 'Please select a transaction category'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
