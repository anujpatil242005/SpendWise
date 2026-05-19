const Income = require('../models/Income');
const Transaction = require('../models/Transaction');

// @desc    Get all incomes for the user (with support for sorting)
// @route   GET /api/incomes
// @access  Private
const getIncomes = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const { sort } = req.query;

    const queryFilter = { userId: privyId };

    const sortOrder = {};
    if (sort === 'highest') {
      sortOrder.amount = -1;
    } else if (sort === 'lowest') {
      sortOrder.amount = 1;
    } else {
      sortOrder.date = -1;
      sortOrder.createdAt = -1;
    }

    console.log(`[Income API] Fetching entries for user ${privyId}. Sort:`, sortOrder);

    const incomes = await Income.find(queryFilter).sort(sortOrder);

    res.status(200).json({
      success: true,
      count: incomes.length,
      data: incomes,
    });
  } catch (error) {
    console.error('[Income Fetch Error] Failed to get entries:', error.message);
    next(error);
  }
};

// @desc    Get income calculations (Total Inflows & Monthly Accumulations)
// @route   GET /api/incomes/stats
// @access  Private
const getIncomeStats = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Calculate month boundary times in dynamic local scope
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // 1. Total Income Aggregate
    const totalStats = await Income.aggregate([
      { $match: { userId: privyId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // 2. Current Month Income Aggregate
    const monthlyStats = await Income.aggregate([
      { 
        $match: { 
          userId: privyId, 
          date: { $gte: startOfMonth, $lte: endOfMonth } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalIncome = totalStats.length > 0 ? totalStats[0].total : 0;
    const monthlyIncome = monthlyStats.length > 0 ? monthlyStats[0].total : 0;

    console.log(`[Income API] Stats for user ${privyId}. Total: $${totalIncome}, Monthly: $${monthlyIncome}`);

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        monthlyIncome,
      }
    });
  } catch (error) {
    console.error('[Income Stats Error] Failed to aggregate statistics:', error.message);
    next(error);
  }
};

// @desc    Create a new income entry
// @route   POST /api/incomes
// @access  Private
const createIncome = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const { title, amount, category, date, notes } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, amount, and category',
      });
    }

    // 1. Create a corresponding dashboard Transaction
    const transaction = await Transaction.create({
      userId: privyId,
      title: title.trim(),
      amount: Number(amount),
      type: 'income',
      category,
      date: date || undefined,
      description: notes ? notes.trim() : undefined,
    });

    // 2. Create the specialized Income document
    const income = await Income.create({
      userId: privyId,
      title: title.trim(),
      amount: Number(amount),
      category,
      date: date || undefined,
      notes: notes ? notes.trim() : undefined,
      transactionId: transaction._id,
    });

    console.log('[Income API] Income record created successfully:', income._id);

    res.status(201).json({
      success: true,
      message: 'Income record successfully created',
      data: income,
    });
  } catch (error) {
    console.error('[Income Creation Error] Failed to insert log:', error.message);
    next(error);
  }
};

// @desc    Update an income entry
// @route   PUT /api/incomes/:id
// @access  Private
const updateIncome = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const incomeId = req.params.id;

    let income = await Income.findOne({ _id: incomeId, userId: privyId });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found or unauthorized access',
      });
    }

    // Perform update
    income = await Income.findByIdAndUpdate(
      incomeId,
      {
        ...req.body,
        userId: privyId, // Protect record ownership
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Synchronize the linked dashboard transaction
    if (income.transactionId) {
      await Transaction.findByIdAndUpdate(
        income.transactionId,
        {
          title: income.title,
          amount: income.amount,
          category: income.category,
          date: income.date,
          description: income.notes,
        },
        { runValidators: true }
      );
      console.log('[Income API] Corresponding dashboard transaction synchronized:', income.transactionId);
    }

    console.log('[Income API] Income record updated successfully:', incomeId);

    res.status(200).json({
      success: true,
      message: 'Income record successfully updated',
      data: income,
    });
  } catch (error) {
    console.error('[Income Update Error] Failed to modify log:', error.message);
    next(error);
  }
};

// @desc    Delete an income entry
// @route   DELETE /api/incomes/:id
// @access  Private
const deleteIncome = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const incomeId = req.params.id;

    const income = await Income.findOne({ _id: incomeId, userId: privyId });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found or unauthorized access',
      });
    }

    // Delete linked dashboard transaction
    if (income.transactionId) {
      await Transaction.deleteOne({ _id: income.transactionId });
      console.log('[Income API] Corresponding dashboard transaction deleted:', income.transactionId);
    }

    await Income.deleteOne({ _id: incomeId });

    console.log('[Income API] Income record deleted successfully:', incomeId);

    res.status(200).json({
      success: true,
      message: 'Income record successfully deleted',
      data: {},
    });
  } catch (error) {
    console.error('[Income Deletion Error] Failed to delete log:', error.message);
    next(error);
  }
};

module.exports = {
  getIncomes,
  getIncomeStats,
  createIncome,
  updateIncome,
  deleteIncome,
};
