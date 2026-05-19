const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get dashboard aggregated statistics
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;

    // Fetch user's budget settings
    const budgetDoc = await Budget.findOne({ userId: privyId });
    const monthlyBudget = budgetDoc ? budgetDoc.monthlyLimit : 0;

    // Aggregate total income and expenses for the authenticated user
    const stats = await Transaction.aggregate([
      { $match: { userId: privyId } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Parse aggregation results
    const totalIncome = stats.find((s) => s._id === 'income')?.totalAmount || 0;
    const totalExpenses = stats.find((s) => s._id === 'expense')?.totalAmount || 0;
    const remainingBalance = (monthlyBudget > 0 ? monthlyBudget : 0) + totalIncome - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        remainingBalance: Number(remainingBalance.toFixed(2)),
        monthlyBudget,
      },
    });
  } catch (error) {
    console.error('[Stats Error] Failed to aggregate statistics:', error.message);
    next(error);
  }
};

// @desc    Get recent transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const { search } = req.query;

    const queryFilter = { userId: privyId };

    // Apply search filter (match on title or description)
    if (search && search.trim() !== '') {
      queryFilter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Fetch the transactions matching the filter
    let query = Transaction.find(queryFilter).sort({ date: -1, createdAt: -1 });

    // Only limit to 5 if the user is not actively searching, so they can see all search matches
    if (!search || search.trim() === '') {
      query = query.limit(5);
    }

    const transactions = await query;

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('[Transactions Fetch Error] Failed to retrieve entries:', error.message);
    next(error);
  }
};

// @desc    Create a new transaction record
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const { title, amount, type, category, date, description } = req.body;

    // Basic validation
    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, amount, type, category',
      });
    }

    // Insert transaction
    const transaction = await Transaction.create({
      userId: privyId,
      title,
      amount,
      type,
      category,
      date: date || undefined,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction ledger entry recorded successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('[Create Transaction Error] Failed to insert record:', error.message);
    next(error);
  }
};

module.exports = {
  getTransactionStats,
  getTransactions,
  createTransaction,
};
