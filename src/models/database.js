const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI) {
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            isMongoConnected = true;
        } else {
            console.log('📦 Using local storage mode - no database connection');
            isMongoConnected = false;
        }
    } catch (error) {
        console.error('Database connection failed:', error.message);
        console.log('📦 Falling back to local storage mode');
        isMongoConnected = false;
    }
};

const initializeDatabase = async () => {
    await connectDB();
    return isMongoConnected;
};

const connectToMongoDB = connectDB;
const getConnection = () => mongoose.connection;
const isConnected = () => isMongoConnected;

// Mock MySQL pool for compatibility with existing commands
const pool = {
    query: async (sql, params) => {
        console.log('Mock DB Query:', sql);
        return { rows: [], insertId: 1 };
    },
    execute: async (sql, params) => {
        console.log('Mock DB Execute:', sql);
        return [{ insertId: 1, affectedRows: 1 }];
    }
};

// Compatibility functions
const getCollection = () => null;
const setDocument = async () => null;
const getDocument = async () => null;
const updateDocument = async () => null;
const deleteDocument = async () => null;

module.exports = {
    initializeDatabase,
    connectToMongoDB,
    getConnection,
    isConnected,
    getCollection,
    setDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    pool
};
