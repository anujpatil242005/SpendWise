const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/orchid-expense-tracker');
    console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    // Do not crash the server immediately to allow easier local setup/troubleshooting, but output warning
    console.warn('[Database Warning] Running without active database connection. Make sure MongoDB is running locally.');
  }
};

module.exports = connectDB;
