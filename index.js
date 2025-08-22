const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { initializeDatabase } = require('./src/models/database');
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
        const customId = interaction.customId;
        
        if (customId === 'close_ticket') {
            // Handle ticket close button
            const { getTicketByChannel, closeTicket } = require('./src/utils/ticketUtils');
            
            try {
                const ticket = await getTicketByChannel(interaction.channel.id);
                if (!ticket) {
                    return interaction.reply({ content: '❌ This is not an active ticket channel.', ephemeral: true });
                }
                
                await closeTicket(interaction.channel.id, interaction.user.id);
                
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setTitle('🔒 Ticket Closed')
                    .setDescription(`Ticket closed by ${interaction.user.tag}`)
                    .setColor(0xff0000)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
                
                // Delete channel after 10 seconds
                setTimeout(async () => {
                    try {
                        await interaction.channel.delete('Ticket closed');
                    } catch (error) {
                        console.error('Error deleting ticket channel:', error);
                    }
                }, 10000);
                
            } catch (error) {
                console.error('Error closing ticket:', error);
                await interaction.reply({ content: '❌ Failed to close ticket.', ephemeral: true });
            }
            
        } else if (customId === 'generate_transcript') {
            // Handle transcript generation
            try {
                await interaction.deferReply({ ephemeral: true });
                
                // Generate simple transcript
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const transcript = messages.reverse().map(m => 
                    `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`
                ).join('\n');
                
                // Save transcript to file
                const fs = require('fs').promises;
                const path = require('path');
                const transcriptDir = path.join(process.cwd(), 'data', 'transcripts');
                await fs.mkdir(transcriptDir, { recursive: true });
                
                const filename = `transcript-${interaction.channel.name}-${Date.now()}.txt`;
                const filepath = path.join(transcriptDir, filename);
                await fs.writeFile(filepath, transcript);
                
                await interaction.editReply({ content: `✅ Transcript saved as \`${filename}\`` });
                
            } catch (error) {
                console.error('Error generating transcript:', error);
                await interaction.editReply({ content: '❌ Failed to generate transcript.' });
            }
            
        } else {
            // Handle other ticket menu buttons
            const { handleTicketButtonInteraction } = require('./src/utils/ticketMenu');
            await handleTicketButtonInteraction(interaction);
        }
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
