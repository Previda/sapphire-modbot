const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URL - supports both local and cloud (MongoDB Atlas)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sapphire-bot';

let isConnected = false;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
        });
        
        console.log('✅ MongoDB connected successfully!');
        isConnected = true;
        return mongoose.connection;
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        console.log('💡 Using local storage fallback for data persistence');
        isConnected = false;
        throw error;
    }
}

// Initialize MongoDB connection
async function initializeDatabase() {
    if (isConnected) return mongoose.connection;
    
    try {
        return await connectToMongoDB();
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        console.log('🔧 Bot will continue with local JSON storage');
        isConnected = false;
        return null;
    }
}

// Health check function
async function checkDatabaseHealth() {
    try {
        if (!isConnected) return false;
        
        await mongoose.connection.db.admin().ping();
        return true;
    } catch (error) {
        console.log('❌ Database health check failed:', error.message);
        isConnected = false;
        return false;
    }
}

module.exports = { 
    mongoose,
    initializeDatabase,
    checkDatabaseHealth,
    isConnected: () => isConnected
};
