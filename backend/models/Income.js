const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Optimizes stats aggregations
    },
    title: {
      type: String,
      required: [true, 'Please provide an income source/description'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please specify an income amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please assign an income category'],
      enum: {
        values: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'],
        message: 'Invalid income category selected',
      },
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

module.exports = mongoose.model('Income', IncomeSchema);
