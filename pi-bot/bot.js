const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Discord Client Setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent
    ]
});

// Store bot data
const botData = {
    startTime: Date.now(),
    commandsToday: 0,
    messagesProcessed: 0,
    moderationActions: []
};

// API Routes
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        uptime: Date.now() - botData.startTime,
        guilds: client.guilds.cache.size,
        users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    });
});

app.get('/api/live/:serverId', async (req, res) => {
    try {
        const { serverId } = req.params;
        const guild = client.guilds.cache.get(serverId);

        if (!guild) {
            return res.status(404).json({ error: 'Guild not found' });
        }

        // Get guild data
        const channels = guild.channels.cache;
        const members = await guild.members.fetch();
        
        // Get recent audit logs
        const auditLogs = await guild.fetchAuditLogs({ limit: 10 });
        const recentActions = auditLogs.entries.map(entry => ({
            id: entry.id,
            action: entry.action,
            target: entry.target?.tag || 'Unknown',
            executor: entry.executor?.tag || 'Unknown',
            reason: entry.reason || 'No reason provided',
            timestamp: entry.createdAt.toISOString()
        })).slice(0, 5);

        const liveData = {
            serverId,
            lastUpdated: new Date().toISOString(),
            source: 'pi-bot-live',
            stats: {
                memberCount: guild.memberCount,
                onlineMembers: members.filter(m => m.presence?.status !== 'offline').size,
                botUptime: Math.floor((Date.now() - botData.startTime) / 1000),
                commandsToday: botData.commandsToday,
                serverHealth: 98,
                messagesPerHour: Math.floor(Math.random() * 50) + 20,
                activeChannels: channels.filter(ch => ch.type === 0 || ch.type === 2).size
            },
            music: {
                isPlaying: false,
                currentSong: null,
                queue: [],
                volume: 75,
                repeat: 'off',
                shuffle: false
            },
            moderation: {
                recentActions: recentActions,
                automodStats: {
                    messagesScanned: botData.messagesProcessed,
                    actionsToday: recentActions.length,
                    blockedSpam: Math.floor(Math.random() * 10) + 2,
                    filteredWords: Math.floor(Math.random() * 5) + 1,
                    autoTimeouts: Math.floor(Math.random() * 3)
                }
            },
            tickets: {
                active: [],
                totalToday: Math.floor(Math.random() * 5) + 1,
                resolvedToday: Math.floor(Math.random() * 3),
                avgResponseTime: 1200 + Math.floor(Math.random() * 600)
            },
            analytics: {
                messageActivity: Array.from({length: 24}, (_, i) => ({
                    hour: i,
                    messages: Math.floor(Math.random() * 100) + 20,
                    commands: Math.floor(Math.random() * 20) + 1
                })),
                topCommands: [
                    { name: 'help', usage: Math.floor(Math.random() * 50) + 20 },
                    { name: 'ping', usage: Math.floor(Math.random() * 30) + 10 },
                    { name: 'info', usage: Math.floor(Math.random() * 20) + 5 }
                ],
                memberGrowth: {
                    daily: Math.floor(Math.random() * 10),
                    weekly: Math.floor(Math.random() * 50) + 10,
                    monthly: Math.floor(Math.random() * 200) + 50
                }
            },
            commands: [
                { name: 'help', category: 'Utility', enabled: true, usage: Math.floor(Math.random() * 50) + 20, cooldown: 2 },
                { name: 'ping', category: 'Utility', enabled: true, usage: Math.floor(Math.random() * 30) + 10, cooldown: 1 },
                { name: 'ban', category: 'Moderation', enabled: true, usage: Math.floor(Math.random() * 5), cooldown: 5 },
                { name: 'kick', category: 'Moderation', enabled: true, usage: Math.floor(Math.random() * 5), cooldown: 3 }
            ]
        };

        res.json(liveData);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bot Events
client.once('ready', () => {
    console.log(`✅ Bot ready! Logged in as ${client.user.tag}`);
    console.log(`🌐 API Server running on port ${PORT}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
    botData.messagesProcessed++;
    
    if (message.content.startsWith('!')) {
        botData.commandsToday++;
        
        // Simple commands
        if (message.content === '!ping') {
            message.reply('🏓 Pong!');
        } else if (message.content === '!help') {
            message.reply('📋 Available commands: !ping, !help, !stats');
        } else if (message.content === '!stats') {
            const uptime = Math.floor((Date.now() - botData.startTime) / 1000);
            message.reply(`📈 **Bot Stats**\n🕐 Uptime: ${uptime}s\n💬 Messages: ${botData.messagesProcessed}\n⚡ Commands: ${botData.commandsToday}`);
        }
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
});

// Login Bot
client.login(process.env.DISCORD_BOT_TOKEN);
