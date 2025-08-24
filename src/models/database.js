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
