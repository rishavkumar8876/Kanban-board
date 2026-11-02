const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kanban_saas';
  const useMemoryDb = process.env.USE_MEMORY_DB;

  if (useMemoryDb === 'true') {
    return await startMemoryServer();
  }

  try {

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    if (useMemoryDb === 'auto' || !process.env.USE_MEMORY_DB) {
      console.warn(`[Database] Could not connect to local MongoDB (${err.message}). Starting embedded in-memory MongoDB server...`);
      return await startMemoryServer();
    }
    console.error(`[Database Error] Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

const startMemoryServer = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'kanban_saas'
      }
    });
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] In-memory MongoDB running at: ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not initialize in-memory MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[Database] MongoDB connection closed');
  } catch (err) {
    console.error('[Database Error] Error disconnecting from MongoDB:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
