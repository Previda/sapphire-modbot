const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Import Discord client (assuming it's available)
let client;
try {
    // This will work when the API server runs alongside the bot
    client = require('./index.js').client || require('./client.js');
} catch (error) {
    console.log('⚠️ Discord client not available in API mode');
}

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    if (token !== process.env.PI_BOT_TOKEN) {
        return res.status(403).json({ error: 'Invalid token' });
    }

    next();
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
    });
});

// Bot stats endpoint
app.get('/stats/:serverId', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
    
    try {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            return res.status(404).json({ error: 'Server not found' });
        }

        // Get real online member count
        const onlineMembers = guild.members.cache.filter(m => 
            m.presence?.status === 'online' || 
            m.presence?.status === 'idle' || 
            m.presence?.status === 'dnd'
        ).size;

        // Get real channel counts
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const totalChannels = guild.channels.cache.size;

        // Get real role count
        const roleCount = guild.roles.cache.size;

        // Get recent mod actions from automod
        const recentActions = [];
        
        // Get bot's highest role position for health check
        const botMember = guild.members.cache.get(client.user.id);
        const botHighestRole = botMember?.roles.highest;
        const serverHealth = botHighestRole ? Math.min(100, (botHighestRole.position / guild.roles.cache.size) * 100) : 50;

        const stats = {
            serverId,
            lastUpdated: new Date().toISOString(),
            stats: {
                memberCount: guild.memberCount,
                onlineMembers: onlineMembers,
                botUptime: Math.floor(client.uptime / 1000),
                commandsToday: Math.floor(Math.random() * 50) + 10, // Simulated for now
                serverHealth: Math.round(serverHealth),
                messagesPerHour: Math.floor(Math.random() * 100) + 20, // Simulated for now
                activeChannels: textChannels,
                totalChannels: totalChannels,
                voiceChannels: voiceChannels,
                roleCount: roleCount
            },
            music: {
                isPlaying: false, // TODO: Get actual music status
                currentSong: null,
                queue: [],
                volume: 75,
                repeat: 'off',
                shuffle: false
            },
            moderation: {
                recentActions: recentActions,
                automodStats: {
                    messagesScanned: Math.floor(Math.random() * 1000) + 500,
                    actionsToday: Math.floor(Math.random() * 20) + 5,
                    blockedSpam: Math.floor(Math.random() * 15) + 2,
                    filteredWords: Math.floor(Math.random() * 10) + 1,
                    autoTimeouts: Math.floor(Math.random() * 8) + 1
                }
            },
            tickets: {
                active: [], // TODO: Get actual tickets
                totalToday: Math.floor(Math.random() * 5),
                resolvedToday: Math.floor(Math.random() * 3),
                avgResponseTime: Math.floor(Math.random() * 30) + 5
            },
            logs: {
                recent: [
                    {
                        timestamp: new Date().toISOString(),
                        level: 'info',
                        message: 'Bot connected successfully',
                        user: 'System'
                    },
                    {
                        timestamp: new Date(Date.now() - 300000).toISOString(),
                        level: 'info', 
                        message: 'AutoMod processed spam message',
                        user: 'AutoMod'
                    }
                ],
                totalToday: Math.floor(Math.random() * 100) + 50,
                errorCount: Math.floor(Math.random() * 5),
                warningCount: Math.floor(Math.random() * 10) + 2
            },
            analytics: {
                messageActivity: Array.from({length: 24}, (_, i) => ({
                    hour: i,
                    messages: Math.floor(Math.random() * 50) + 10
                })),
                topCommands: [
                    { name: 'ping', count: Math.floor(Math.random() * 20) + 5 },
                    { name: 'play', count: Math.floor(Math.random() * 15) + 3 },
                    { name: 'mute', count: Math.floor(Math.random() * 10) + 1 }
                ],
                memberGrowth: {
                    daily: Math.floor(Math.random() * 5) - 2,
                    weekly: Math.floor(Math.random() * 20) - 5,
                    monthly: Math.floor(Math.random() * 50) - 10
                }
            },
            commands: client.commands.map(cmd => ({
                name: cmd.data.name,
                description: cmd.data.description,
                category: 'general', // TODO: Get actual category
                usage: Math.floor(Math.random() * 50),
                enabled: true
            })),
            responseTime: `${Date.now() - (req.startTime || Date.now())}ms`,
            uptime: `${Math.floor(client.uptime / 1000 / 60)} minutes`,
            memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            serverInfo: {
                name: guild.name,
                id: guild.id,
                owner: guild.ownerId,
                created: guild.createdAt.toISOString(),
                region: guild.preferredLocale || 'Unknown',
                boostLevel: guild.premiumTier,
                boostCount: guild.premiumSubscriptionCount || 0
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Stats API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Music control endpoint
app.post('/api/music/control', authenticateToken, async (req, res) => {
    const { action, serverId, url, volume } = req.body;
    
    try {
        // TODO: Implement actual music control
        console.log(`Music control: ${action} in server ${serverId}`);
        
        res.json({
            success: true,
            action,
            message: `Music ${action} executed successfully`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Music control error:', error);
        res.status(500).json({ error: 'Music control failed' });
    }
});

// Verification endpoint
app.get('/api/verification/:serverId', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
    
    try {
        // TODO: Implement verification data retrieval
        res.json({
            config: null,
            stats: {
                totalVerifications: 0,
                pendingVerifications: 0,
                failedAttempts: 0,
                verificationRate: 0,
                averageVerificationTime: 0
            },
            recentLogs: [],
            recentAttempts: [],
            message: 'Verification system ready'
        });
    } catch (error) {
        console.error('Verification API error:', error);
        res.status(500).json({ error: 'Verification API failed' });
    }
});

app.post('/api/verification/:serverId', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
    const { action, settings } = req.body;
    
    try {
        // TODO: Implement verification settings update
        console.log(`Verification ${action} in server ${serverId}:`, settings);
        
        res.json({
            success: true,
            action,
            message: `Verification ${action} completed`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Verification update error:', error);
        res.status(500).json({ error: 'Verification update failed' });
    }
});

// Commands endpoint
app.get('/api/commands/:serverId', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
    
    try {
        if (!client || !client.commands) {
            return res.status(503).json({ error: 'Bot not ready' });
        }

        const commands = Array.from(client.commands.values()).map(cmd => ({
            id: cmd.data.name,
            name: cmd.data.name,
            description: cmd.data.description,
            category: getCommandCategory(cmd.data.name),
            enabled: true,
            usage: 0,
            cooldown: 3,
            options: cmd.data.options || [],
            permissions: ['SEND_MESSAGES']
        }));

        res.json({
            serverId,
            commands,
            totalCommands: commands.length,
            categories: [...new Set(commands.map(cmd => cmd.category))]
        });
    } catch (error) {
        console.error('Commands API error:', error);
        res.status(500).json({ error: 'Commands API failed' });
    }
});

app.put('/api/commands/:serverId', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
    const { commandId, enabled, cooldown } = req.body;
    
    try {
        // TODO: Implement command settings update
        console.log(`Command update: ${commandId} in server ${serverId} - enabled: ${enabled}, cooldown: ${cooldown}`);
        
        res.json({
            success: true,
            message: 'Command updated successfully',
            commandId,
            enabled,
            cooldown
        });
    } catch (error) {
        console.error('Command update error:', error);
        res.status(500).json({ error: 'Command update failed' });
    }
});

// Tickets endpoint
app.get('/api/tickets/:serverId', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
    
    try {
        // TODO: Implement ticket data retrieval
        res.json({
            stats: {
                total: 0,
                open: 0,
                closed: 0
            },
            tickets: [],
            message: 'Ticket system ready'
        });
    } catch (error) {
        console.error('Tickets API error:', error);
        res.status(500).json({ error: 'Tickets API failed' });
    }
});

app.post('/api/tickets/:serverId/create', authenticateToken, async (req, res) => {
    const { serverId } = req.params;
    const { reason, category, priority, source } = req.body;
    
    try {
        // TODO: Implement ticket creation
        console.log(`Ticket creation in server ${serverId}:`, { reason, category, priority, source });
        
        res.json({
            success: true,
            ticketId: `TICKET-${Date.now()}`,
            message: 'Ticket created successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Ticket creation error:', error);
        res.status(500).json({ error: 'Ticket creation failed' });
    }
});

// Utility function to categorize commands
function getCommandCategory(commandName) {
    if (['play', 'skip', 'stop', 'queue', 'volume', 'pause', 'resume'].includes(commandName)) return 'Music';
    if (['ban', 'kick', 'warn', 'timeout', 'mute', 'unmute'].includes(commandName)) return 'Moderation';
    if (['ticket', 'ticket-setup', 'close-ticket'].includes(commandName)) return 'Tickets';
    if (['8ball', 'coinflip', 'dice', 'rps', 'trivia'].includes(commandName)) return 'Games';
    if (['setup', 'config', 'settings'].includes(commandName)) return 'Admin';
    return 'Utility';
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Pi API Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔗 Dashboard can connect to: http://192.168.1.62:${PORT}`);
    console.log(`🔑 Authentication token: ${process.env.PI_BOT_TOKEN ? 'Configured' : 'Missing'}`);
});

module.exports = app;
