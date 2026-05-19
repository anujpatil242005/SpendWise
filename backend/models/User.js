const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    privyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    walletAddress: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
