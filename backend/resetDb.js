require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Expense = require('./models/Expense');
const Income = require('./models/Income');
const Budget = require('./models/Budget');

const resetDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/orchid-expense-tracker';
    console.log(`[Database Reset] Connecting to database: ${mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    console.log('[Database Reset] Connection successful. Wiping records...');

    // Delete all collections
    const transactions = await Transaction.deleteMany({});
    console.log(`- Deleted ${transactions.deletedCount} transactions`);

    const expenses = await Expense.deleteMany({});
    console.log(`- Deleted ${expenses.deletedCount} expense category logs`);

    const incomes = await Income.deleteMany({});
    console.log(`- Deleted ${incomes.deletedCount} income logs`);

    const budgets = await Budget.deleteMany({});
    console.log(`- Deleted ${budgets.deletedCount} budget limits`);

    const users = await User.deleteMany({});
    console.log(`- Deleted ${users.deletedCount} user profiles`);

    console.log('[Database Reset] Database successfully wiped clean!');
    process.exit(0);
  } catch (error) {
    console.error('[Database Reset Error] Failed to wipe database:', error.message);
    process.exit(1);
  }
};

resetDatabase();
