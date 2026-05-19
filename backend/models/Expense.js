const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Optimizes retrieval for dynamic search and filters
    },
    title: {
      type: String,
      required: [true, 'Please provide an expense description/title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please specify an expense amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please assign an expense category'],
      enum: {
        values: ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'],
        message: 'Invalid category option selected',
      },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please specify payment method used'],
      enum: {
        values: ['Card', 'Cash', 'Bank Transfer', 'Crypto Wallet', 'Other'],
        message: 'Invalid payment method selected',
      },
      default: 'Cash',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
