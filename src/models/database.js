const { Firestore } = require('@google-cloud/firestore');
const mongoose = require('mongoose');

let db = null;
let isFirestoreConnected = false;
let isMongoConnected = false;

const initializeFirestore = async () => {
    try {
        if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
            // Initialize Firestore with service account
            db = new Firestore({
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
                keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || './firebase-service-account.json'
            });
            
            // Test connection
            await db.collection('_health').doc('test').set({ 
                timestamp: new Date(),
                status: 'connected' 
            });
            
            console.log('🔥 Google Cloud Firestore connected successfully');
            isFirestoreConnected = true;
            return true;
        }
    } catch (error) {
        console.error('Firestore connection failed:', error.message);
        isFirestoreConnected = false;
    }
    return false;
};

const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI) {
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            isMongoConnected = true;
        } else {
            console.log('📦 No MongoDB URI - using Firestore only');
            isMongoConnected = false;
        }
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        isMongoConnected = false;
    }
};

const initializeDatabase = async () => {
    const firestoreOk = await initializeFirestore();
    await connectDB();
    
    if (firestoreOk) {
        console.log('✅ Database: Using Google Cloud Firestore');
        return true;
    } else if (isMongoConnected) {
        console.log('✅ Database: Using MongoDB');
        return true;
    } else {
        console.log('⚠️  Database: Local storage mode only');
        return false;
    }
};

// Database helper functions
const getCollection = (name) => {
    if (isFirestoreConnected && db) {
        return db.collection(name);
    }
    return null;
};

const setDocument = async (collection, docId, data) => {
    if (isFirestoreConnected && db) {
        await db.collection(collection).doc(docId).set(data);
        return true;
    }
    console.log(`Mock: Set ${collection}/${docId}`, data);
    return true;
};

const getDocument = async (collection, docId) => {
    if (isFirestoreConnected && db) {
        const doc = await db.collection(collection).doc(docId).get();
        return doc.exists ? doc.data() : null;
    }
    console.log(`Mock: Get ${collection}/${docId}`);
    return null;
};

const updateDocument = async (collection, docId, data) => {
    if (isFirestoreConnected && db) {
        await db.collection(collection).doc(docId).update(data);
        return true;
    }
    console.log(`Mock: Update ${collection}/${docId}`, data);
    return true;
};

const deleteDocument = async (collection, docId) => {
    if (isFirestoreConnected && db) {
        await db.collection(collection).doc(docId).delete();
        return true;
    }
    console.log(`Mock: Delete ${collection}/${docId}`);
    return true;
};

// MySQL pool compatibility
const pool = {
    query: async (sql, params) => {
        console.log('Mock SQL Query:', sql, params);
        return { rows: [], insertId: 1 };
    },
    execute: async (sql, params) => {
        console.log('Mock SQL Execute:', sql, params);
        return [{ insertId: 1, affectedRows: 1 }];
    }
};

const connectToMongoDB = connectDB;
const getConnection = () => mongoose.connection;
const isConnected = () => isFirestoreConnected || isMongoConnected;

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
    pool,
    db: () => db
};
