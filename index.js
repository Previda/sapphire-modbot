const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { initializeDatabase } = require('./src/models/database');
const { handleDMCommand } = require('./src/utils/dmHandler');
const { handleTicketMenu } = require('./src/utils/ticketMenu');
const BackupScheduler = require('./src/services/backupScheduler');
const { AutoModerationModule } = require('./src/modules/automod');
const { XPSystem } = require('./src/modules/xpSystem');
const { LoggingModule } = require('./src/modules/logging');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration
    ]
});

client.commands = new Collection();

// Initialize modules
const backupScheduler = new BackupScheduler(client);
const autoMod = new AutoModerationModule();
const xpSystem = new XPSystem();
const logger = new LoggingModule();

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
client.once('clientReady', async () => {
    console.log(`🤖 ${client.user.tag} is online!`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    console.log(`⚡ Loaded ${client.commands.size} commands`);
    
    // Initialize database (non-blocking)
    console.log('🗄️ Initializing MongoDB database connection...');
    initializeDatabase()
        .then(() => {
            console.log('✅ Database initialized successfully');
            // Start backup scheduler after database is ready
            backupScheduler.start();
            console.log('💾 Backup scheduler started');
        })
        .catch(error => {
            console.error('❌ Database connection failed:', error.message);
            console.log('💡 Bot will continue with local JSON storage for data persistence');
            console.log('🔧 To use MongoDB, set MONGODB_URI in your .env file');
        });
});

// Global error handler for invalid commands
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        
        // Global invalid command handler
        if (!command) {
            console.log(`❌ Invalid command attempted: /${interaction.commandName} by ${interaction.user.tag}`);
            return interaction.reply({ 
                content: '❌ **Invalid command!** Use `/commands` to see all available commands.', 
                flags: 64 
            });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Command execution error:', error);
            const reply = { content: '❌ There was an error executing this command!', flags: 64 };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    // Handle button interactions
    if (interaction.isButton()) {
        const customId = interaction.customId;
        
        // Ticket management buttons from /manage command
        if (customId.startsWith('ticket_') || customId === 'confirm_close' || customId === 'cancel_close') {
            const { handleTicketButtons } = require('./src/utils/ticketButtons');
            await handleTicketButtons(interaction);
        }
        // General ticket menu buttons (open/close tickets)
        else {
            const { ticketMenu } = require('./src/utils/ticketMenu');
            await ticketMenu(interaction);
        }
    }
    
    // Handle modal submissions
    if (interaction.isModalSubmit()) {
        const modalId = interaction.customId;
        
        // Appeal modal submissions
        if (modalId.startsWith('appeal_modal_')) {
            const { handleAppealModal } = require('./src/utils/appealHandler');
            await handleAppealModal(interaction);
        }
        // Ticket management modals
        else if (modalId.includes('ticket') || modalId.includes('user') || modalId.includes('slowmode')) {
            const { handleTicketModals } = require('./src/utils/ticketModals');
            await handleTicketModals(interaction);
        }
        // Other modal handlers
        else {
            const { ticketMenu } = require('./src/utils/ticketMenu');
            await ticketMenu(interaction);
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
    
    // Process message through modules (guild messages only)
    if (message.guild) {
        // Process through AutoMod
        await autoMod.processMessage(message);
        
        // Process through XP system
        await xpSystem.processMessage(message);
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

// Global error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

// Start the bot
client.login(process.env.DISCORD_TOKEN);
