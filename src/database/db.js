const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Query helper function
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

// Get a client from the pool
async function getClient() {
  const client = await pool.getClient();
  const query = client.query;
  const release = client.release;
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('⚠️ A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    // Clear our timeout
    clearTimeout(timeout);
    // Set the methods back to their old un-monkey-patched version
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
}

// Initialize database tables
async function initDatabase() {
  console.log('🔧 Initializing database tables...');
  
  try {
    // Create moderation logs table
    await query(`
      CREATE TABLE IF NOT EXISTS moderation_logs (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(20) NOT NULL,
        user_id VARCHAR(20) NOT NULL,
        moderator_id VARCHAR(20) NOT NULL,
        action VARCHAR(50) NOT NULL,
        reason TEXT,
        duration BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        active BOOLEAN DEFAULT true
      );
    `);
    
    // Create user warnings table
    await query(`
      CREATE TABLE IF NOT EXISTS user_warnings (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(20) NOT NULL,
        user_id VARCHAR(20) NOT NULL,
        moderator_id VARCHAR(20) NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create server settings table
    await query(`
      CREATE TABLE IF NOT EXISTS server_settings (
        guild_id VARCHAR(20) PRIMARY KEY,
        prefix VARCHAR(10) DEFAULT '!',
        mod_log_channel VARCHAR(20),
        welcome_channel VARCHAR(20),
        auto_mod_enabled BOOLEAN DEFAULT false,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create appeal submissions table
    await query(`
      CREATE TABLE IF NOT EXISTS appeal_submissions (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(20) NOT NULL,
        user_id VARCHAR(20) NOT NULL,
        ban_reason TEXT,
        appeal_reason TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        reviewed_by VARCHAR(20),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create command usage stats table
    await query(`
      CREATE TABLE IF NOT EXISTS command_stats (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(20) NOT NULL,
        user_id VARCHAR(20) NOT NULL,
        command_name VARCHAR(50) NOT NULL,
        success BOOLEAN DEFAULT true,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_moderation_logs_guild ON moderation_logs(guild_id);
      CREATE INDEX IF NOT EXISTS idx_moderation_logs_user ON moderation_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_warnings_guild ON user_warnings(guild_id);
      CREATE INDEX IF NOT EXISTS idx_user_warnings_user ON user_warnings(user_id);
      CREATE INDEX IF NOT EXISTS idx_appeal_submissions_guild ON appeal_submissions(guild_id);
      CREATE INDEX IF NOT EXISTS idx_command_stats_guild ON command_stats(guild_id);
    `);
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Graceful shutdown
async function closePool() {
  await pool.end();
  console.log('👋 Database pool closed');
}

module.exports = {
  query,
  getClient,
  pool,
  initDatabase,
  closePool
};
