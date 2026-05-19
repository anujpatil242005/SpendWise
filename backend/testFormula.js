require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/orchid-expense-tracker';
    console.log(`[Test Suite] Connecting to local MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Test Suite] Connected!');

    const testUser = 'user_test_formula_runner';

    // 1. Setup Monthly Budget limit of 10,000 for our test user
    console.log('[Test Case Setup] Setting Monthly Budget limit to 10,000...');
    await Budget.findOneAndUpdate(
      { userId: testUser },
      { userId: testUser, monthlyLimit: 10000 },
      { new: true, upsert: true }
    );

    // 2. Clear old transactions for test user
    await Transaction.deleteMany({ userId: testUser });

    // 3. Create Inflow transaction (Income of 500)
    console.log('[Test Case Setup] Creating Total Inflows (Income) of 500...');
    await Transaction.create({
      userId: testUser,
      title: 'Test Inflow Entry',
      amount: 500,
      type: 'income',
      category: 'Freelance',
      date: new Date()
    });

    // 4. Create Outflow transaction (Expense of 500)
    console.log('[Test Case Setup] Creating Total Outflows (Expense) of 500...');
    await Transaction.create({
      userId: testUser,
      title: 'Test Outflow Entry',
      amount: 500,
      type: 'expense',
      category: 'Food & Drink',
      date: new Date()
    });

    // 5. Run Aggregation Formula (same as transactionController.js)
    console.log('[Test Execution] Running remaining balance aggregation...');
    const budgetDoc = await Budget.findOne({ userId: testUser });
    const monthlyBudget = budgetDoc ? budgetDoc.monthlyLimit : 0;

    const stats = await Transaction.aggregate([
      { $match: { userId: testUser } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalIncome = stats.find((s) => s._id === 'income')?.totalAmount || 0;
    const totalExpenses = stats.find((s) => s._id === 'expense')?.totalAmount || 0;
    const remainingBalance = (monthlyBudget > 0 ? monthlyBudget : 0) + totalIncome - totalExpenses;

    console.log('\n================ TEST RESULTS ================');
    console.log(`💵 Monthly Budget Limit : ₹${monthlyBudget}`);
    console.log(`📈 Total Inflows (Income): ₹${totalIncome}`);
    console.log(`📉 Total Outflows (Spent): ₹${totalExpenses}`);
    console.log(`💳 Remaining Balance     : ₹${remainingBalance}`);
    console.log('==============================================');

    // 6. Assertions
    if (remainingBalance === 10000) {
      console.log('✅ TEST PASSED: Remaining balance matches expected ₹10,000 value!');
    } else {
      console.error(`❌ TEST FAILED: Expected ₹10,000 but got ₹${remainingBalance}`);
    }

    // Clean up test data
    console.log('\n[Test Cleanup] Cleaning up test user records...');
    await Transaction.deleteMany({ userId: testUser });
    await Budget.deleteOne({ userId: testUser });

    process.exit(remainingBalance === 10000 ? 0 : 1);
  } catch (error) {
    console.error('[Test Error] Test crashed:', error.message);
    process.exit(1);
  }
};

runTest();
