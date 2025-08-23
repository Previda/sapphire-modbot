const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Firebase service account path
const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

let isConnected = false;
let db = null;

// Connect to Firebase/Firestore
async function connectToFirebase() {
    try {
        console.log('🔥 Connecting to Firebase/Firestore...');
        
        // Initialize Firebase Admin SDK
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath),
                databaseURL: 'https://previda-bot-default-rtdb.firebaseio.com'
            });
        }
        
        // Get Firestore database instance
        db = admin.firestore();
        
        // Test connection with a simple read
        await db.collection('health').doc('test').get();
        
        console.log('✅ Firebase/Firestore connected successfully!');
        isConnected = true;
        return db;
    } catch (error) {
        console.log('❌ Firebase connection failed:', error.message);
        console.log('💡 Using local storage fallback for data persistence');
        isConnected = false;
        throw error;
    }
}

// Initialize Firebase connection
async function initializeDatabase() {
    if (isConnected && db) return db;
    
    try {
        return await connectToFirebase();
    } catch (error) {
        console.error('❌ Failed to connect to Firebase:', error.message);
        console.log('🔧 Bot will continue with local JSON storage');
        isConnected = false;
        return null;
    }
}

// Health check function
async function checkDatabaseHealth() {
    try {
        if (!isConnected || !db) return false;
        
        // Simple health check by reading a document
        await db.collection('health').doc('check').get();
        return true;
    } catch (error) {
        console.log('❌ Database health check failed:', error.message);
        isConnected = false;
        return false;
    }
}

// Firestore helper functions
const FirestoreHelpers = {
    // Get document
    async getDoc(collection, docId) {
        if (!isConnected || !db) return null;
        const doc = await db.collection(collection).doc(docId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    // Set document
    async setDoc(collection, docId, data) {
        if (!isConnected || !db) return false;
        await db.collection(collection).doc(docId).set(data, { merge: true });
        return true;
    },

    // Update document
    async updateDoc(collection, docId, data) {
        if (!isConnected || !db) return false;
        await db.collection(collection).doc(docId).update(data);
        return true;
    },

    // Delete document
    async deleteDoc(collection, docId) {
        if (!isConnected || !db) return false;
        await db.collection(collection).doc(docId).delete();
        return true;
    },

    // Query collection
    async queryCollection(collection, limit = 100) {
        if (!isConnected || !db) return [];
        const snapshot = await db.collection(collection).limit(limit).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

module.exports = { 
    admin,
    initializeDatabase,
    checkDatabaseHealth,
    isConnected: () => isConnected,
    getFirestore: () => db,
    FirestoreHelpers
};
