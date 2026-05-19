const Transaction = require('../models/Transaction');

// @desc    Get aggregated analytics overview data
// @route   GET /api/analytics/overview
// @access  Private
const getOverviewStats = async (req, res, next) => {
  try {
    const privyId = req.user.privyId;
    const { range } = req.query; // '30days' | '6months' | '12months'

    // 1. Calculate time window threshold based on range
    const now = new Date();
    let startDate = new Date();
    
    if (range === '30days') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === '12months') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default: last 6 months
      startDate.setMonth(now.getMonth() - 6);
    }
    
    // Set to start of that day for consistency
    startDate.setHours(0, 0, 0, 0);

    // 2. Aggregate Category Spent Breakdown (Pie Chart Data)
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: privyId,
          type: 'expense',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
    ]);

    // 3. Aggregate Monthly Expenses (Bar Chart Data)
    const monthlyExpenses = await Transaction.aggregate([
      {
        $match: {
          userId: privyId,
          type: 'expense',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          amount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          amount: { $round: ['$amount', 2] },
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // Format monthly expenses to strings for Recharts (e.g. "May 2026")
    const formattedMonthlyExpenses = monthlyExpenses.map(item => {
      const dateObj = new Date(item.year, item.month - 1);
      return {
        month: dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        amount: item.amount,
      };
    });

    // 4. Aggregate Spending Trends (Line/Area Daily Chart Data)
    const spendingTrends = await Transaction.aggregate([
      {
        $match: {
          userId: privyId,
          type: 'expense',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          amount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          amount: { $round: ['$amount', 2] },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // 5. Aggregate Income vs Expenses (Composed Contrast Data)
    const rawIncomeVsExpense = await Transaction.aggregate([
      {
        $match: {
          userId: privyId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          type: '$_id.type',
          total: { $round: ['$total', 2] },
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // Pivot raw aggregation pairs into unified monthly composed objects
    const incomeVsExpenseMap = {};
    rawIncomeVsExpense.forEach(item => {
      const dateObj = new Date(item.year, item.month - 1);
      const key = dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      
      if (!incomeVsExpenseMap[key]) {
        incomeVsExpenseMap[key] = { month: key, income: 0, expense: 0 };
      }
      
      if (item.type === 'income') {
        incomeVsExpenseMap[key].income = item.total;
      } else {
        incomeVsExpenseMap[key].expense = item.total;
      }
    });

    // Convert map to sorted array
    const sortedKeys = Object.keys(incomeVsExpenseMap).sort((a, b) => new Date(a) - new Date(b));
    const formattedIncomeVsExpense = sortedKeys.map(key => incomeVsExpenseMap[key]);

    // 6. Calculate Top Overview metrics for selected range
    const totalAggregated = await Transaction.aggregate([
      {
        $match: {
          userId: privyId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalIncome = totalAggregated.find(t => t._id === 'income')?.total || 0;
    const totalExpenses = totalAggregated.find(t => t._id === 'expense')?.total || 0;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    console.log(
      `[Analytics API] User ${privyId} — Range: ${range || '6months'}. Income: $${totalIncome.toFixed(1)}, Expense: $${totalExpenses.toFixed(1)}, Savings Rate: ${savingsRate.toFixed(1)}%`
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome: Number(totalIncome.toFixed(2)),
          totalExpenses: Number(totalExpenses.toFixed(2)),
          netSavings: Number(netSavings.toFixed(2)),
          savingsRate: parseFloat(savingsRate.toFixed(2)),
        },
        categoryBreakdown,
        monthlyExpenses: formattedMonthlyExpenses,
        spendingTrends,
        incomeVsExpense: formattedIncomeVsExpense,
      },
    });
  } catch (error) {
    console.error('[Analytics Aggregation Error]', error.message);
    next(error);
  }
};

module.exports = { getOverviewStats };
