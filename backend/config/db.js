const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shopbd';

    // Start in-memory DB in development if MONGO_URI points to local
    if (process.env.NODE_ENV === 'development' && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
      console.log('🔄 Starting MongoDB Memory Server...');
      try {
        mongod = await MongoMemoryServer.create({
          instance: {
            dbName: 'shopbd',
            port: 27017,
          }
        });
        uri = mongod.getUri();
        // The URI from MongoMemoryServer already includes the trailing slash or port.
        // Let's ensure it connects to the 'shopbd' database.
        if (!uri.endsWith('/')) {
          uri += '/';
        }
        uri += 'shopbd';
        console.log(`✅ MongoDB Memory Server running at: ${uri}`);
      } catch (err) {
        console.warn('⚠️ Could not start MongoDB Memory Server (it might already be running), trying direct connection...');
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongod) {
    console.log('Stopping MongoDB Memory Server...');
    await mongod.stop();
  }
  process.exit(0);
});

module.exports = connectDB;
