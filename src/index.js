const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const SimpleMusicSystem = require('./systems/simpleMusicSystem');
const AdvancedAutomod = require('./systems/advancedAutomod');
const DiscordSDKSystem = require('./systems/discordSDK');
const authManager = require('./utils/auth');

// Raspberry Pi 2 Optimization: Enable aggressive garbage collection
if (global.gc) {
    console.log('⚡ Manual GC enabled for Pi 2 optimization');
    setInterval(() => {
        if (global.gc) global.gc();
    }, 60000); // Run GC every minute
}

// Initialize Discord client with Pi 2 optimizations
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates
    ],
    // Pi 2 Optimizations
    makeCache: require('discord.js').Options.cacheWithLimits({
        MessageManager: 50,        // Limit message cache
        GuildMemberManager: 100,   // Limit member cache
        UserManager: 100,          // Limit user cache
        PresenceManager: 0,        // Disable presence cache (saves memory)
        ReactionManager: 0,        // Disable reaction cache
        GuildBanManager: 0,        // Disable ban cache
        ThreadManager: 25,         // Limit thread cache
        StageInstanceManager: 0,   // Disable stage instance cache
        VoiceStateManager: 25      // Limit voice state cache
    }),
    sweepers: {
        messages: {
            interval: 300,         // Sweep every 5 minutes
            lifetime: 900          // Keep messages for 15 minutes
        },
        users: {
            interval: 600,         // Sweep every 10 minutes
            filter: () => user => user.bot && user.id !== client.user.id
        }
    }
});

// Initialize Express server
const app = express();
app.use(cors());
app.use(express.json());

// Bot configuration
const config = {
    token: process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN',
    clientId: process.env.DISCORD_CLIENT_ID || '1358527215020544222',
    port: process.env.PORT || 3001
};

// Collections for commands and data
client.commands = new Collection();

// Initialize music system
client.musicSystem = new SimpleMusicSystem(client);

// Initialize advanced automod system
client.automod = new AdvancedAutomod(client);

// Initialize Discord SDK system
client.discordSDK = new DiscordSDKSystem(client);

const botData = {
    guilds: [],
    commands: [],
    logs: [],
    appeals: [],
    startTime: Date.now()
};

// Load commands recursively
const commandsPath = path.join(__dirname, 'commands');
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    botData.commands.push({
                        id: command.data.name,
                        name: command.data.name,
                        description: command.data.description,
                        category: command.category || path.basename(dir),
                        enabled: true,
                        usageCount: Math.floor(Math.random() * 100),
                        cooldown: command.cooldown || 0
                    });
                    console.log(`✅ Loaded command: ${command.data.name}`);
                }
            } catch (error) {
                console.error(`❌ Failed to load command ${file}:`, error.message);
            }
        }
    }
}

if (fs.existsSync(commandsPath)) {
    loadCommands(commandsPath);
    console.log(`📦 Loaded ${botData.commands.length} commands`);
}

// Default commands if no files found
if (botData.commands.length === 0) {
    botData.commands = [
        { id: 'ping', name: 'ping', description: 'Replies with Pong!', category: 'utility', enabled: true, usageCount: 156, cooldown: 0 },
        { id: 'ban', name: 'ban', description: 'Ban a user from the server', category: 'moderation', enabled: true, usageCount: 23, cooldown: 5 },
        { id: 'kick', name: 'kick', description: 'Kick a user from the server', category: 'moderation', enabled: true, usageCount: 45, cooldown: 3 },
        { id: 'mute', name: 'mute', description: 'Mute a user in the server', category: 'moderation', enabled: true, usageCount: 67, cooldown: 2 },
        { id: 'warn', name: 'warn', description: 'Warn a user for rule violations', category: 'moderation', enabled: true, usageCount: 89, cooldown: 1 },
        { id: 'purge', name: 'purge', description: 'Delete multiple messages at once', category: 'moderation', enabled: true, usageCount: 34, cooldown: 10 },
        { id: 'serverinfo', name: 'serverinfo', description: 'Display server information', category: 'utility', enabled: true, usageCount: 78, cooldown: 5 },
        { id: 'userinfo', name: 'userinfo', description: 'Display user information', category: 'utility', enabled: true, usageCount: 92, cooldown: 3 }
    ];
}

// Bot event handlers
client.once('ready', () => {
    console.log(`✅ Skyfall bot is online! Logged in as ${client.user.tag}`);
    console.log(`🏰 Serving ${client.guilds.cache.size} guilds`);
    console.log(`🌐 API Server running on port ${config.port}`);
    
    // Initialize advanced automod system
    client.automod.initialize();
    console.log(`🛡️ Advanced Auto-Moderation System active`);
    
    // Initialize Discord SDK system
    client.discordSDK.initialize();
    console.log(`🎮 Discord SDK System active`);
    
    // Update guild data
    updateGuildData();
    
    // Generate some sample logs
    generateSampleLogs();
});

client.on('guildCreate', (guild) => {
    console.log(`📥 Joined new guild: ${guild.name} (${guild.id})`);
    updateGuildData();
    addLog('system', 'Bot', `Joined guild: ${guild.name}`, 'system');
});

client.on('guildDelete', (guild) => {
    console.log(`📤 Left guild: ${guild.name} (${guild.id})`);
    updateGuildData();
    addLog('system', 'Bot', `Left guild: ${guild.name}`, 'system');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
        
        // Log command usage
        addLog('command', interaction.user.tag, `Used /${interaction.commandName}`, 'command');
        
        // Update usage count
        const cmd = botData.commands.find(c => c.name === interaction.commandName);
        if (cmd) cmd.usageCount++;
        
    } catch (error) {
        console.error('Command execution error:', error);
        addLog('error', 'System', `Command error: ${interaction.commandName}`, 'error');
    }
});

// Utility functions
function updateGuildData() {
    botData.guilds = client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        memberCount: guild.memberCount,
        onlineMembers: guild.members.cache.filter(member => member.presence?.status !== 'offline').size,
        botPermissions: guild.members.me?.permissions.toArray() || [],
        features: guild.features,
        region: guild.preferredLocale,
        verificationLevel: guild.verificationLevel,
        boostLevel: guild.premiumTier,
        boostCount: guild.premiumSubscriptionCount,
        isOwner: guild.ownerId === client.user.id,
        canManage: guild.members.me?.permissions.has('Administrator') || false,
        joinedAt: guild.joinedAt?.toISOString(),
        lastActivity: new Date().toISOString()
    }));
}

function addLog(action, user, details, type) {
    const log = {
        id: Date.now() + Math.random(),
        action,
        user,
        details,
        type,
        timestamp: new Date().toISOString(),
        guild: client.guilds.cache.first()?.name || 'Unknown'
    };
    
    botData.logs.unshift(log);
    
    // Keep only last 100 logs
    if (botData.logs.length > 100) {
        botData.logs = botData.logs.slice(0, 100);
    }
}

function generateSampleLogs() {
    const sampleLogs = [
        { action: 'Bot started', user: 'System', details: 'Skyfall bot successfully started and connected', type: 'system' },
        { action: 'User joined', user: 'NewMember#1234', details: 'New member joined the server', type: 'member' },
        { action: 'Message deleted', user: 'Moderator#5678', details: 'Deleted spam message in #general', type: 'moderation' },
        { action: 'User warned', user: 'Moderator#5678', details: 'Warned @BadUser#9999 for inappropriate language', type: 'moderation' },
        { action: 'Command used', user: 'User#1111', details: 'Used /ping command', type: 'command' }
    ];
    
    sampleLogs.forEach((log, index) => {
        setTimeout(() => addLog(log.action, log.user, log.details, log.type), index * 1000);
    });
}

// API Routes
app.get('/api/status', (req, res) => {
    const uptime = Math.floor((Date.now() - botData.startTime) / 1000);
    
    res.json({
        status: 'online',
        uptime: uptime,
        version: '2.0.0',
        guilds: client.guilds.cache.size,
        users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
        commands: botData.commands.length,
        ping: client.ws.ping,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/guilds', (req, res) => {
    res.json({
        success: true,
        guilds: botData.guilds,
        count: botData.guilds.length
    });
});

app.get('/api/commands/manage', (req, res) => {
    const { serverId } = req.query;
    
    // Filter commands by server if specified
    let commands = botData.commands;
    if (serverId) {
        // In a real implementation, you'd filter by server-specific settings
        commands = botData.commands.map(cmd => ({
            ...cmd,
            serverId: serverId
        }));
    }
    
    res.json({
        success: true,
        commands: commands,
        serverId: serverId || null
    });
});

app.put('/api/commands/manage', (req, res) => {
    const { commandId, enabled, description, cooldown } = req.body;
    
    const command = botData.commands.find(cmd => cmd.id === commandId);
    if (command) {
        if (typeof enabled === 'boolean') command.enabled = enabled;
        if (description) command.description = description;
        if (typeof cooldown === 'number') command.cooldown = cooldown;
        
        addLog('command_update', 'Admin', `Updated command: ${commandId}`, 'admin');
        
        res.json({
            success: true,
            command: command,
            message: 'Command updated successfully'
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Command not found'
        });
    }
});

app.get('/api/logs', (req, res) => {
    const { serverId, limit = 50 } = req.query;
    
    let logs = botData.logs;
    if (serverId) {
        logs = logs.filter(log => log.serverId === serverId);
    }
    
    res.json({
        success: true,
        logs: logs.slice(0, parseInt(limit)),
        total: logs.length,
        serverId: serverId || null
    });
});

app.get('/api/appeals', (req, res) => {
    const { serverId } = req.query;
    
    let appeals = botData.appeals;
    if (serverId) {
        appeals = appeals.filter(appeal => appeal.serverId === serverId);
    }
    
    res.json({
        success: true,
        appeals: appeals,
        serverId: serverId || null
    });
});

app.post('/api/appeals', (req, res) => {
    const { username, banReason, appealMessage, serverId } = req.body;
    
    const appeal = {
        id: Date.now(),
        username,
        banReason,
        appealMessage,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        serverId: serverId || null
    };
    
    botData.appeals.push(appeal);
    addLog('appeal_submitted', username, `Submitted ban appeal`, 'appeal');
    
    res.json({
        success: true,
        appeal: appeal,
        message: 'Appeal submitted successfully'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// Start the server with error handling
const server = app.listen(config.port, () => {
    console.log(`🌐 Skyfall API server running on port ${config.port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.port} is already in use!`);
        console.log('💡 Solutions:');
        console.log(`   1. Stop the other process using port ${config.port}`);
        console.log(`   2. Change the port in your .env file (PORT=3002)`);
        console.log(`   3. Kill the process: lsof -ti:${config.port} | xargs kill -9`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
        process.exit(1);
    }
});

// Login to Discord with enhanced authentication
(async () => {
    const loginResult = await authManager.login(client);
    
    if (!loginResult.success) {
        console.error('\n' + '='.repeat(70));
        console.error('❌ AUTHENTICATION FAILED');
        console.error('='.repeat(70));
        console.error(`\nError: ${loginResult.error}`);
        if (loginResult.details) {
            console.error(`Details: ${loginResult.details}`);
        }
        if (loginResult.help) {
            console.error(loginResult.help);
        }
        console.error('='.repeat(70) + '\n');
        server.close();
        process.exit(1);
    }
    
    console.log(loginResult.message);
})();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down Skyfall bot...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Shutting down Skyfall bot...');
    client.destroy();
    process.exit(0);
});
