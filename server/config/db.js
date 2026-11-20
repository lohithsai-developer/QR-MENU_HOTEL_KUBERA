const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node.js querySrv DNS resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if system restricts setServers
}

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your_mongodb_connection_string_here') {
    console.log('ℹ️  No MONGODB_URI detected. Activating Local Storage Fallback Mode (Full persistence via local JSON store).');
    isConnectedToMongo = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    isConnectedToMongo = true;
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection failed (${error.message}). Activating Local Storage Fallback Mode.`);
    isConnectedToMongo = false;
    return false;
  }
};

const getDBStatus = () => ({
  mode: isConnectedToMongo ? 'mongodb' : 'local_storage',
  connected: isConnectedToMongo
});

module.exports = { connectDB, getDBStatus };
