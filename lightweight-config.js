// Lightweight configuration for Sapphire Modbot
// This optimizes the bot for minimal resource usage on Raspberry Pi

module.exports = {
    // Memory optimization settings for Pi 2
    memory: {
        maxHeapSize: '200m',        // Maximum heap size (Pi 2 has only 1GB RAM)
        gcInterval: 15000,          // More frequent garbage collection (15 seconds)
        cacheLimit: 500,            // Reduced cached items
        logRetention: 50            // Fewer log entries to keep in memory
    },
    
    // Performance settings for Pi 2
    performance: {
        commandCooldown: 2000,      // Longer cooldown for slower CPU (2 seconds)
        maxConcurrentCommands: 2,   // Fewer concurrent commands for Pi 2
        enableCompression: true,    // Enable response compression
        enableCaching: true,        // Enable response caching
        cacheTimeout: 180000        // Shorter cache timeout (3 minutes)
    },
    
    // Discord client optimization
    discord: {
        intents: [
            'Guilds',
            'GuildMessages', 
            'MessageContent',
            'GuildMembers',
            'GuildVoiceStates'
        ],
        // Reduce presence updates to save bandwidth on Pi 2
        presence: {
            updateInterval: 600000,  // Update every 10 minutes (less frequent)
            activities: [{
                name: 'Sapphire Modbot | /help',
                type: 'LISTENING'
            }]
        },
        // Connection optimization for Pi 2
        ws: {
            compress: true,
            large_threshold: 25      // Lower threshold for Pi 2
        }
    },
    
    // API server optimization
    api: {
        port: process.env.API_PORT || 3001,
        maxRequestSize: '1mb',
        timeout: 30000,             // 30 second timeout
        rateLimit: {
            windowMs: 60000,        // 1 minute
            max: 100                // 100 requests per minute
        },
        cors: {
            credentials: true,
            optionsSuccessStatus: 200
        }
    },
    
    // Database optimization
    database: {
        connectionTimeout: 10000,
        maxConnections: 5,
        enableWAL: true,            // Write-Ahead Logging for SQLite
        enableForeignKeys: true,
        pragmas: {
            journal_mode: 'WAL',
            cache_size: 1000,
            temp_store: 'memory',
            synchronous: 'normal',
            mmap_size: 268435456    // 256MB
        }
    },
    
    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        maxFiles: 5,
        maxSize: '10m',
        enableConsole: true,
        enableFile: false,          // Disable file logging to save disk I/O
        enableWebhook: true
    },
    
    // Music system optimization for Pi 2
    music: {
        maxQueueSize: 25,           // Smaller queue for Pi 2
        audioQuality: 'low',        // Lower quality to reduce CPU/bandwidth usage
        enableCache: false,         // Disable audio caching to save storage
        timeout: 45000,             // Longer timeout for slower processing
        retryAttempts: 2,           // Fewer retries to save resources
        fallbackEnabled: true
    },
    
    // Verification system
    verification: {
        cacheTimeout: 600000,       // 10 minutes
        maxPendingVerifications: 100,
        cleanupInterval: 300000     // 5 minutes
    },
    
    // System monitoring for Pi 2
    monitoring: {
        enabled: true,
        interval: 120000,           // Check every 2 minutes (less frequent)
        memoryThreshold: 0.7,       // Alert at 70% memory usage (Pi 2 has less RAM)
        cpuThreshold: 0.6,          // Alert at 60% CPU usage (Pi 2 is slower)
        diskThreshold: 0.9,         // Alert at 90% disk usage
        autoRestart: true,          // Auto-restart on high resource usage
        healthCheckInterval: 60000  // Health check every minute (less frequent)
    },
    
    // Cleanup settings
    cleanup: {
        tempFileCleanup: true,
        tempFileAge: 3600000,       // 1 hour
        logCleanup: true,
        logAge: 604800000,          // 1 week
        cacheCleanup: true,
        cacheAge: 1800000           // 30 minutes
    }
};

// Apply memory optimizations for Pi 2
if (process.env.NODE_ENV === 'production') {
    // Set Node.js flags for Pi 2 memory management
    process.env.NODE_OPTIONS = '--max-old-space-size=200 --gc-interval=50';
    
    // Enable aggressive optimization for Pi 2
    process.env.NODE_OPTIONS += ' --optimize-for-size --max-semi-space-size=1';
    
    // Additional Pi 2 optimizations
    process.env.NODE_OPTIONS += ' --no-concurrent-recompilation --no-turbo-inlining';
}
