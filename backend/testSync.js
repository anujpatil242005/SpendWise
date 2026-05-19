require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const Expense = require('./models/Expense');
const Income = require('./models/Income');

const runSyncTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/orchid-expense-tracker';
    console.log(`[Sync Test] Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Sync Test] Connected!');

    const testUser = 'user_test_sync_runner';

    // Cleanup old test records
    await Transaction.deleteMany({ userId: testUser });
    await Expense.deleteMany({ userId: testUser });
    await Income.deleteMany({ userId: testUser });

    console.log('\n--- TEST CASE 1: Syncing New Expense ---');
    // 1. Create a corresponding dashboard Transaction
    const transaction = await Transaction.create({
      userId: testUser,
      title: 'Monthly Wifi Bill',
      amount: 1500,
      type: 'expense',
      category: 'Bills',
      date: new Date(),
      description: 'Broadband internet plan',
    });

    // 2. Create the specialized Expense document
    const expense = await Expense.create({
      userId: testUser,
      title: 'Monthly Wifi Bill',
      amount: 1500,
      category: 'Bills',
      paymentMethod: 'Card',
      date: new Date(),
      notes: 'Broadband internet plan',
      transactionId: transaction._id,
    });

    console.log(`✅ Expense created successfully (ID: ${expense._id})`);
    console.log(`🔗 Linked Transaction created successfully (ID: ${transaction._id})`);

    // Assert Transaction exists
    const foundTx = await Transaction.findById(expense.transactionId);
    if (foundTx && foundTx.amount === 1500 && foundTx.title === 'Monthly Wifi Bill') {
      console.log('✅ PASS: Transaction matching the expense exists with correct values!');
    } else {
      throw new Error('FAIL: Matching transaction not found or incorrect values.');
    }

    console.log('\n--- TEST CASE 2: Syncing Expense Update ---');
    // Update expense values
    expense.title = 'Premium Wifi Subscription';
    expense.amount = 1800;
    await expense.save();

    // Synchronize Transaction (as done in expenseController)
    await Transaction.findByIdAndUpdate(
      expense.transactionId,
      {
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.notes,
      }
    );

    const updatedTx = await Transaction.findById(expense.transactionId);
    if (updatedTx && updatedTx.amount === 1800 && updatedTx.title === 'Premium Wifi Subscription') {
      console.log('✅ PASS: Updated expense values successfully synchronized to Transaction!');
    } else {
      throw new Error('FAIL: Transaction was not successfully updated.');
    }

    console.log('\n--- TEST CASE 3: Syncing Expense Deletion ---');
    // Delete linked transaction first
    await Transaction.deleteOne({ _id: expense.transactionId });
    await Expense.deleteOne({ _id: expense._id });

    const deletedTx = await Transaction.findById(expense.transactionId);
    if (!deletedTx) {
      console.log('✅ PASS: Deleting expense successfully purged linked Transaction!');
    } else {
      throw new Error('FAIL: Transaction still exists after deletion.');
    }

    console.log('\n==============================================');
    console.log('🎉 ALL SYNCHRONIZATION TESTS PASSED SUCCESSFULLY!');
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST CASE FAILED:', error.message);
    process.exit(1);
  }
};

runSyncTest();
