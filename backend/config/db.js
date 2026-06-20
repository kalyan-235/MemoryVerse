const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    // Give a helpful hint for Atlas IP whitelist errors
    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('💡 FIX: Go to MongoDB Atlas → Network Access → Add IP Address');
      console.error('   → Click "Allow Access from Anywhere" (0.0.0.0/0) for development');
      console.error('   → Or add your specific IP address');
      console.error('');
    }

    process.exit(1);
  }
};

module.exports = connectToDatabase;
