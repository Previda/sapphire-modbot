const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0';

// Command storage file
const COMMANDS_FILE = path.join(__dirname, 'commands.json');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'User-Agent']
}));

app.use(express.json());

console.log('🚀 Starting Enhanced Skyfall API Server...');
console.log(`📍 Server will listen on ${HOST}:${PORT}`);

// Initialize commands data
let commandsData = {
    commands: [
        {
            id: 'ping',
            name: 'ping',
            description: 'Check bot latency and response time',
            category: 'utility',
            enabled: true,
            usageCount: 445,
            permissions: ['SEND_MESSAGES'],
            cooldown: 3,
            aliases: ['p', 'latency'],
            lastUsed: new Date(Date.now() - 300000).toISOString(),
            errorCount: 0,
            successRate: 100
        },
        {
            id: 'ban',
            name: 'ban',
            description: 'Ban members from the server with optional reason',
            category: 'moderation',
            enabled: true,
            usageCount: 23,
            permissions: ['BAN_MEMBERS'],
            cooldown: 5,
            aliases: ['b'],
            lastUsed: new Date(Date.now() - 3600000).toISOString(),
            errorCount: 1,
            successRate: 95.7
        },
        {
            id: 'kick',
            name: 'kick',
            description: 'Kick members from the server',
            category: 'moderation',
            enabled: true,
            usageCount: 12,
            permissions: ['KICK_MEMBERS'],
            cooldown: 3,
            aliases: ['k'],
            lastUsed: new Date(Date.now() - 7200000).toISOString(),
            errorCount: 0,
            successRate: 100
        },
        {
            id: 'mute',
            name: 'mute',
            description: 'Temporarily mute members',
            category: 'moderation',
            enabled: false,
            usageCount: 67,
            permissions: ['MANAGE_ROLES'],
            cooldown: 2,
            aliases: ['m', 'silence'],
            lastUsed: new Date(Date.now() - 86400000).toISOString(),
            errorCount: 3,
            successRate: 95.5
        },
        {
            id: 'appeal',
            name: 'appeal',
            description: 'Submit an appeal for moderation actions',
            category: 'moderation',
            enabled: true,
            usageCount: 34,
            permissions: ['SEND_MESSAGES'],
            cooldown: 300,
            aliases: ['request'],
            lastUsed: new Date(Date.now() - 1800000).toISOString(),
            errorCount: 2,
            successRate: 94.1
        },
        {
            id: 'verification',
            name: 'verification',
            description: 'Server verification system setup',
            category: 'utility',
            enabled: true,
            usageCount: 156,
            permissions: ['MANAGE_GUILD'],
            cooldown: 10,
            aliases: ['verify', 'v'],
            lastUsed: new Date(Date.now() - 900000).toISOString(),
            errorCount: 0,
            successRate: 100
        },
        {
            id: 'help',
            name: 'help',
            description: 'Display available commands and usage',
            category: 'utility',
            enabled: true,
            usageCount: 234,
            permissions: ['SEND_MESSAGES'],
            cooldown: 5,
            aliases: ['h', 'commands'],
            lastUsed: new Date(Date.now() - 120000).toISOString(),
            errorCount: 0,
            successRate: 100
        },
        {
            id: 'serverinfo',
            name: 'serverinfo',
            description: 'Display detailed server information',
            category: 'utility',
            enabled: true,
            usageCount: 78,
            permissions: ['SEND_MESSAGES'],
            cooldown: 15,
            aliases: ['si', 'info'],
            lastUsed: new Date(Date.now() - 1200000).toISOString(),
            errorCount: 1,
            successRate: 98.7
        }
    ]
};

// Load commands from file if exists
async function loadCommands() {
    try {
        const data = await fs.readFile(COMMANDS_FILE, 'utf8');
        commandsData = JSON.parse(data);
        console.log('✅ Loaded commands from file');
    } catch (error) {
        console.log('📝 Creating new commands file');
        await saveCommands();
    }
}

// Save commands to file
async function saveCommands() {
    try {
        await fs.writeFile(COMMANDS_FILE, JSON.stringify(commandsData, null, 2));
        console.log('💾 Commands saved to file');
    } catch (error) {
        console.error('❌ Error saving commands:', error);
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '2.0.0-enhanced'
    });
});

// Bot status
app.get('/api/status', (req, res) => {
    console.log('📊 Status endpoint called');
    res.json({
        success: true,
        status: 'online',
        uptime: process.uptime(),
        guilds: 5,
        users: 3988,
        timestamp: new Date().toISOString(),
        mode: 'ENHANCED_DISCORD_BOT',
        version: '2.0.0-enhanced',
        features: ['command_management', 'real_time_updates', 'professional_ui']
    });
});

// User profile
app.get('/api/user/profile', (req, res) => {
    console.log('👤 User profile endpoint called');
    res.json({
        success: true,
        user: {
            id: '987654321098765432',
            username: 'SkyfalBot Manager',
            discriminator: '0001',
            avatar: 'https://cdn.discordapp.com/avatars/987654321098765432/professional.png',
            guilds: [
                { id: '1158527215020544222', name: 'Skyfall | Softworks', permissions: 'ADMINISTRATOR', memberCount: 1250 },
                { id: '2158527215020544223', name: 'Development Hub', permissions: 'ADMINISTRATOR', memberCount: 45 },
                { id: '3158527215020544224', name: 'Community Center', permissions: 'ADMINISTRATOR', memberCount: 892 },
                { id: '4158527215020544225', name: 'Gaming Lounge', permissions: 'ADMINISTRATOR', memberCount: 567 },
                { id: '5158527215020544226', name: 'Support Server', permissions: 'ADMINISTRATOR', memberCount: 234 }
            ],
            isAuthenticated: true,
            role: 'Bot Administrator',
            lastLogin: new Date().toISOString(),
            permissions: ['MANAGE_COMMANDS', 'VIEW_ANALYTICS', 'MANAGE_APPEALS', 'VIEW_LOGS']
        }
    });
});

// Guilds endpoint
app.get('/api/guilds', (req, res) => {
    console.log('🏢 Guilds endpoint called');
    const guilds = [
        {
            id: '1158527215020544222',
            name: 'Skyfall | Softworks',
            members: 1250,
            commandsUsed: Math.floor(Math.random() * 200) + 1400,
            activeTickets: Math.floor(Math.random() * 5) + 10,
            status: 'online',
            icon: '🏢',
            botStatus: 'online',
            lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString()
        },
        {
            id: '2158527215020544223',
            name: 'Development Hub',
            members: 45,
            commandsUsed: Math.floor(Math.random() * 50) + 200,
            activeTickets: Math.floor(Math.random() * 3) + 1,
            status: 'online',
            icon: '⚙️',
            botStatus: 'online',
            lastActivity: new Date(Date.now() - Math.random() * 1800000).toISOString()
        },
        {
            id: '3158527215020544224',
            name: 'Community Center',
            members: 892,
            commandsUsed: Math.floor(Math.random() * 100) + 800,
            activeTickets: Math.floor(Math.random() * 8) + 5,
            status: 'online',
            icon: '🌟',
            botStatus: 'online',
            lastActivity: new Date(Date.now() - Math.random() * 900000).toISOString()
        },
        {
            id: '4158527215020544225',
            name: 'Gaming Lounge',
            members: 567,
            commandsUsed: Math.floor(Math.random() * 80) + 400,
            activeTickets: Math.floor(Math.random() * 3) + 1,
            status: 'online',
            icon: '🎮',
            botStatus: 'online',
            lastActivity: new Date(Date.now() - Math.random() * 2700000).toISOString()
        },
        {
            id: '5158527215020544226',
            name: 'Support Server',
            members: 234,
            commandsUsed: Math.floor(Math.random() * 30) + 100,
            activeTickets: Math.floor(Math.random() * 20) + 15,
            status: 'online',
            icon: '🎫',
            botStatus: 'online',
            lastActivity: new Date(Date.now() - Math.random() * 1200000).toISOString()
        }
    ];
    
    res.json({
        success: true,
        guilds: guilds,
        guildCount: guilds.length,
        totalUsers: guilds.reduce((sum, g) => sum + g.members, 0),
        realGuilds: guilds,
        botOnlineInAll: true
    });
});

// Commands management endpoint
app.get('/api/commands/manage', (req, res) => {
    console.log('⚡ Command management endpoint called');
    res.json({
        success: true,
        commands: commandsData.commands,
        totalCommands: commandsData.commands.length,
        enabledCommands: commandsData.commands.filter(cmd => cmd.enabled).length,
        disabledCommands: commandsData.commands.filter(cmd => !cmd.enabled).length,
        totalUsage: commandsData.commands.reduce((sum, cmd) => sum + cmd.usageCount, 0),
        averageSuccessRate: commandsData.commands.reduce((sum, cmd) => sum + cmd.successRate, 0) / commandsData.commands.length,
        mode: 'REAL_COMMAND_MANAGEMENT'
    });
});

// Update command endpoint
app.put('/api/commands/manage', async (req, res) => {
    console.log('🔧 Command update endpoint called');
    const { commandId, enabled, description, cooldown, permissions } = req.body;
    
    const commandIndex = commandsData.commands.findIndex(cmd => cmd.id === commandId);
    
    if (commandIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Command not found'
        });
    }
    
    // Update command
    if (enabled !== undefined) commandsData.commands[commandIndex].enabled = enabled;
    if (description) commandsData.commands[commandIndex].description = description;
    if (cooldown !== undefined) commandsData.commands[commandIndex].cooldown = cooldown;
    if (permissions) commandsData.commands[commandIndex].permissions = permissions;
    
    // Save to file
    await saveCommands();
    
    res.json({
        success: true,
        message: 'Command updated successfully',
        updatedCommand: commandsData.commands[commandIndex]
    });
});

// Regular commands endpoint (for compatibility)
app.get('/api/commands', (req, res) => {
    console.log('⚡ Commands endpoint called');
    res.json({
        success: true,
        commands: commandsData.commands,
        totalCommands: commandsData.commands.length,
        enabledCommands: commandsData.commands.filter(cmd => cmd.enabled).length
    });
});

// Appeals endpoint
app.get('/api/appeals', (req, res) => {
    console.log('📋 Appeals endpoint called');
    const appeals = [
        {
            id: 1,
            type: 'Ban',
            reason: 'I was wrongfully banned for spam. I was just sharing helpful resources with the community.',
            status: 'pending',
            userId: '123456789012345678',
            username: 'AppealUser123',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            serverId: '1158527215020544222',
            serverName: 'Skyfall | Softworks',
            moderator: 'ModeratorBot',
            evidence: 'Screenshots and chat logs available'
        },
        {
            id: 2,
            type: 'Mute',
            reason: 'The mute duration was too harsh for a minor offense. I apologize for my behavior.',
            status: 'approved',
            userId: '987654321098765432',
            username: 'ReformedUser456',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            serverId: '2158527215020544223',
            serverName: 'Development Hub',
            moderator: 'AdminUser',
            evidence: 'User showed genuine remorse'
        },
        {
            id: 3,
            type: 'Kick',
            reason: 'I was kicked by mistake during a mass moderation action.',
            status: 'reviewing',
            userId: '456789123456789123',
            username: 'InnocentUser789',
            createdAt: new Date(Date.now() - 43200000).toISOString(),
            serverId: '3158527215020544224',
            serverName: 'Community Center',
            moderator: 'AutoMod',
            evidence: 'Reviewing moderation logs'
        }
    ];
    
    res.json({
        success: true,
        appeals: appeals,
        totalAppeals: appeals.length,
        pendingAppeals: appeals.filter(appeal => appeal.status === 'pending').length,
        approvedAppeals: appeals.filter(appeal => appeal.status === 'approved').length,
        reviewingAppeals: appeals.filter(appeal => appeal.status === 'reviewing').length
    });
});

// Logs endpoint
app.get('/api/logs', (req, res) => {
    console.log('📝 Logs endpoint called');
    const logs = [
        {
            id: 1,
            action: 'Bot Started',
            user: 'System',
            message: 'Enhanced Skyfall bot API server came online with command management',
            type: 'info',
            timestamp: new Date().toISOString(),
            serverId: null,
            details: 'All systems operational'
        },
        {
            id: 2,
            action: 'Command Executed',
            user: 'User#1234',
            message: 'Successfully executed /ban command on user @spammer',
            type: 'moderation',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            serverId: '1158527215020544222',
            details: 'Reason: Repeated spam violations'
        },
        {
            id: 3,
            action: 'Appeal Submitted',
            user: 'AppealUser123',
            message: 'New ban appeal submitted for review',
            type: 'success',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            serverId: '1158527215020544222',
            details: 'Appeal ID: 1, Type: Ban'
        },
        {
            id: 4,
            action: 'Command Updated',
            user: 'BotManager',
            message: 'Disabled mute command for maintenance',
            type: 'warning',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            serverId: null,
            details: 'Command will be re-enabled after fixes'
        },
        {
            id: 5,
            action: 'User Verification',
            user: 'NewUser#5678',
            message: 'User completed server verification process',
            type: 'success',
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            serverId: '3158527215020544224',
            details: 'Verification method: Phone number'
        }
    ];
    
    res.json({
        success: true,
        logs: logs,
        totalLogs: logs.length,
        recentActivity: logs.slice(0, 3)
    });
});

// Catch all
app.get('*', (req, res) => {
    res.json({
        error: 'Endpoint not found',
        availableEndpoints: [
            '/health',
            '/api/status',
            '/api/user/profile',
            '/api/guilds',
            '/api/commands',
            '/api/commands/manage',
            '/api/appeals',
            '/api/logs'
        ],
        version: '2.0.0-enhanced'
    });
});

// Initialize and start server
async function startServer() {
    await loadCommands();
    
    app.listen(PORT, HOST, () => {
        console.log(`🌐 Enhanced API Server running on ${HOST}:${PORT}`);
        console.log(`✅ Skyfall Dashboard API ready with command management!`);
        console.log(`📊 Serving data for 5 Discord servers`);
        console.log(`🔗 External URL: http://192.168.1.62:${PORT}`);
        console.log(`🎯 Features: Command Management, Real-time Updates, Professional UI`);
    });
}

startServer();
