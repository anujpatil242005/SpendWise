require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const checkDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/orchid-expense-tracker';
    console.log(`[Database Check] Connecting to database: ${mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    console.log('[Database Check] Connected successfully!\n');

    // Query Users
    const userCount = await User.countDocuments({});
    console.log(`👥 Total Registered Users: ${userCount}`);
    const users = await User.find({}).limit(5);
    if (userCount === 0) {
      console.log('  (No users registered yet)');
    } else {
      users.forEach((u, i) => {
        console.log(`  ${i + 1}. Email: ${u.email || 'N/A'}, Display Name: ${u.displayName || 'N/A'}, PrivyID: ${u.privyId}`);
      });
    }
    console.log('');

    // Query Transactions
    const txCount = await Transaction.countDocuments({});
    console.log(`💰 Total Transactions: ${txCount}`);
    const transactions = await Transaction.find({}).sort({ date: -1 }).limit(5);
    if (txCount === 0) {
      console.log('  (No transactions recorded yet)');
    } else {
      transactions.forEach((tx, i) => {
        console.log(`  ${i + 1}. Title: "${tx.title}", Type: ${tx.type.toUpperCase()}, Amount: ₹${tx.amount}, Category: ${tx.category}, Date: ${tx.date.toLocaleDateString()}`);
      });
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('[Database Check Error] Failed to query database:', error.message);
    process.exit(1);
  }
};

checkDatabase();
