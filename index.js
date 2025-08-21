const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { pool } = require('./src/models/database');
const { initializeDatabase } = require('./src/models/init-database');
const { handleDMCommand } = require('./src/utils/dmHandler');
const { handleTicketMenu } = require('./src/utils/ticketMenu');
const BackupScheduler = require('./src/services/backupScheduler');
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
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// Initialize backup scheduler
const backupScheduler = new BackupScheduler(client);

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

// Bot ready event
client.once('ready', async () => {
    console.log(`🤖 ${client.user.tag} is online!`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    console.log(`⚡ Loaded ${client.commands.size} commands`);
    
    // Initialize database (non-blocking)
    console.log('🗄️ Initializing MySQL database connection...');
    initializeDatabase()
        .then(() => {
            console.log('✅ Database initialized successfully');
            // Start backup scheduler after database is ready
            backupScheduler.start();
            console.log('💾 Backup scheduler started');
        })
        .catch((error) => {
            console.log('❌ Database connection failed - bot running in limited mode');
            console.log('📝 Database features (tickets, notes, strikes) will be disabled');
            console.log('✅ All other commands will work normally');
            console.log('⚠️ Backup scheduler disabled due to database issues');
            
            // Provide specific help for DNS issues
            if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
                console.log('\n🔧 DNS Resolution Issue Detected:');
                console.log('💡 Quick fix: Run one of these commands:');
                console.log('   node fix-dns.js');
                console.log('   bash quick-fix.sh');
                console.log('   node fix-mysql.js');
                console.log('\n🌐 Or manually update DNS:');
                console.log('   sudo nano /etc/resolv.conf');
                console.log('   Add: nameserver 8.8.8.8');
            }
            
            console.log('\n🔄 Bot will continue running without database features');
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
                ephemeral: true 
            });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Command execution error:', error);
            const reply = { content: '❌ There was an error executing this command!', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    // Handle button interactions for ticket menu
    if (interaction.isButton()) {
        await handleTicketMenu(interaction);
    }

    // Handle modal submissions
    if (interaction.isModalSubmit()) {
        await handleTicketMenu(interaction);
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
