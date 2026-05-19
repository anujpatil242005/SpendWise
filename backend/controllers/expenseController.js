const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');

// @desc    Get all expenses for the user (with support for search, category filter, and sorting)
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const { search, category, sort } = req.query;

    // Build query filter
    const queryFilter = { userId: privyId };

    // 1. Apply category filter
    if (category && category !== 'All') {
      queryFilter.category = category;
    }

    // 2. Apply search filter (match on title or notes)
    if (search && search.trim() !== '') {
      queryFilter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // 3. Build sorting order
    const sortOrder = {};
    if (sort === 'highest') {
      sortOrder.amount = -1; // Highest amount first
    } else if (sort === 'lowest') {
      sortOrder.amount = 1;  // Lowest amount first
    } else {
      sortOrder.date = -1;   // Default: Latest date first
      sortOrder.createdAt = -1;
    }

    console.log(`[Expense API] Fetching entries for user ${privyId}. Filters:`, queryFilter, 'Sort:', sortOrder);

    const expenses = await Expense.find(queryFilter).sort(sortOrder);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error('[Expense Fetch Error] Failed to search logs:', error.message);
    next(error);
  }
};

// @desc    Create a new expense entry
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const { title, amount, category, paymentMethod, date, notes } = req.body;

    // Field validation
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
      type: 'expense',
      category,
      date: date || undefined,
      description: notes ? notes.trim() : undefined,
    });

    // 2. Create the specialized Expense document
    const expense = await Expense.create({
      userId: privyId,
      title: title.trim(),
      amount: Number(amount),
      category,
      paymentMethod: paymentMethod || 'Cash',
      date: date || undefined,
      notes: notes ? notes.trim() : undefined,
      transactionId: transaction._id,
    });

    console.log('[Expense API] Expense record created successfully:', expense._id);

    res.status(201).json({
      success: true,
      message: 'Expense record successfully created',
      data: expense,
    });
  } catch (error) {
    console.error('[Expense Creation Error] Failed to insert log:', error.message);
    next(error);
  }
};

// @desc    Update an expense entry
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const expenseId = req.params.id;

    // Check if expense exists and belongs to the active user
    let expense = await Expense.findOne({ _id: expenseId, userId: privyId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found or unauthorized access',
      });
    }

    // Perform update
    expense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        ...req.body,
        userId: privyId, // Safeguard: prevent modifying the record owner
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Synchronize the linked dashboard transaction
    if (expense.transactionId) {
      await Transaction.findByIdAndUpdate(
        expense.transactionId,
        {
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          description: expense.notes,
        },
        { runValidators: true }
      );
      console.log('[Expense API] Corresponding dashboard transaction synchronized:', expense.transactionId);
    }

    console.log('[Expense API] Expense record updated successfully:', expenseId);

    res.status(200).json({
      success: true,
      message: 'Expense record successfully updated',
      data: expense,
    });
  } catch (error) {
    console.error('[Expense Update Error] Failed to modify log:', error.message);
    next(error);
  }
};

// @desc    Delete an expense entry
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const expenseId = req.params.id;

    // Check if expense exists and belongs to the active user
    const expense = await Expense.findOne({ _id: expenseId, userId: privyId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found or unauthorized access',
      });
    }

    // Delete linked dashboard transaction
    if (expense.transactionId) {
      await Transaction.deleteOne({ _id: expense.transactionId });
      console.log('[Expense API] Corresponding dashboard transaction deleted:', expense.transactionId);
    }

    await Expense.deleteOne({ _id: expenseId });

    console.log('[Expense API] Expense record deleted successfully:', expenseId);

    res.status(200).json({
      success: true,
      message: 'Expense record successfully deleted',
      data: {},
    });
  } catch (error) {
    console.error('[Expense Deletion Error] Failed to delete log:', error.message);
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
