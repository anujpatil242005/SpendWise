const User = require('../models/User');

// @desc    Sync authenticated Privy user with MongoDB
// @route   POST /api/auth/sync
// @access  Private
const syncUser = async (req, res, next) => {
  try {
    const { privyId } = req.user; // Attached by verifyToken middleware
    const { email, walletAddress, phone } = req.body;

    console.log(`[Auth Sync] Syncing Privy user: ${privyId}`);

    // Update or create user record in MongoDB
    const user = await User.findOneAndUpdate(
      { privyId },
      {
        $set: {
          email: email || undefined,
          walletAddress: walletAddress || undefined,
          phone: phone || undefined,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'User profile synchronized successfully in MongoDB',
      data: user,
    });
  } catch (error) {
    console.error('[Sync Error] Failed to sync user:', error.message);
    next(error);
  }
};

// @desc    Get user profile configuration
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const { privyId } = req.user;
    let user = await User.findOne({ privyId });
    if (!user) {
      // Auto-provision user profile for offline local development and seamless Privy experiences!
      user = await User.create({
        privyId,
        email: 'spendwise.beginner@example.com',
        displayName: 'SpendWise User',
        currency: 'USD'
      });
      console.log(`[Profile Auto-Provision] Created new profile for privyId: ${privyId}`);
    }

    res.status(200).json({
      success: true,
      data: {
        privyId: user.privyId,
        email: user.email || '',
        walletAddress: user.walletAddress || '',
        phone: user.phone || '',
        displayName: user.displayName || '',
        currency: user.currency || 'USD'
      }
    });
  } catch (error) {
    console.error('[Profile Fetch Error]', error.message);
    next(error);
  }
};

// @desc    Update user profile configuration
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { privyId } = req.user;
    const { displayName, currency } = req.body;

    const user = await User.findOneAndUpdate(
      { privyId },
      {
        $set: {
          displayName: displayName !== undefined ? displayName.trim() : undefined,
          currency: currency || undefined
        }
      },
      { new: true, upsert: true, runValidators: true } // Enable upsert to auto-create on update if needed!
    );

    console.log(`[Profile Update] Updated user ${privyId} — Display Name: "${user.displayName}", Currency: ${user.currency}`);

    res.status(200).json({
      success: true,
      message: 'Profile configuration updated successfully.',
      data: {
        privyId: user.privyId,
        email: user.email || '',
        walletAddress: user.walletAddress || '',
        phone: user.phone || '',
        displayName: user.displayName || '',
        currency: user.currency || 'USD'
      }
    });
  } catch (error) {
    console.error('[Profile Update Error]', error.message);
    next(error);
  }
};

module.exports = { syncUser, getProfile, updateProfile };
