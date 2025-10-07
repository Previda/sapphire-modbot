#!/usr/bin/env node
/**
 * Sapphire Modbot Lightweight Starter
 * Optimized for Raspberry Pi with minimal resource usage
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load lightweight configuration
const config = require('./lightweight-config');

// Apply Node.js optimizations for Pi 2
process.env.NODE_ENV = 'production';
process.env.NODE_OPTIONS = '--max-old-space-size=200 --gc-interval=50 --optimize-for-size --max-semi-space-size=1';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    header: (msg) => {
        console.log(`\n${colors.cyan}${colors.bold}${'='.repeat(50)}`);
        console.log(`  ${msg}`);
        console.log(`${'='.repeat(50)}${colors.reset}\n`);
    }
};

// System resource monitoring
function monitorResources() {
    const used = process.memoryUsage();
    const memoryMB = Math.round(used.heapUsed / 1024 / 1024);
    
    if (memoryMB > parseInt(config.memory.maxHeapSize.replace('m', ''))) {
        log.warning(`High memory usage: ${memoryMB}MB`);
        
        if (config.monitoring.autoRestart && memoryMB > 180) { // Lower threshold for Pi 2
            log.error('Memory limit exceeded, restarting...');
            process.exit(1); // Let systemd restart the process
        }
    }
    
    // Force garbage collection periodically
    if (global.gc && Date.now() % config.memory.gcInterval < 1000) {
        global.gc();
    }
}

// Cleanup function
function cleanup() {
    if (config.cleanup.tempFileCleanup) {
        const tempDir = path.join(__dirname, 'temp');
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            const now = Date.now();
            
            files.forEach(file => {
                const filePath = path.join(tempDir, file);
                const stats = fs.statSync(filePath);
                
                if (now - stats.mtime.getTime() > config.cleanup.tempFileAge) {
                    fs.unlinkSync(filePath);
                }
            });
        }
    }
}

// Health check function
function healthCheck() {
    const health = {
        status: 'healthy',
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    };
    
    // Write health status to file for external monitoring
    fs.writeFileSync('/tmp/sapphire-health.json', JSON.stringify(health, null, 2));
    
    return health;
}

// Main startup function
function startBot() {
    log.header('🤖 Sapphire Modbot Lightweight Starter');
    
    // Check environment
    if (!process.env.DISCORD_TOKEN) {
        log.error('DISCORD_TOKEN not found in environment variables');
        log.info('Please create a .env file with your Discord bot token');
        process.exit(1);
    }
    
    if (!process.env.CLIENT_ID) {
        log.error('CLIENT_ID not found in environment variables');
        process.exit(1);
    }
    
    log.info('Environment variables validated');
    log.info(`Memory limit: ${config.memory.maxHeapSize}`);
    log.info(`Node.js version: ${process.version}`);
    log.info(`Platform: ${process.platform} ${process.arch}`);
    
    // Start resource monitoring
    setInterval(monitorResources, config.monitoring.interval);
    log.info('Resource monitoring started');
    
    // Start cleanup routine
    setInterval(cleanup, config.cleanup.cacheAge);
    log.info('Cleanup routine started');
    
    // Start health check
    setInterval(healthCheck, config.monitoring.healthCheckInterval);
    log.info('Health monitoring started');
    
    // Load and start the main bot
    log.info('Starting Sapphire Modbot...');
    
    try {
        // Clear require cache for fresh start
        delete require.cache[require.resolve('./index.js')];
        
        // Start the bot
        require('./index.js');
        
        log.success('Sapphire Modbot started successfully');
        
    } catch (error) {
        log.error(`Failed to start bot: ${error.message}`);
        process.exit(1);
    }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
    log.info('Received SIGINT, shutting down gracefully...');
    cleanup();
    process.exit(0);
});

process.on('SIGTERM', () => {
    log.info('Received SIGTERM, shutting down gracefully...');
    cleanup();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    log.error(`Uncaught Exception: ${error.message}`);
    cleanup();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Start the bot
if (require.main === module) {
    startBot();
}

module.exports = { startBot, healthCheck, cleanup };
