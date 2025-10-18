const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { handleCommand } = require('./handlers/commandHandler');
const { handleButtonInteraction } = require('./handlers/buttonHandler');
require('dotenv').config();

// Global error handlers to prevent crashes
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
    console.error('Stack:', error.stack);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    console.error('Stack:', error.stack);
});

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

// Load all commands
client.commands = new Collection();

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
                console.error(`❌ Error loading ${file}:`, error.message);
            }
        }
    }
}

// Load all commands from commands directory
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    loadCommands(commandsPath);
    console.log(`📋 Loaded ${client.commands.size} commands`);
}

// Bot configuration
const config = {
    token: process.env.DISCORD_BOT_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID || '1358527215020544222'
};

// All 60 commands
const allCommands = [
    // Moderation Commands (15)
    { id: 'ban', name: 'ban', description: 'Ban a user from the server', category: 'moderation', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'kick', name: 'kick', description: 'Kick a user from the server', category: 'moderation', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'mute', name: 'mute', description: 'Mute a user in the server', category: 'moderation', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'unmute', name: 'unmute', description: 'Unmute a user', category: 'moderation', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'warn', name: 'warn', description: 'Warn a user for rule violations', category: 'moderation', enabled: true, usageCount: 0, cooldown: 1 },
    { id: 'purge', name: 'purge', description: 'Delete multiple messages at once', category: 'moderation', enabled: true, usageCount: 0, cooldown: 10 },
    { id: 'slowmode', name: 'slowmode', description: 'Set channel slowmode', category: 'moderation', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'lock', name: 'lock', description: 'Lock a channel', category: 'moderation', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'unlock', name: 'unlock', description: 'Unlock a channel', category: 'moderation', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'timeout', name: 'timeout', description: 'Timeout a user', category: 'moderation', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'untimeout', name: 'untimeout', description: 'Remove timeout from user', category: 'moderation', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'warnings', name: 'warnings', description: 'View user warnings', category: 'moderation', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'clearwarnings', name: 'clearwarnings', description: 'Clear user warnings', category: 'moderation', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'softban', name: 'softban', description: 'Softban a user (ban and unban)', category: 'moderation', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'massban', name: 'massban', description: 'Ban multiple users', category: 'moderation', enabled: true, usageCount: 0, cooldown: 10 },
    
    // Utility Commands (15)
    { id: 'ping', name: 'ping', description: 'Check bot latency', category: 'utility', enabled: true, usageCount: 0, cooldown: 0 },
    { id: 'serverinfo', name: 'serverinfo', description: 'Display server information', category: 'utility', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'userinfo', name: 'userinfo', description: 'Display user information', category: 'utility', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'avatar', name: 'avatar', description: 'Get user avatar', category: 'utility', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'roleinfo', name: 'roleinfo', description: 'Get role information', category: 'utility', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'channelinfo', name: 'channelinfo', description: 'Get channel information', category: 'utility', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'botinfo', name: 'botinfo', description: 'Display bot information', category: 'utility', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'invite', name: 'invite', description: 'Get bot invite link', category: 'utility', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'help', name: 'help', description: 'Display help menu', category: 'utility', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'stats', name: 'stats', description: 'Display bot statistics', category: 'utility', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'uptime', name: 'uptime', description: 'Show bot uptime', category: 'utility', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'membercount', name: 'membercount', description: 'Show server member count', category: 'utility', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'roles', name: 'roles', description: 'List all server roles', category: 'utility', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'emojis', name: 'emojis', description: 'List all server emojis', category: 'utility', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'boosters', name: 'boosters', description: 'List server boosters', category: 'utility', enabled: true, usageCount: 0, cooldown: 5 },
    
    // Fun Commands (10)
    { id: '8ball', name: '8ball', description: 'Ask the magic 8ball', category: 'fun', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'meme', name: 'meme', description: 'Get a random meme', category: 'fun', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'joke', name: 'joke', description: 'Get a random joke', category: 'fun', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'coinflip', name: 'coinflip', description: 'Flip a coin', category: 'fun', enabled: true, usageCount: 0, cooldown: 1 },
    { id: 'dice', name: 'dice', description: 'Roll a dice', category: 'fun', enabled: true, usageCount: 0, cooldown: 1 },
    { id: 'poll', name: 'poll', description: 'Create a poll', category: 'fun', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'say', name: 'say', description: 'Make the bot say something', category: 'fun', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'embed', name: 'embed', description: 'Create an embed message', category: 'fun', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'ascii', name: 'ascii', description: 'Convert text to ASCII art', category: 'fun', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'reverse', name: 'reverse', description: 'Reverse text', category: 'fun', enabled: true, usageCount: 0, cooldown: 1 },
    
    // Admin Commands (10)
    { id: 'setnick', name: 'setnick', description: 'Set user nickname', category: 'admin', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'addrole', name: 'addrole', description: 'Add role to user', category: 'admin', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'removerole', name: 'removerole', description: 'Remove role from user', category: 'admin', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'createrole', name: 'createrole', description: 'Create a new role', category: 'admin', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'deleterole', name: 'deleterole', description: 'Delete a role', category: 'admin', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'announce', name: 'announce', description: 'Send an announcement', category: 'admin', enabled: true, usageCount: 0, cooldown: 10 },
    { id: 'setwelcome', name: 'setwelcome', description: 'Set welcome message', category: 'admin', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'setprefix', name: 'setprefix', description: 'Set bot prefix', category: 'admin', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'autorole', name: 'autorole', description: 'Setup auto role', category: 'admin', enabled: true, usageCount: 0, cooldown: 5 },
    { id: 'logging', name: 'logging', description: 'Setup logging channel', category: 'admin', enabled: true, usageCount: 0, cooldown: 5 },
    
    // Music Commands (10)
    { id: 'play', name: 'play', description: 'Play a song', category: 'music', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'pause', name: 'pause', description: 'Pause current song', category: 'music', enabled: true, usageCount: 0, cooldown: 1 },
    { id: 'resume', name: 'resume', description: 'Resume playback', category: 'music', enabled: true, usageCount: 0, cooldown: 1 },
    { id: 'skip', name: 'skip', description: 'Skip current song', category: 'music', enabled: true, usageCount: 0, cooldown: 1 },
    { id: 'stop', name: 'stop', description: 'Stop playback', category: 'music', enabled: true, usageCount: 0, cooldown: 1 },
    { id: 'queue', name: 'queue', description: 'Show music queue', category: 'music', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'nowplaying', name: 'nowplaying', description: 'Show current song', category: 'music', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'volume', name: 'volume', description: 'Set volume', category: 'music', enabled: true, usageCount: 0, cooldown: 2 },
    { id: 'shuffle', name: 'shuffle', description: 'Shuffle queue', category: 'music', enabled: true, usageCount: 0, cooldown: 3 },
    { id: 'loop', name: 'loop', description: 'Loop current song', category: 'music', enabled: true, usageCount: 0, cooldown: 2 }
];

// Bot ready event (using clientReady instead of deprecated 'ready')
client.once('clientReady', async (c) => {
    console.log(`✅ Discord bot online! Logged in as ${c.user.tag}`);
    console.log(`🏰 Serving ${c.guilds.cache.size} guilds`);
    console.log(`👥 Total users: ${c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`);
    console.log(`🎯 Bot is running in standalone mode (no website required)`);
});

// Import systems
const verification = require('./systems/verification');
const tickets = require('./systems/tickets');
const advancedTickets = require('./systems/advanced-tickets');
const appeals = require('./systems/appeals');
// TEMPORARILY DISABLED: Music system causes dependency issues
// const music = require('./systems/music');
const automod = require('./systems/automod');

// Handle slash commands and button interactions
client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            
            // If command file exists, execute it
            if (command) {
                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(`Error executing ${interaction.commandName}:`, error);
                    const reply = {
                        content: '❌ There was an error executing this command!',
                        flags: 64
                    };
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(reply);
                    } else {
                        await interaction.reply(reply);
                    }
                }
            }
            // Handle special system commands
            else if (interaction.commandName === 'verify') {
                await verification.setupVerification(interaction);
            } else if (interaction.commandName === 'ticket') {
                const subcommand = interaction.options.getSubcommand();
                if (subcommand === 'setup') {
                    await advancedTickets.setupTicketSystem(interaction);
                }
            } else if (interaction.commandName === 'appeal' && interaction.options.getSubcommand() === 'setup') {
                await appeals.setupAppealsSystem(interaction);
            } else if (['play', 'pause', 'resume', 'skip', 'stop', 'queue', 'nowplaying', 'volume', 'loop', 'shuffle'].includes(interaction.commandName)) {
                // Music commands - show helpful message
                const music = require('./systems/music-simple');
                await music[interaction.commandName](interaction);
            } else {
                // Fallback to command handler
                await handleCommand(interaction);
            }
            
            // Command executed successfully (no API logging needed)
            
        } else if (interaction.isButton()) {
            // Handle button interactions
            console.log(`🔘 Button clicked: ${interaction.customId} by ${interaction.user.tag}`);
            
            if (interaction.customId === 'verify_button') {
                await verification.handleVerificationButton(interaction);
            } 
            // Ticket panel buttons (from /panel command)
            else if (interaction.customId.startsWith('create_ticket_')) {
                const category = interaction.customId.replace('create_ticket_', '');
                console.log(`🎫 Creating ticket for category: ${category}`);
                await handleTicketCreation(interaction, category);
            }
            // Ticket management buttons (from /manage menu)
            else if (interaction.customId === 'ticket_list') {
                console.log('📋 Listing tickets');
                await handleTicketList(interaction);
            }
            else if (interaction.customId === 'ticket_create') {
                console.log('➕ Opening ticket creation modal');
                await handleTicketCreateModal(interaction);
            }
            else if (interaction.customId === 'ticket_close_menu') {
                console.log('🔒 Closing ticket');
                await handleTicketClose(interaction);
            }
            else if (interaction.customId === 'ticket_add_user') {
                await interaction.reply({ content: '👤 Use `/manage add @user` to add users to tickets.', ephemeral: true });
            }
            else if (interaction.customId === 'ticket_remove_user') {
                await interaction.reply({ content: '👤 Use `/manage remove @user` to remove users from tickets.', ephemeral: true });
            }
            else if (interaction.customId === 'ticket_slowmode') {
                await interaction.reply({ content: '⏱️ Use `/slowmode duration:10s` to set slowmode.', ephemeral: true });
            }
            else if (interaction.customId === 'ticket_transcript') {
                console.log('📄 Generating transcript');
                await handleTicketTranscript(interaction);
            }
            else if (interaction.customId === 'ticket_settings') {
                await interaction.reply({ content: '⚙️ Use `/setup tickets` to configure ticket settings.', ephemeral: true });
            }
            // Ticket control buttons (in ticket channels)
            else if (interaction.customId === 'ticket_close_button') {
                console.log('🔒 Closing ticket via button');
                await handleTicketClose(interaction);
            }
            else if (interaction.customId === 'ticket_transcript_button') {
                console.log('📄 Generating transcript via button');
                await handleTicketTranscript(interaction);
            }
            else if (interaction.customId === 'ticket_claim_button') {
                console.log('✋ Claiming ticket');
                await handleTicketClaim(interaction);
            }
            // Old ticket system buttons
            else if (interaction.customId.startsWith('ticket_claim_')) {
                const ticketId = interaction.customId.replace('ticket_claim_', '');
                await advancedTickets.claimTicket(interaction, ticketId);
            } else if (interaction.customId.startsWith('ticket_pause_')) {
                const ticketId = interaction.customId.replace('ticket_pause_', '');
                await advancedTickets.pauseTicket(interaction, ticketId);
            } else if (interaction.customId.startsWith('ticket_close_')) {
                const ticketId = interaction.customId.replace('ticket_close_', '');
                await advancedTickets.closeTicket(interaction, ticketId);
            } 
            // Appeal buttons
            else if (interaction.customId === 'appeal_submit') {
                await appeals.showAppealModal(interaction);
            } else if (interaction.customId.startsWith('appeal_start_')) {
                const appealCode = interaction.customId.replace('appeal_start_', '');
                console.log(`🎫 Appeal button clicked: ${appealCode}`);
                try {
                    await handleAppealStart(interaction, appealCode);
                } catch (error) {
                    console.error('❌ Appeal button error:', error);
                    console.error('Stack:', error.stack);
                    
                    const errorMsg = `❌ Failed to load appeal form: ${error.message}\n\nPlease try using the command instead:\n\`/appeal submit appeal_code:${appealCode}\``;
                    
                    if (interaction.replied || interaction.deferred) {
                        await interaction.editReply({ content: errorMsg }).catch(e => console.error('Edit reply failed:', e));
                    } else {
                        await interaction.reply({
                            content: errorMsg,
                            flags: 64
                        }).catch(e => console.error('Reply failed:', e));
                    }
                }
            } else if (interaction.customId.startsWith('appeal_approve_')) {
                const appealCode = interaction.customId.replace('appeal_approve_', '').replace('reason_', '');
                await handleAppealApprove(interaction, appealCode);
            } else if (interaction.customId.startsWith('appeal_reject_')) {
                const appealCode = interaction.customId.replace('appeal_reject_', '');
                await handleAppealReject(interaction, appealCode);
            } else if (interaction.customId.startsWith('appeal_skip_')) {
                await interaction.reply({ content: '⏭️ Appeal skipped.', flags: 64 });
            } else if (interaction.customId.startsWith('appeal_accept_')) {
                const appealId = interaction.customId.replace('appeal_accept_', '');
                await appeals.acceptAppeal(interaction, appealId);
            } else if (interaction.customId.startsWith('appeal_deny_')) {
                const appealId = interaction.customId.replace('appeal_deny_', '');
                await appeals.denyAppeal(interaction, appealId);
            }
        } else if (interaction.isModalSubmit()) {
            // Handle modal submissions
            if (interaction.customId === 'appeal_modal') {
                await appeals.handleAppealSubmission(interaction);
            }
            else if (interaction.customId === 'appeal_config_modal') {
                await handleAppealConfigModal(interaction);
            }
            else if (interaction.customId.startsWith('appeal_submit_')) {
                await handleAppealSubmit(interaction);
            }
            else if (interaction.customId === 'ticket_create_modal') {
                await handleTicketCreateSubmit(interaction);
            }
        } else if (interaction.isStringSelectMenu()) {
            // Handle select menu interactions
            if (interaction.customId === 'ticket_category') {
                const category = interaction.values[0];
                await advancedTickets.handleCategorySelection(interaction, category);
            }
        }
    } catch (error) {
        console.error('Interaction error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ An error occurred while processing this interaction.',
                flags: 64
            }).catch(() => {});
        }
    }
});

// Appeal start button handler
async function handleAppealStart(interaction, appealCode) {
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
    const appealLibrary = require('./utils/appealLibrary');
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
        console.log(`🎫 Appeal button clicked for code: ${appealCode}`);
        
        // Find the appeal
        const found = await appealLibrary.findAppealByCode(appealCode);
        if (!found) {
            console.log(`❌ Appeal not found: ${appealCode}`);
            return interaction.reply({
                content: '❌ Appeal code not found or expired.\n\nPlease use the command:\n`/appeal submit appeal_code:' + appealCode + '`',
                flags: 64
            });
        }
        
        const { appeal, guildId } = found;
        console.log(`✅ Found appeal: ${appealCode}, status: ${appeal.status}`);
        
        // Check if already submitted
        if (appeal.status !== 'pending') {
            console.log(`⚠️ Appeal already processed: ${appeal.status}`);
            return interaction.reply({
                content: `❌ This appeal has already been ${appeal.status}.\n\nCurrent status: **${appeal.status.toUpperCase()}**`,
                flags: 64
            });
        }
        
        // Load custom questions from config
        const APPEAL_CONFIG_PATH = path.join(process.cwd(), 'data', 'appeal-configs');
        let config;
        try {
            const configPath = path.join(APPEAL_CONFIG_PATH, `${guildId}.json`);
            const data = await fs.readFile(configPath, 'utf8');
            config = JSON.parse(data);
        } catch (error) {
            // Use default questions
            config = {
                questions: [
                    { id: 'reason', label: 'Why should this punishment be reversed?', placeholder: 'Explain your reasoning', required: true, style: 'paragraph' },
                    { id: 'evidence', label: 'Evidence (Optional)', placeholder: 'Provide any evidence', required: false, style: 'paragraph' },
                    { id: 'contact', label: 'Contact Method', placeholder: 'Discord DM', required: false, style: 'short' }
                ]
            };
        }
        
        // Create modal with custom questions
        const modal = new ModalBuilder()
            .setCustomId(`appeal_submit_${appealCode}`)
            .setTitle(`Appeal for ${appeal.moderationType.toUpperCase()}`);
        
        // Add up to 5 questions (Discord limit)
        const questions = config.questions.slice(0, 5);
        questions.forEach((q, index) => {
            const input = new TextInputBuilder()
                .setCustomId(`question_${index}`)
                .setLabel(q.label.substring(0, 45)) // Discord limit
                .setStyle(q.style === 'short' ? TextInputStyle.Short : TextInputStyle.Paragraph)
                .setPlaceholder(q.placeholder?.substring(0, 100) || 'Enter your response')
                .setRequired(q.required);
            
            modal.addComponents(new ActionRowBuilder().addComponents(input));
        });
        
        await interaction.showModal(modal);
        
    } catch (error) {
        console.error('❌ Error showing appeal modal:', error);
        console.error('Stack trace:', error.stack);
        
        const errorMessage = `❌ Failed to load appeal form.\n\n**Error**: ${error.message}\n\nPlease try using the command instead:\n\`/appeal submit appeal_code:${appealCode}\``;
        
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: errorMessage }).catch(e => console.error('Failed to edit reply:', e));
        } else {
            await interaction.reply({
                content: errorMessage,
                flags: 64
            }).catch(e => console.error('Failed to reply:', e));
        }
    }
}

// Handle appeal approval
async function handleAppealApprove(interaction, appealCode) {
    const { EmbedBuilder } = require('discord.js');
    const appealLibrary = require('./utils/appealLibrary');
    
    try {
        await interaction.deferReply({ flags: 64 });
        
        const found = await appealLibrary.findAppealByCode(appealCode);
        if (!found) {
            return interaction.editReply({ content: '❌ Appeal not found.' });
        }
        
        const { appeal, guildId } = found;
        
        // Update appeal status
        appeal.status = 'approved';
        appeal.reviewedBy = interaction.user.id;
        appeal.reviewedAt = new Date().toISOString();
        appeal.reviewReason = 'Approved by staff';
        
        await appealLibrary.saveAppeal(guildId, appealCode, appeal);
        
        // Notify user
        try {
            const user = await interaction.client.users.fetch(appeal.moderatedUserId);
            const approvalEmbed = new EmbedBuilder()
                .setTitle('✅ Appeal Approved')
                .setDescription(`Your appeal for **${appeal.moderationType.toUpperCase()}** has been approved!`)
                .addFields(
                    { name: '🎫 Appeal Code', value: appealCode, inline: true },
                    { name: '🏢 Server', value: (await interaction.client.guilds.fetch(guildId)).name, inline: true },
                    { name: '👮 Reviewed By', value: interaction.user.tag, inline: true }
                )
                .setColor('#00ff00')
                .setTimestamp();
            
            await user.send({ embeds: [approvalEmbed] });
        } catch (e) {
            console.log('Could not DM user:', e.message);
        }
        
        await interaction.editReply({
            content: `✅ Appeal **${appealCode}** has been approved!\nUser has been notified.`
        });
        
        // Update original message
        if (interaction.message) {
            await interaction.message.edit({
                components: [] // Remove buttons
            });
        }
        
    } catch (error) {
        console.error('Error approving appeal:', error);
        await interaction.editReply({
            content: '❌ Failed to approve appeal.'
        }).catch(() => {});
    }
}

// Handle appeal rejection
async function handleAppealReject(interaction, appealCode) {
    const { EmbedBuilder } = require('discord.js');
    const appealLibrary = require('./utils/appealLibrary');
    
    try {
        await interaction.deferReply({ flags: 64 });
        
        const found = await appealLibrary.findAppealByCode(appealCode);
        if (!found) {
            return interaction.editReply({ content: '❌ Appeal not found.' });
        }
        
        const { appeal, guildId } = found;
        
        // Update appeal status
        appeal.status = 'rejected';
        appeal.reviewedBy = interaction.user.id;
        appeal.reviewedAt = new Date().toISOString();
        appeal.reviewReason = 'Rejected by staff';
        
        await appealLibrary.saveAppeal(guildId, appealCode, appeal);
        
        // Notify user
        try {
            const user = await interaction.client.users.fetch(appeal.moderatedUserId);
            const rejectionEmbed = new EmbedBuilder()
                .setTitle('❌ Appeal Rejected')
                .setDescription(`Your appeal for **${appeal.moderationType.toUpperCase()}** has been rejected.`)
                .addFields(
                    { name: '🎫 Appeal Code', value: appealCode, inline: true },
                    { name: '🏢 Server', value: (await interaction.client.guilds.fetch(guildId)).name, inline: true },
                    { name: '👮 Reviewed By', value: interaction.user.tag, inline: true }
                )
                .setColor('#ff0000')
                .setTimestamp();
            
            await user.send({ embeds: [rejectionEmbed] });
        } catch (e) {
            console.log('Could not DM user:', e.message);
        }
        
        await interaction.editReply({
            content: `❌ Appeal **${appealCode}** has been rejected.\nUser has been notified.`
        });
        
        // Update original message
        if (interaction.message) {
            await interaction.message.edit({
                components: [] // Remove buttons
            });
        }
        
    } catch (error) {
        console.error('Error rejecting appeal:', error);
        await interaction.editReply({
            content: '❌ Failed to reject appeal.'
        }).catch(() => {});
    }
}

// Handle appeal submission from modal
async function handleAppealSubmit(interaction) {
    const { EmbedBuilder } = require('discord.js');
    const appealLibrary = require('./utils/appealLibrary');
    
    try {
        await interaction.deferReply({ flags: 64 });
        
        const appealCode = interaction.customId.replace('appeal_submit_', '');
        console.log(`📝 Processing appeal submission for code: ${appealCode}`);
        
        // Find the appeal
        const found = await appealLibrary.findAppealByCode(appealCode);
        if (!found) {
            console.log(`❌ Appeal not found: ${appealCode}`);
            return interaction.editReply({
                content: '❌ Appeal not found or expired.'
            });
        }
        
        const { appeal, guildId } = found;
        console.log(`✅ Found appeal for guild: ${guildId}, status: ${appeal.status}`);
        
        // Check if already submitted
        if (appeal.status !== 'pending') {
            console.log(`⚠️ Appeal already submitted or reviewed: ${appeal.status}`);
            return interaction.editReply({
                content: `❌ This appeal has already been ${appeal.status}. Current status: **${appeal.status}**`
            });
        }
        
        // Get all answers
        const answers = [];
        for (let i = 0; i < 5; i++) {
            try {
                const answer = interaction.fields.getTextInputValue(`question_${i}`);
                if (answer) {
                    answers.push(answer);
                    console.log(`📝 Answer ${i + 1}: ${answer.substring(0, 50)}...`);
                }
            } catch (e) {
                // Question doesn't exist
                break;
            }
        }
        
        console.log(`📊 Total answers received: ${answers.length}`);
        
        // Update appeal with answers
        appeal.appealReason = answers[0] || 'No reason provided';
        appeal.appealEvidence = answers[1] || 'None provided';
        appeal.appealContact = answers[2] || 'Discord DM';
        appeal.submittedAt = new Date().toISOString();
        appeal.status = 'under_review';
        
        await appealLibrary.saveAppeal(guildId, appealCode, appeal);
        console.log(`✅ Appeal saved successfully`);
        
        // Send confirmation to user
        const confirmEmbed = new EmbedBuilder()
            .setTitle('✅ Appeal Submitted')
            .setDescription('Your appeal has been submitted successfully!')
            .addFields(
                { name: '🎫 Appeal Code', value: appealCode, inline: true },
                { name: '⏳ Status', value: 'Under Review', inline: true },
                { name: '📅 Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setColor('#00ff00')
            .setTimestamp();
        
        await interaction.editReply({ embeds: [confirmEmbed] });
        console.log(`✅ Confirmation sent to user`);
        
        // Notify staff in review channel
        try {
            const guild = await interaction.client.guilds.fetch(guildId);
            const reviewChannel = guild.channels.cache.find(ch => 
                ch.name.toLowerCase().includes('appeal') || 
                ch.name.toLowerCase().includes('mod-log')
            );
            
            if (reviewChannel) {
                const reviewEmbed = appealLibrary.createAppealEmbed(appeal, interaction.client);
                await reviewChannel.send({
                    content: `📋 New appeal submitted by <@${appeal.moderatedUserId}>`,
                    embeds: [reviewEmbed]
                });
                console.log(`✅ Staff notified in ${reviewChannel.name}`);
            } else {
                console.log(`⚠️ No review channel found`);
            }
        } catch (e) {
            console.log('Could not notify staff:', e.message);
        }
        
    } catch (error) {
        console.error('❌ Error submitting appeal:', error);
        console.error('Stack trace:', error.stack);
        
        const errorMsg = interaction.deferred || interaction.replied 
            ? 'editReply' 
            : 'reply';
            
        await interaction[errorMsg]({
            content: `❌ Failed to submit appeal: ${error.message}\n\nPlease contact a server administrator.`
        }).catch(e => console.error('Failed to send error message:', e));
    }
}

// Appeal config modal handler
async function handleAppealConfigModal(interaction) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
        await interaction.deferReply({ flags: 64 });
        
        const guildId = interaction.guild.id;
        const APPEAL_CONFIG_PATH = path.join(process.cwd(), 'data', 'appeal-configs');
        
        // Get values from modal
        const q1Label = interaction.fields.getTextInputValue('q1_label');
        const q1Placeholder = interaction.fields.getTextInputValue('q1_placeholder') || 'Enter your response';
        const q2Label = interaction.fields.getTextInputValue('q2_label') || '';
        const q2Placeholder = interaction.fields.getTextInputValue('q2_placeholder') || 'Enter your response';
        const q3Label = interaction.fields.getTextInputValue('q3_label') || '';
        
        // Load existing config
        let config;
        try {
            const configPath = path.join(APPEAL_CONFIG_PATH, `${guildId}.json`);
            const data = await fs.readFile(configPath, 'utf8');
            config = JSON.parse(data);
        } catch (error) {
            config = { enabled: true, questions: [], reviewChannel: null, cooldown: 86400000 };
        }
        
        // Update questions
        config.questions = [
            {
                id: 'reason',
                label: q1Label,
                placeholder: q1Placeholder,
                required: true,
                style: 'paragraph'
            }
        ];
        
        if (q2Label) {
            config.questions.push({
                id: 'evidence',
                label: q2Label,
                placeholder: q2Placeholder,
                required: false,
                style: 'paragraph'
            });
        }
        
        if (q3Label) {
            config.questions.push({
                id: 'contact',
                label: q3Label,
                placeholder: 'Discord DM',
                required: false,
                style: 'short'
            });
        }
        
        // Save config
        await fs.mkdir(APPEAL_CONFIG_PATH, { recursive: true });
        const configPath = path.join(APPEAL_CONFIG_PATH, `${guildId}.json`);
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        
        await interaction.editReply({
            content: `✅ Appeal questions updated!\n\n**Questions configured:** ${config.questions.length}\n\nUsers will now see these questions when submitting appeals.`
        });
        
    } catch (error) {
        console.error('Error updating appeal config:', error);
        await interaction.editReply({
            content: '❌ Failed to update appeal configuration.'
        }).catch(() => {});
    }
}

// Ticket creation handler
async function handleTicketCreation(interaction, category) {
    const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
    
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const user = interaction.user;
        const guild = interaction.guild;
        
        // Generate ticket ID
        const ticketID = `ticket-${Date.now()}`;
        const channelName = `${category}-${user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        
        // Create ticket channel
        const ticketChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            topic: `Ticket by ${user.tag} | Category: ${category} | ID: ${ticketID}`,
            parent: guild.channels.cache.find(c => c.name.toLowerCase().includes('ticket') && c.type === ChannelType.GuildCategory)?.id,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                },
                {
                    id: client.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
                }
            ]
        });
        
        // Find and add staff roles
        const staffRoles = guild.roles.cache.filter(role => 
            ['staff', 'mod', 'moderator', 'admin', 'administrator', 'support'].some(name => 
                role.name.toLowerCase().includes(name)
            )
        );
        
        for (const role of staffRoles.values()) {
            await ticketChannel.permissionOverwrites.create(role, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
        }
        
        // Create welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`🎫 ${category.charAt(0).toUpperCase() + category.slice(1)} Support Ticket`)
            .setDescription(`Hello ${user}! Thank you for creating a ticket.\n\nOur staff team will be with you shortly. Please describe your issue in detail.`)
            .addFields(
                { name: '📂 Category', value: category, inline: true },
                { name: '🆔 Ticket ID', value: ticketID, inline: true },
                { name: '⏰ Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setColor('#3742FA')
            .setTimestamp();
        
        // Create control buttons for ticket
        const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
        const controlRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close_button')
                    .setLabel('Close Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript_button')
                    .setLabel('Transcript')
                    .setEmoji('📄')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('ticket_claim_button')
                    .setLabel('Claim')
                    .setEmoji('✋')
                    .setStyle(ButtonStyle.Primary)
            );
        
        const staffMention = staffRoles.size > 0 ? staffRoles.map(r => r.toString()).join(' ') : '';
        await ticketChannel.send({
            content: `${user} ${staffMention}`,
            embeds: [welcomeEmbed],
            components: [controlRow]
        });
        
        await interaction.editReply({
            content: `✅ Ticket created! Please check ${ticketChannel}`
        });
        
    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.editReply({
            content: '❌ Failed to create ticket. Please contact an administrator.'
        }).catch(() => {});
    }
}

// Ticket list handler
async function handleTicketList(interaction) {
    const { EmbedBuilder } = require('discord.js');
    
    try {
        await interaction.deferReply({ ephemeral: true });
        
        // Find all ticket channels
        const ticketChannels = interaction.guild.channels.cache.filter(c => 
            c.name.match(/^(general|technical|report|billing|staff)-/) && c.isTextBased()
        );
        
        if (ticketChannels.size === 0) {
            return interaction.editReply({ content: '📋 No open tickets found.' });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('📋 Open Tickets')
            .setColor('#3742FA')
            .setDescription(`Found ${ticketChannels.size} open ticket(s)`)
            .setTimestamp();
        
        ticketChannels.forEach(channel => {
            const topic = channel.topic || 'No topic';
            embed.addFields({
                name: `🎫 ${channel.name}`,
                value: `Channel: ${channel}\nTopic: ${topic}`,
                inline: false
            });
        });
        
        await interaction.editReply({ embeds: [embed] });
        
    } catch (error) {
        console.error('Error listing tickets:', error);
        await interaction.editReply({ content: '❌ Failed to list tickets.' }).catch(() => {});
    }
}

// Ticket create modal handler
async function handleTicketCreateModal(interaction) {
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
    
    const modal = new ModalBuilder()
        .setCustomId('ticket_create_modal')
        .setTitle('Create Ticket for User');
    
    const userInput = new TextInputBuilder()
        .setCustomId('ticket_user_id')
        .setLabel('User ID or @mention')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('123456789 or @username')
        .setRequired(true);
    
    const reasonInput = new TextInputBuilder()
        .setCustomId('ticket_reason')
        .setLabel('Reason')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Why is this ticket being created?')
        .setRequired(true);
    
    modal.addComponents(
        new ActionRowBuilder().addComponents(userInput),
        new ActionRowBuilder().addComponents(reasonInput)
    );
    
    await interaction.showModal(modal);
}

// Ticket close handler
async function handleTicketClose(interaction) {
    const { EmbedBuilder } = require('discord.js');
    
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const channel = interaction.channel;
        
        // Check if this is a ticket channel
        if (!channel.name.match(/^(general|technical|report|billing|staff)-/)) {
            return interaction.editReply({ content: '❌ This is not a ticket channel!' });
        }
        
        // Fetch messages for transcript
        const messages = await channel.messages.fetch({ limit: 100 });
        const sortedMessages = Array.from(messages.values()).reverse();
        
        // Create detailed transcript
        const transcript = sortedMessages.map(m => {
            const timestamp = m.createdAt.toLocaleString();
            const author = m.author.tag;
            const content = m.content || '[No text content]';
            const attachments = m.attachments.size > 0 ? `\n  Attachments: ${m.attachments.map(a => a.url).join(', ')}` : '';
            return `[${timestamp}] ${author}: ${content}${attachments}`;
        }).join('\n');
        
        const transcriptBuffer = Buffer.from(transcript);
        const fileName = `transcript-${channel.name}-${Date.now()}.txt`;
        
        // Extract ticket creator from channel topic or permissions
        let ticketCreator = null;
        const topicMatch = channel.topic?.match(/Ticket (?:by|for) (.+?) (?:\((\d+)\)|\\|)/);
        if (topicMatch && topicMatch[2]) {
            try {
                ticketCreator = await interaction.client.users.fetch(topicMatch[2]);
            } catch (e) {
                console.log('Could not fetch user from topic');
            }
        }
        
        // If not found in topic, check channel permissions
        if (!ticketCreator) {
            const permissions = channel.permissionOverwrites.cache;
            for (const [id, perm] of permissions) {
                if (id !== interaction.guild.roles.everyone.id && id !== interaction.client.user.id) {
                    try {
                        const member = await interaction.guild.members.fetch(id);
                        if (member && !member.user.bot) {
                            ticketCreator = member.user;
                            break;
                        }
                    } catch (e) {
                        // Not a user, might be a role
                    }
                }
            }
        }
        
        // Create transcript embed
        const transcriptEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket Closed')
            .setDescription(`Ticket **${channel.name}** has been closed.`)
            .addFields(
                { name: '🔒 Closed By', value: interaction.user.tag, inline: true },
                { name: '📅 Closed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '💬 Messages', value: `${sortedMessages.length} messages`, inline: true }
            )
            .setColor('#ff0000')
            .setTimestamp();
        
        // Try to DM transcript to ticket creator
        let dmSent = false;
        if (ticketCreator) {
            try {
                await ticketCreator.send({
                    content: `📄 Your ticket **${channel.name}** has been closed. Here's the transcript:`,
                    embeds: [transcriptEmbed],
                    files: [{
                        attachment: transcriptBuffer,
                        name: fileName
                    }]
                });
                dmSent = true;
                console.log(`✅ Sent transcript to ${ticketCreator.tag}`);
            } catch (e) {
                console.log(`❌ Could not DM transcript to ${ticketCreator.tag}: ${e.message}`);
            }
        }
        
        // Send transcript to logs channel if configured
        const logsChannel = interaction.guild.channels.cache.find(ch => 
            ch.name.toLowerCase().includes('ticket-log') || 
            ch.name.toLowerCase().includes('transcript') ||
            ch.name.toLowerCase() === 'logs'
        );
        
        if (logsChannel && logsChannel.isTextBased()) {
            try {
                await logsChannel.send({
                    embeds: [transcriptEmbed.addFields(
                        { name: '👤 Ticket Creator', value: ticketCreator ? ticketCreator.tag : 'Unknown', inline: true },
                        { name: '📨 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true }
                    )],
                    files: [{
                        attachment: transcriptBuffer,
                        name: fileName
                    }]
                });
                console.log(`✅ Sent transcript to ${logsChannel.name}`);
            } catch (e) {
                console.log(`❌ Could not send transcript to logs channel: ${e.message}`);
            }
        }
        
        await interaction.editReply({ 
            content: `✅ Ticket closing...\n${dmSent ? '📨 Transcript sent to user via DM' : '⚠️ Could not DM user'}\n${logsChannel ? `📋 Transcript saved to ${logsChannel}` : ''}` 
        });
        
        // Delete channel after delay
        setTimeout(async () => {
            try {
                await channel.delete(`Ticket closed by ${interaction.user.tag}`);
            } catch (e) {
                console.log('Could not delete channel:', e.message);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error closing ticket:', error);
        await interaction.editReply({ content: '❌ Failed to close ticket.' }).catch(() => {});
    }
}

// Ticket transcript handler
async function handleTicketTranscript(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const channel = interaction.channel;
        const messages = await channel.messages.fetch({ limit: 100 });
        
        const transcript = messages.reverse().map(m => 
            `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`
        ).join('\n');
        
        await interaction.editReply({
            content: '📄 Ticket transcript generated!',
            files: [{
                attachment: Buffer.from(transcript),
                name: `transcript-${channel.name}.txt`
            }]
        });
        
    } catch (error) {
        console.error('Error generating transcript:', error);
        await interaction.editReply({ content: '❌ Failed to generate transcript.' }).catch(() => {});
    }
}

// Ticket claim handler
async function handleTicketClaim(interaction) {
    const { EmbedBuilder } = require('discord.js');
    
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const channel = interaction.channel;
        const claimer = interaction.user;
        
        // Update channel topic to show claimer
        const currentTopic = channel.topic || '';
        const newTopic = currentTopic.includes('Claimed by') 
            ? currentTopic 
            : `${currentTopic} | Claimed by: ${claimer.tag}`;
        
        await channel.setTopic(newTopic);
        
        // Send claim message
        const claimEmbed = new EmbedBuilder()
            .setTitle('✋ Ticket Claimed')
            .setDescription(`${claimer} has claimed this ticket and will be assisting you.`)
            .setColor('#00ff00')
            .setTimestamp();
        
        await channel.send({ embeds: [claimEmbed] });
        
        await interaction.editReply({
            content: '✅ You have claimed this ticket!'
        });
        
    } catch (error) {
        console.error('Error claiming ticket:', error);
        await interaction.editReply({
            content: '❌ Failed to claim ticket.'
        }).catch(() => {});
    }
}

// Ticket create modal submit handler
async function handleTicketCreateSubmit(interaction) {
    const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
    
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const userIdInput = interaction.fields.getTextInputValue('ticket_user_id');
        const reason = interaction.fields.getTextInputValue('ticket_reason');
        
        // Extract user ID from input (handle @mentions or plain IDs)
        const userId = userIdInput.replace(/[<@!>]/g, '');
        
        // Fetch user
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        if (!user) {
            return interaction.editReply({ content: '❌ User not found!' });
        }
        
        const guild = interaction.guild;
        const ticketID = `ticket-${Date.now()}`;
        const channelName = `staff-${user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        
        // Create ticket channel
        const ticketChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            topic: `Ticket for ${user.tag} (${user.id}) | Reason: ${reason} | Created by: ${interaction.user.tag}`,
            parent: guild.channels.cache.find(c => c.name.toLowerCase().includes('ticket') && c.type === ChannelType.GuildCategory)?.id,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
                },
                {
                    id: client.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
                }
            ]
        });
        
        // Find and add staff roles
        const staffRoles = guild.roles.cache.filter(role => 
            ['staff', 'mod', 'moderator', 'admin', 'administrator', 'support'].some(name => 
                role.name.toLowerCase().includes(name)
            )
        );
        
        for (const role of staffRoles.values()) {
            await ticketChannel.permissionOverwrites.create(role, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
        }
        
        // Create welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎫 Staff-Created Support Ticket')
            .setDescription(`Hello ${user}! A ticket has been created for you by ${interaction.user}.\n\n**Reason:** ${reason}`)
            .addFields(
                { name: '🆔 Ticket ID', value: ticketID, inline: true },
                { name: '👤 Created By', value: interaction.user.tag, inline: true },
                { name: '⏰ Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setColor('#3742FA')
            .setTimestamp();
        
        // Create control buttons
        const { ButtonBuilder, ButtonStyle, ActionRowBuilder: AR } = require('discord.js');
        const controlRow = new AR()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close_button')
                    .setLabel('Close Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript_button')
                    .setLabel('Transcript')
                    .setEmoji('📄')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('ticket_claim_button')
                    .setLabel('Claim')
                    .setEmoji('✋')
                    .setStyle(ButtonStyle.Primary)
            );
        
        const staffMention = staffRoles.size > 0 ? staffRoles.map(r => r.toString()).join(' ') : '';
        await ticketChannel.send({
            content: `${user} ${staffMention}`,
            embeds: [welcomeEmbed],
            components: [controlRow]
        });
        
        await interaction.editReply({
            content: `✅ Ticket created for ${user.tag}! Check ${ticketChannel}`
        });
        
    } catch (error) {
        console.error('Error creating ticket from modal:', error);
        await interaction.editReply({
            content: '❌ Failed to create ticket. Please check the user ID and try again.'
        }).catch(() => {});
    }
}

// AutoMod message handler
client.on('messageCreate', async (message) => {
    try {
        await automod.moderateMessage(message);
    } catch (error) {
        console.error('AutoMod error:', error);
    }
});

// Guild events
client.on('guildCreate', async (guild) => {
    console.log(`📥 Joined guild: ${guild.name} (${guild.memberCount} members)`);
});

client.on('guildDelete', async (guild) => {
    console.log(`📤 Left guild: ${guild.name}`);
});

// Client error handlers
client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
});

client.on('warn', (warning) => {
    console.warn('⚠️ Discord client warning:', warning);
});

client.on('shardError', (error) => {
    console.error('❌ Shard error:', error);
});

// Login
client.login(config.token).catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down bot...');
    client.destroy();
    process.exit(0);
});
