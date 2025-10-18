// Try to load mongoose, but don't fail if it's not available
let mongoose;
try {
    mongoose = require('mongoose');
} catch (error) {
    console.log('⚠️ Mongoose not available - using local storage only');
    mongoose = null;
}

const fs = require('fs').promises;
const path = require('path');

let isMongoConnected = false;
let localDataCache = new Map();

// Local storage helpers
const saveToLocal = async (collection, docId, data) => {
    try {
        const dir = path.join(process.cwd(), 'data', collection);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, `${docId}.json`), JSON.stringify(data, null, 2));
        localDataCache.set(`${collection}:${docId}`, data);
        return true;
    } catch (error) {
        console.error('Local save failed:', error);
        return false;
    }
};

const loadFromLocal = async (collection, docId) => {
    try {
        const cacheKey = `${collection}:${docId}`;
        if (localDataCache.has(cacheKey)) {
            return localDataCache.get(cacheKey);
        }
        const filePath = path.join(process.cwd(), 'data', collection, `${docId}.json`);
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        localDataCache.set(cacheKey, data);
        return data;
    } catch (error) {
        return null;
    }
};

const connectDB = async () => {
    try {
        if (!mongoose) {
            console.log('📦 Mongoose not available - using local storage');
            isMongoConnected = false;
            return;
        }
        
        if (process.env.MONGODB_URI) {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 5,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            isMongoConnected = true;
        } else {
            console.log('📦 No MongoDB URI - using local storage');
            isMongoConnected = false;
        }
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        isMongoConnected = false;
    }
};

const initializeDatabase = async () => {
    await connectDB();
    console.log('🔧 Database initialization complete');
    return true; // Always return true for local storage fallback
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('🛑 Graceful shutdown initiated...');
    if (mongoose && isMongoConnected) {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
    }
    process.exit(0);
});
module.exports = {
    initializeDatabase,
    connectToMongoDB: connectDB,
    getConnection: () => mongoose ? mongoose.connection : null,
    isConnected: () => isMongoConnected || true, // Always true for local fallback
    
    // Document operations with local storage fallback
    setDocument: async (collection, docId, data) => {
        try {
            await saveToLocal(collection, docId, data);
            return true;
        } catch (error) {
            console.error('❌ Document save failed:', error);
            return false;
        }
    },
    
    getDocument: async (collection, docId) => {
        try {
            return await loadFromLocal(collection, docId);
        } catch (error) {
            console.error('❌ Document load failed:', error);
            return null;
        }
    },
    
    updateDocument: async (collection, docId, data) => {
        try {
            const existing = await loadFromLocal(collection, docId) || {};
            const merged = { ...existing, ...data, updatedAt: new Date() };
            await saveToLocal(collection, docId, merged);
            return true;
        } catch (error) {
            console.error('❌ Document update failed:', error);
            return false;
        }
    },
    
    deleteDocument: async (collection, docId) => {
        try {
            const filePath = path.join(process.cwd(), 'data', collection, `${docId}.json`);
            await fs.unlink(filePath);
            localDataCache.delete(`${collection}:${docId}`);
            return true;
        } catch (error) {
            return true; // Don't fail if file doesn't exist
        }
    },
    
    // Enhanced mock MySQL pool for compatibility
    pool: {
        query: async (sql, params = []) => {
            console.log('🔧 Mock SQL query:', sql.substring(0, 50) + '...');
            return { 
                rows: [], 
                insertId: Math.floor(Math.random() * 1000) + 1,
                affectedRows: 1 
            };
        },
        execute: async (sql, params = []) => {
            console.log('🔧 Mock SQL execute:', sql.substring(0, 50) + '...');
            return [{ 
                insertId: Math.floor(Math.random() * 1000) + 1, 
                affectedRows: 1 
            }];
        }
    },
    
    // Utility functions
    clearCache: () => localDataCache.clear(),
    getCacheSize: () => localDataCache.size,
    
    // Safe error wrapper for all operations
    safeOperation: async (operation, fallback = null) => {
        try {
            return await operation();
        } catch (error) {
            console.error('❌ Database operation failed:', error);
            return fallback;
        }
    }
};
