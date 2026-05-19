const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // One budget document per user
      index: true,
    },
    monthlyLimit: {
      type: Number,
      required: [true, 'Please provide a monthly budget limit'],
      min: [1, 'Budget limit must be greater than 0'],
    },
    // Category-level sub-budgets (optional, stored as a flexible map)
    categoryLimits: {
      type: Map,
      of: Number,
      default: {},
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Budget', BudgetSchema);
