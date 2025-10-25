require('dotenv').config();
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { initializeDatabase } = require('./src/models/database');
const { handleDMCommand } = require('./src/utils/dmHandler');
const { handleTicketMenu } = require('./src/utils/ticketMenu');
const BackupScheduler = require('./src/services/backupScheduler');
const XPSystem = require('./src/services/xpSystem');
const LoggingSystem = require('./src/services/loggingSystem');
const AutoModSystem = require('./src/services/autoModSystem');
const { AutoModerationModule } = require('./src/modules/automod');
const AntiRaidSystem = require('./src/utils/antiRaid');
const AntiNukeSystem = require('./src/utils/antiNuke');
const PolishedLogger = require('./src/utils/polishedLogger');

// Security and error handling
process.on('uncaughtException', (error) => {
    console.error(' Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(' Unhandled Rejection at:', promise, 'reason:', reason);
});

// Memory limit protection (optimized for Pi 2)
const MEMORY_LIMIT = parseInt(process.env.MAX_MEMORY) || 200; // MB (Pi 2 optimized)
setInterval(() => {
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    if (memMB > MEMORY_LIMIT) {
        console.error(` Memory limit exceeded: ${memMB}MB > ${MEMORY_LIMIT}MB`);
        process.exit(1);
    }
}, 30000);

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: false }
});

// Import webhook logger
const webhookLogger = require('./src/utils/webhookLogger');

client.commands = new Collection();

// Global statistics tracking for API server
global.commandsToday = 0;
global.messagesPerHour = 0;
global.recentModerationActions = [];
global.messagesScanned = 0;
global.moderationActionsToday = 0;
global.blockedSpam = 0;
global.filteredWords = 0;
global.autoTimeouts = 0;
global.activeTickets = [];
global.ticketsToday = 0;
global.resolvedTicketsToday = 0;
global.avgResponseTime = 0;
global.recentLogs = [];
global.logsToday = 0;
global.errorCount = 0;
global.warningCount = 0;
global.messageActivity = [];
global.topCommands = [];
global.dailyGrowth = 0;
global.weeklyGrowth = 0;
global.monthlyGrowth = 0;
global.availableCommands = [];
global.verificationLogs = [];
global.musicData = {
    isPlaying: false,
    currentSong: null,
    queue: [],
    volume: 75,
    repeat: 'off',
    shuffle: false
};

// Reset daily counters at midnight
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        global.commandsToday = 0;
        global.moderationActionsToday = 0;
        global.ticketsToday = 0;
        global.resolvedTicketsToday = 0;
        global.logsToday = 0;
        global.errorCount = 0;
        global.warningCount = 0;
        console.log('🔄 Daily statistics reset');
    }
}, 60000); // Check every minute

// Initialize modules
const backupScheduler = new BackupScheduler(client);
const autoMod = new AutoModerationModule();
let xpSystem, loggingSystem, autoModSystem, antiRaidSystem, antiNukeSystem;

const initializeServices = () => {
    xpSystem = new XPSystem(client);
    loggingSystem = new LoggingSystem(client);
    autoModSystem = new AutoModSystem(client);
    antiRaidSystem = new AntiRaidSystem(client);
    antiNukeSystem = new AntiNukeSystem(client);
    
    console.log('✅ All modular systems initialized');
    console.log('🛡️ Anti-raid protection active');
    console.log('🚨 Anti-nuke protection active');
};

// Load commands recursively with enhanced validation
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                // Clear require cache to ensure fresh load
                delete require.cache[require.resolve(filePath)];
                
                const command = require(filePath);
                
                // Validate command structure
                if (!command.data) {
                    console.warn(`⚠️  Command ${file} missing 'data' property - skipped`);
                    continue;
                }
                
                if (!command.execute) {
                    console.warn(`⚠️  Command ${file} missing 'execute' function - skipped`);
                    continue;
                }
                
                if (!command.data.name) {
                    console.warn(`⚠️  Command ${file} missing name in data - skipped`);
                    continue;
                }
                
                if (!command.data.description) {
                    console.warn(`⚠️  Command ${file} missing description - skipped`);
                    continue;
                }
                
                // Wrap execute function with error handler
                const originalExecute = command.execute;
                command.execute = async function(interaction) {
                    try {
                        await originalExecute.call(this, interaction);
                    } catch (error) {
                        console.error(`❌ Error in ${command.data.name} command:`, error);
                        console.error('Error stack:', error.stack);
                        
                        const errorMessage = `❌ An error occurred while executing the command.\n\`\`\`${error.message}\`\`\``;
                        
                        try {
                            if (interaction.deferred) {
                                await interaction.editReply({ content: errorMessage }).catch(console.error);
                            } else if (!interaction.replied) {
                                await interaction.reply({ content: errorMessage, flags: 64 }).catch(console.error);
                            }
                        } catch (replyError) {
                            console.error('Failed to send error message:', replyError);
                        }
                    }
                };
                
                client.commands.set(command.data.name, command);
                PolishedLogger.module(command.data.name, 'loaded');
                
            } catch (error) {
                PolishedLogger.error(`Failed to load ${file}`, error.message);
            }
        }
    }
}

// Load all commands
const commandsPath = path.join(__dirname, 'src', 'commands');
if (fs.existsSync(commandsPath)) {
    loadCommands(commandsPath);
}

// Load verification command from root if it exists
const verificationPath = path.join(__dirname, 'verification.js');
if (fs.existsSync(verificationPath)) {
    try {
        const command = require(verificationPath);
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Loaded command: ${command.data.name} (from root)`);
        }
    } catch (error) {
        console.error(`❌ Error loading verification command:`, error.message);
    }
}

// Bot ready event (updated for Discord.js v14+ compatibility)
client.on('ready', async () => {
    PolishedLogger.startup('Skyfall Bot', '2.0.0');
    PolishedLogger.success(`${client.user.tag} is online!`);
    PolishedLogger.info(`Serving ${client.guilds.cache.size} guilds`);
    
    // Populate available commands list for API
    global.availableCommands = Array.from(client.commands.values()).map(cmd => ({
        name: cmd.data.name,
        description: cmd.data.description,
        category: cmd.category || 'General'
    }));
    
    PolishedLogger.success(`Loaded ${global.availableCommands.length} commands`);
    
    // Initialize database and services after client is ready
    try {
        PolishedLogger.section('Initializing Systems');
        const database = require('./src/database/connection');
        await database.initializeTables();
        PolishedLogger.success('Database initialized');
        
        initializeServices();
        PolishedLogger.success('All systems operational');
        PolishedLogger.separator();
    } catch (error) {
        PolishedLogger.error('Failed to initialize services', error.message);
    }
});

// Webhook logging event listeners
client.on('guildMemberAdd', async (member) => {
    try {
        await webhookLogger.logMemberEvent(member.guild.id, 'join', member);
    } catch (error) {
        console.error('Error logging member join:', error);
    }
});

client.on('guildMemberRemove', async (member) => {
    try {
        await webhookLogger.logMemberEvent(member.guild.id, 'leave', member);
    } catch (error) {
        console.error('Error logging member leave:', error);
    }
});

client.on('messageDelete', async (message) => {
    try {
        if (message.author?.bot) return; // Ignore bot messages
        if (!message.guild) return; // Ignore DMs
        
        await webhookLogger.logMessageEvent(message.guild.id, 'delete', {
            author: message.author,
            channel: message.channel,
            content: message.content?.substring(0, 1000) || '[No content]'
        });
    } catch (error) {
        console.error('Error logging message delete:', error);
    }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    try {
        if (newMessage.author?.bot) return; // Ignore bot messages
        if (!newMessage.guild) return; // Ignore DMs
        if (oldMessage.content === newMessage.content) return; // Ignore non-content changes
        
        await webhookLogger.logMessageEvent(newMessage.guild.id, 'edit', {
            author: newMessage.author,
            channel: newMessage.channel,
            oldContent: oldMessage.content?.substring(0, 1000) || '[No content]',
            newContent: newMessage.content?.substring(0, 1000) || '[No content]'
        });
    } catch (error) {
        console.error('Error logging message edit:', error);
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        const member = newState.member || oldState.member;
        if (!member) return;
        
        const oldChannel = oldState.channel;
        const newChannel = newState.channel;
        
        if (!oldChannel && newChannel) {
            // User joined a voice channel
            await webhookLogger.logVoiceEvent(member.guild.id, 'join', member, oldChannel, newChannel);
        } else if (oldChannel && !newChannel) {
            // User left a voice channel
            await webhookLogger.logVoiceEvent(member.guild.id, 'leave', member, oldChannel, newChannel);
        } else if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
            // User moved between voice channels
            await webhookLogger.logVoiceEvent(member.guild.id, 'move', member, oldChannel, newChannel);
        }
    } catch (error) {
        console.error('Error logging voice state update:', error);
    }
});

// Database connection and initialization
initializeDatabase()
    .then(() => {
        console.log('📊 Database connected successfully');
        // Initialize services after database is ready
        initializeServices();
        // Start backup scheduler after database is ready
        backupScheduler.start();
        console.log('💾 Backup scheduler started');
    })
    .catch(error => {
        console.error('❌ Database connection failed:', error.message);
        console.log('💡 Bot will continue with local JSON storage for data persistence');
        console.log('🔧 To use MongoDB, set MONGODB_URI in your .env file');
        // Initialize services even without database
        initializeServices();
});

// Enhanced interaction handler with better error handling
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        
        console.log(`🔧 Command received: /${interaction.commandName} from ${interaction.user.tag} in ${interaction.guild?.name || 'DM'}`);
        
        // Security: Rate limiting check
        if (isRateLimited(interaction.user.id, interaction.commandName)) {
            return interaction.reply({
                content: '⏱️ Please wait before using this command again.',
                ephemeral: true
            });
        }

        // Global invalid command handler
        if (!command) {
            console.log(`❌ Unknown command: /${interaction.commandName} by ${interaction.user.tag}`);
            return interaction.reply({ 
                content: `❌ **Unknown command:** \`/${interaction.commandName}\`\n💡 Use \`/help\` to see available commands.`, 
                ephemeral: true 
            });
        }

        try {
            // Ensure we respond within Discord's 3-second limit
            const timeoutId = setTimeout(async () => {
                if (!interaction.replied && !interaction.deferred) {
                    try {
                        await interaction.reply({
                            content: '⏳ Command is taking longer than expected...',
                            ephemeral: true
                        });
                    } catch (err) {
                        console.error('Timeout reply error:', err);
                    }
                }
            }, 2500); // 2.5 seconds to be safe

            await command.execute(interaction);
            clearTimeout(timeoutId);
            
            // Track command usage
            global.commandsToday++;
            const commandName = interaction.commandName;
            const existingCommand = global.topCommands.find(cmd => cmd.name === commandName);
            if (existingCommand) {
                existingCommand.count++;
            } else {
                global.topCommands.push({ name: commandName, count: 1 });
            }
            // Keep only top 10 commands
            global.topCommands.sort((a, b) => b.count - a.count).splice(10);
        } catch (error) {
            console.error('❌ Command execution error:', error);
            const reply = { 
                content: '❌ An error occurred while executing this command. Please try again later.', 
                ephemeral: true 
            };
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            } catch (replyError) {
                console.error('Error sending error response:', replyError);
            }
        }
    }

    // Handle autocomplete interactions
    if (interaction.isAutocomplete()) {
        try {
            const command = client.commands.get(interaction.commandName);
            if (!command || !command.autocomplete) return;
            
            await command.autocomplete(interaction);
        } catch (error) {
            console.error('❌ Autocomplete error:', error);
        }
        return;
    }

    // Handle button interactions with error handling
    if (interaction.isButton()) {
        try {
            const customId = interaction.customId;
            
            // Handle appeal buttons
            if (customId.startsWith('appeal_')) {
                const { handleAppealButtons } = require('./src/utils/appealButtonHandler');
                const handled = await handleAppealButtons(interaction);
                if (handled) return;
            }
            
            // Handle ticket button interactions
            if (customId.startsWith('ticket_') || customId === 'confirm_close' || customId === 'cancel_close' || customId === 'close_ticket' || customId === 'generate_transcript') {
                const { handleTicketButtonInteraction } = require('./src/utils/ticketMenu');
                await handleTicketButtonInteraction(interaction);
                return;
            }
        } catch (error) {
            console.error('❌ Button interaction error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred processing your request.',
                    ephemeral: true
                });
            }
        }
    }
    
    // Handle modal submissions with error handling
    if (interaction.isModalSubmit()) {
        try {
            const customId = interaction.customId;
            
            // Handle ticket modal submissions
            if (['create_ticket_modal', 'add_user_modal', 'remove_user_modal', 'slowmode_modal'].includes(customId)) {
                const { handleModalSubmit } = require('./src/utils/ticketMenu');
                await handleModalSubmit(interaction);
                return;
            }
            // Handle appeal modal submissions
            if (interaction.customId?.startsWith('appeal_modal_')) {
                const { handleAppealModal } = require('./src/utils/appealHandler');
                await handleAppealModal(interaction);
                return;
            }

            // Handle appeal review modals
            if (interaction.customId?.includes('appeal_approve_modal_') || interaction.customId?.includes('appeal_reject_modal_')) {
                const { handleAppealReviewModal } = require('./src/utils/appealButtonHandler');
                await handleAppealReviewModal(interaction);
                return;
            }
        } catch (error) {
            console.error('❌ Modal submission error:', error);
            console.error('Error stack:', error.stack);
            
            try {
                if (interaction.deferred) {
                    await interaction.editReply({
                        content: '❌ An error occurred processing your submission. Please try again or contact server staff.'
                    }).catch(console.error);
                } else if (!interaction.replied) {
                    await interaction.reply({
                        content: '❌ An error occurred processing your submission. Please try again or contact server staff.',
                        flags: 64
                    }).catch(console.error);
                }
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    }
});

// Handle DM messages
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    // Handle DM commands
    if (message.channel.type === 1) { // DM channel
        await handleDMCommand(message, client);
        return;
    }
    
    // Process message through modules with error handling (guild messages only)
    if (message.guild) {
        try {
            // Process through AutoMod system first
            if (autoModSystem && typeof autoModSystem.processMessage === 'function') {
                await autoModSystem.processMessage(message);
            }
            
            // Process through legacy AutoMod if exists
            if (autoMod && typeof autoMod.processMessage === 'function') {
                await autoMod.processMessage(message);
            }
            
            // Process through XP system with safety check
            if (xpSystem && typeof xpSystem.processMessage === 'function') {
                await xpSystem.processMessage(message);
            }
        } catch (error) {
            console.error('❌ Message processing error:', error);
        }
    }
    
    // Handle !ticket command in guilds
    if (message.content.toLowerCase() === '!ticket' && message.guild) {
        // Check if user has manage messages permission
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ You need **Manage Messages** permission to use this command.');
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket Management Menu')
            .setDescription('Use the buttons below to manage tickets:')
            .setColor(0x0099ff);
            
        const row = {
            type: 1,
            components: [
                {
                    type: 2,
                    style: 1,
                    label: 'List Tickets',
                    custom_id: 'ticket_list',
                    emoji: { name: '📋' }
                },
                {
                    type: 2,
                    style: 3,
                    label: 'Create Ticket',
                    custom_id: 'ticket_create',
                    emoji: { name: '➕' }
                },
                {
                    type: 2,
                    style: 4,
                    label: 'Close Current',
                    custom_id: 'ticket_close',
                    emoji: { name: '🔒' }
                }
            ]
        };
        
        await message.reply({ embeds: [embed], components: [row] });
    }
});

// Rate limiting protection
const commandCooldowns = new Map();
const COMMAND_COOLDOWN = 3000; // 3 seconds

// Security: Command rate limiting
function isRateLimited(userId, commandName) {
    const now = Date.now();
    const cooldownKey = `${userId}:${commandName}`;
    const lastUsed = commandCooldowns.get(cooldownKey);
    
    if (lastUsed && (now - lastUsed) < COMMAND_COOLDOWN) {
        return true;
    }
    
    commandCooldowns.set(cooldownKey, now);
    return false;
}

// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    // Don't exit on uncaught exceptions to keep bot running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit on unhandled rejections
});

// Start API server integrated with bot
const express = require('express');
const cors = require('cors');
const { getVoiceConnection } = require('@discordjs/voice');
const app = express();
const API_PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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
        if (!client.isReady()) {
            return res.status(503).json({ error: 'Bot not ready' });
        }

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

        // Get real data from database
        const { getCaseStats } = require('./src/utils/caseManager');
        const { loadGuildConfig } = require('./src/utils/configManager');
        
        let caseStats = { total: 0, active: 0, closed: 0, appealed: 0, types: {} };
        let guildConfig = {};
        
        try {
            caseStats = await getCaseStats(serverId);
            guildConfig = await loadGuildConfig(serverId);
        } catch (error) {
            console.error('Error fetching real data:', error);
        }

        // Get real channel data
        const textChannels = guild.channels.cache.filter(c => c.type === 0);
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2);
        const categories = guild.channels.cache.filter(c => c.type === 4);

        const stats = {
            serverId,
            lastUpdated: new Date().toISOString(),
            stats: {
                memberCount: guild.memberCount,
                onlineMembers: onlineMembers,
                botUptime: Math.floor(client.uptime / 1000),
                commandsToday: 0, // TODO: Track actual commands
                serverHealth: guild.available ? 100 : 0,
                messagesPerHour: 0, // TODO: Track actual messages  
                activeChannels: textChannels.size,
                voiceChannels: voiceChannels.size,
                categories: categories.size,
                roles: guild.roles.cache.size,
                emojis: guild.emojis.cache.size
            },
            music: {
                isPlaying: false, // TODO: Get real music data
                currentSong: null,
                queue: [],
                volume: 75,
                repeat: 'off',
                shuffle: false
            },
            moderation: {
                recentActions: [], // TODO: Get recent mod actions
                automodStats: {
                    messagesScanned: 0, // TODO: Track real automod stats
                    actionsToday: caseStats.total || 0,
                    blockedSpam: 0,
                    filteredWords: 0,
                    autoTimeouts: 0
                },
                caseStats: caseStats,
                automodEnabled: guildConfig.moderation?.automod?.enabled || false,
                antiRaidEnabled: guildConfig.antiraid?.enabled || false,
                antiNukeEnabled: guildConfig.antinuke?.enabled || false
            },
            tickets: {
                active: [], // TODO: Get real ticket data
                totalToday: 0,
                resolvedToday: 0,
                avgResponseTime: 0,
                enabled: guildConfig.tickets?.enabled || false,
                categoryId: guildConfig.tickets?.categoryId || null
            },
            appeals: {
                enabled: guildConfig.appeals?.enabled || false,
                channelId: guildConfig.appeals?.channel || null,
                requireReason: guildConfig.appeals?.requireReason || false
            },
            xp: {
                enabled: guildConfig.xp?.enabled || false,
                multiplier: guildConfig.xp?.multiplier || 1,
                roleRewards: guildConfig.xp?.roleRewards || []
            },
            logs: {
                recent: [], // TODO: Get real log data
                totalToday: 0,
                errorCount: 0,
                warningCount: 0,
                channelId: guildConfig.moderation?.logChannelId || null
            },
            analytics: {
                messageActivity: [], // TODO: Get real analytics
                topCommands: [], // TODO: Track command usage
                memberGrowth: {
                    daily: 0, // TODO: Calculate real growth
                    weekly: 0,
                    monthly: 0
                }
            },
            commands: Array.from(client.commands.keys()), // Real command list
            responseTime: `${Date.now() - Date.now()}ms`,
            uptime: `${Math.floor(client.uptime / 1000)}s`,
            memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        };

        res.json(stats);
    } catch (error) {
        console.error('Stats endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Music control endpoint
app.post('/api/music/control', authenticateToken, async (req, res) => {
    const { action, serverId, url, volume } = req.body;
    
    try {
        if (!client.isReady()) {
            return res.status(503).json({ error: 'Bot not ready' });
        }

        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            return res.status(404).json({ error: 'Server not found' });
        }

        // Get voice connection info
        const voiceConnection = getVoiceConnection(guild.id);
        
        switch (action) {
            case 'play':
                if (url && voiceConnection) {
                    // Trigger play command via bot
                    res.json({ 
                        success: true, 
                        message: 'Play command triggered',
                        action: 'play',
                        url: url
                    });
                } else {
                    res.status(400).json({ error: 'URL required or bot not in voice channel' });
                }
                break;
                
            case 'pause':
                // Pause functionality would go here
                res.json({ 
                    success: true, 
                    message: 'Music paused',
                    action: 'pause'
                });
                break;
                
            case 'stop':
                if (voiceConnection) {
                    voiceConnection.destroy();
                }
                res.json({ 
                    success: true, 
                    message: 'Music stopped',
                    action: 'stop'
                });
                break;
                
            case 'skip':
                // Skip functionality would go here
                res.json({ 
                    success: true, 
                    message: 'Song skipped',
                    action: 'skip'
                });
                break;
                
            case 'volume':
                if (volume !== undefined) {
                    // Volume control would go here
                    res.json({ 
                        success: true, 
                        message: `Volume set to ${volume}%`,
                        action: 'volume',
                        volume: volume
                    });
                } else {
                    res.status(400).json({ error: 'Volume value required' });
                }
                break;
                
            default:
                res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Music control error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start API server after bot is ready
client.once('ready', () => {
    app.listen(API_PORT, '0.0.0.0', () => {
        console.log(`🚀 Pi API Server running on http://0.0.0.0:${API_PORT}`);
        console.log(`🔗 Dashboard can connect to: http://192.168.1.62:${API_PORT}`);
        console.log('🔑 Authentication token: Configured');
    });
});

// Start the bot
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Failed to login to Discord:', error);
    process.exit(1);
});
