const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get the user's budget + real-time spending analytics
// @route   GET /api/budget
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch the user's budget document (may not exist yet)
    const budget = await Budget.findOne({ userId: privyId });

    // Aggregate this month's expenses
    const monthlyExpenseAgg = await Expense.aggregate([
      {
        $match: {
          userId: privyId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Aggregate expenses by category for this month
    const categoryBreakdownAgg = await Expense.aggregate([
      {
        $match: {
          userId: privyId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const monthlySpent = monthlyExpenseAgg.length > 0 ? monthlyExpenseAgg[0].total : 0;
    const monthlyLimit = budget ? budget.monthlyLimit : 0;
    const remaining = monthlyLimit - monthlySpent;
    const usagePercent = monthlyLimit > 0 ? Math.min((monthlySpent / monthlyLimit) * 100, 100) : 0;

    // Determine alert level
    let alertLevel = 'safe'; // safe | warning | danger | exceeded
    if (monthlyLimit > 0) {
      if (monthlySpent > monthlyLimit) alertLevel = 'exceeded';
      else if (usagePercent >= 90) alertLevel = 'danger';
      else if (usagePercent >= 70) alertLevel = 'warning';
    }

    console.log(
      `[Budget API] User ${privyId} — Limit: $${monthlyLimit}, Spent: $${monthlySpent}, Usage: ${usagePercent.toFixed(1)}%, Alert: ${alertLevel}`
    );

    res.status(200).json({
      success: true,
      data: {
        budget: budget || null,
        monthlyLimit,
        monthlySpent,
        remaining,
        usagePercent: parseFloat(usagePercent.toFixed(2)),
        alertLevel,
        categoryBreakdown: categoryBreakdownAgg,
        month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      },
    });
  } catch (error) {
    console.error('[Budget Fetch Error]', error.message);
    next(error);
  }
};

// @desc    Set or update the user's monthly budget
// @route   POST /api/budget
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const { monthlyLimit, categoryLimits } = req.body;

    if (!monthlyLimit || Number(monthlyLimit) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid monthly budget limit (minimum $1)',
      });
    }

    // Upsert — create if not exists, update if exists
    const budget = await Budget.findOneAndUpdate(
      { userId: privyId },
      {
        userId: privyId,
        monthlyLimit: Number(monthlyLimit),
        ...(categoryLimits && { categoryLimits }),
      },
      { new: true, upsert: true, runValidators: true }
    );

    console.log(`[Budget API] Budget set/updated for user ${privyId}: $${budget.monthlyLimit}`);

    res.status(200).json({
      success: true,
      message: 'Monthly budget successfully configured',
      data: budget,
    });
  } catch (error) {
    console.error('[Budget Set Error]', error.message);
    next(error);
  }
};

// @desc    Delete the user's budget
// @route   DELETE /api/budget
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    await Budget.deleteOne({ userId: privyId });
    console.log(`[Budget API] Budget deleted for user ${privyId}`);
    res.status(200).json({ success: true, message: 'Budget configuration removed' });
  } catch (error) {
    console.error('[Budget Delete Error]', error.message);
    next(error);
  }
};

module.exports = { getBudget, setBudget, deleteBudget };
