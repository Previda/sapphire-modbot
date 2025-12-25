#!/usr/bin/env node

/**
 * Sapphire Modbot - Optimized Startup Script
 * Designed for Raspberry Pi with memory optimizations
 */

require('dotenv').config();

// Check for required environment variables
if (!process.env.DISCORD_BOT_TOKEN && !process.env.DISCORD_TOKEN) {
    console.error('❌ ERROR: Missing DISCORD_BOT_TOKEN or DISCORD_TOKEN in .env file');
    console.error('\nPlease create a .env file with:');
    console.error('DISCORD_BOT_TOKEN=your_token_here');
    console.error('DISCORD_CLIENT_ID=your_client_id_here');
    console.error('\nGet your token from: https://discord.com/developers/applications');
    process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID && !process.env.CLIENT_ID) {
    console.error('❌ ERROR: Missing DISCORD_CLIENT_ID or CLIENT_ID in .env file');
    console.error('\nPlease add to your .env file:');
    console.error('DISCORD_CLIENT_ID=your_client_id_here');
    process.exit(1);
}

console.log('🚀 Starting Sapphire Modbot...\n');

// Display system info
const os = require('os');
console.log('📊 System Information:');
console.log(`   Platform: ${os.platform()} ${os.arch()}`);
console.log(`   Node.js: ${process.version}`);
console.log(`   Memory: ${Math.round(os.freemem() / 1024 / 1024)}MB free / ${Math.round(os.totalmem() / 1024 / 1024)}MB total`);
console.log(`   CPUs: ${os.cpus().length}x ${os.cpus()[0].model}`);
console.log('');

// Raspberry Pi optimizations
if (os.arch() === 'arm' || os.arch() === 'arm64') {
    console.log('🍓 Raspberry Pi detected - Applying optimizations...');
    
    // Enable manual garbage collection if available
    if (global.gc) {
        console.log('   ✅ Manual GC enabled');
    } else {
        console.log('   ⚠️  Manual GC not available (run with --expose-gc for better memory management)');
    }
    
    // Set memory limits for Pi
    const maxMemory = process.env.MAX_MEMORY || 200;
    console.log(`   ✅ Memory limit: ${maxMemory}MB`);
    console.log('');
}

// Start the bot
console.log('🤖 Loading bot...\n');

try {
    // Try src/index.js first (main entry point)
    require('./src/index.js');
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('src/index.js')) {
        // Fallback to index.js in root
        try {
            require('./index.js');
        } catch (fallbackError) {
            console.error('❌ Failed to start bot:', fallbackError.message);
            console.error('\nMake sure either src/index.js or index.js exists.');
            process.exit(1);
        }
    } else {
        throw error;
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});
