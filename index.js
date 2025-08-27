const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { initializeDatabase } = require('./src/models/database');
const { handleDMCommand } = require('./src/utils/dmHandler');
const { handleTicketMenu } = require('./src/utils/ticketMenu');
const BackupScheduler = require('./src/services/backupScheduler');
const { AutoModerationModule } = require('./src/modules/automod');
const XPSystem = require('./src/services/xpSystem');
const LoggingSystem = require('./src/services/loggingSystem');
const AutoModSystem = require('./src/services/autoModSystem');
const AntiRaidSystem = require('./src/utils/antiRaid');
const AntiNukeSystem = require('./src/utils/antiNuke');
const DashboardAPI = require('./src/api/dashboardAPI');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Security and error handling
process.on('uncaughtException', (error) => {
    console.error(' Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(' Unhandled Rejection at:', promise, 'reason:', reason);
});

// Memory limit protection
const MEMORY_LIMIT = parseInt(process.env.MAX_MEMORY) || 512; // MB
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

// Initialize modules
const backupScheduler = new BackupScheduler(client);
const autoMod = new AutoModerationModule();
let xpSystem, loggingSystem, autoModSystem, antiRaidSystem, antiNukeSystem, dashboardAPI;

const initializeServices = () => {
    xpSystem = new XPSystem(client);
    loggingSystem = new LoggingSystem(client);
    autoModSystem = new AutoModSystem(client);
    antiRaidSystem = new AntiRaidSystem(client);
    antiNukeSystem = new AntiNukeSystem(client);
    dashboardAPI = new DashboardAPI(client);
    
    console.log('✅ All modular systems initialized');
    console.log('🛡️ Anti-raid protection active');
    console.log('🚨 Anti-nuke protection active');
    
    // Start dashboard API
    dashboardAPI.start();
};

// Load commands recursively
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
                if (command.data && command.execute) {
                    client.commands.set(command.data.name, command);
                    console.log(`✅ Loaded command: ${command.data.name}`);
                }
            } catch (error) {
                console.error(`❌ Error loading command ${file}:`, error.message);
            }
        }
    }
}

// Load all commands
const commandsPath = path.join(__dirname, 'src', 'commands');
if (fs.existsSync(commandsPath)) {
    loadCommands(commandsPath);
}

// Bot ready event (updated for Discord.js v14+ compatibility)
client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} is online!`);
    
    // Initialize services after client is ready
    initializeServices();
    
    // Load additional modules
    loadModules();
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

// Global error handler for invalid commands
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        
        // Security: Rate limiting check
        if (isRateLimited(interaction.user.id, interaction.commandName)) {
            return interaction.reply({
                content: '⏱️ Please wait before using this command again.',
                ephemeral: true
            });
        }

        // Global invalid command handler
        if (!command) {
            console.log(`❌ Invalid command attempted: /${interaction.commandName} by ${interaction.user.tag}`);
            return interaction.reply({ 
                content: '❌ **Invalid command!** Use `/commands` to see all available commands.', 
                ephemeral: true 
            });
        }

        try {
            // Auto-defer for slow commands to prevent timeout
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ ephemeral: false });
            }
            
            await command.execute(interaction);
        } catch (error) {
            console.error('❌ Command execution error:', error);
            const reply = { 
                content: '❌ An error occurred while executing this command. Please try again later.', 
                ephemeral: true 
            };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    // Handle button interactions with error handling
    if (interaction.isButton()) {
        try {
            const customId = interaction.customId;
            
            // Ticket management buttons
            if (customId.startsWith('ticket_') || customId === 'confirm_close' || customId === 'cancel_close') {
                const { handleTicketButtonInteraction } = require('./src/utils/ticketMenu');
                await handleTicketButtonInteraction(interaction);
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
            const modalId = interaction.customId;
            
            // Ticket-related modals
            if (modalId.includes('ticket') || modalId.includes('user') || modalId.includes('slowmode')) {
                const { handleModalSubmit } = require('./src/utils/ticketMenu');
                await handleModalSubmit(interaction);
            }
        } catch (error) {
            console.error('❌ Modal submission error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred processing your submission.',
                    ephemeral: true
                });
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
            // Process through AutoMod with safety check
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

// Start the bot
client.login(process.env.DISCORD_TOKEN);
