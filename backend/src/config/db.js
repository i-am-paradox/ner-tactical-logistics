const mongoose = require('mongoose');
const config = require('./env');

let memoryServer = null;

async function connectDB() {
  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${config.mongoUri}`);
    mongoose.set('strictQuery', false);
    
    // Try connecting to configured MongoDB instance with a short timeout
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log('[Database] Connected to external/local MongoDB successfully.');
  } catch (err) {
    console.warn(`[Database] Could not connect to ${config.mongoUri}: ${err.message}`);
    console.log('[Database] Initializing MongoMemoryServer in-memory fallback database...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] In-memory MongoDB initialized and connected at: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Critical: Failed to start in-memory MongoDB fallback:', memErr);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB runtime error:', err);
  });
}

async function closeDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, closeDB };
