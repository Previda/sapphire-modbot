// Load environment variables FIRST before anything else
require('dotenv').config();

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
    // Handle button interactions
    if (interaction.isButton()) {
        try {
            await handleButtonInteraction(interaction);
        } catch (error) {
            console.error('Button interaction error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred!',
                    ephemeral: true
                }).catch(console.error);
            }
        }
        return;
    }

    // Handle select menu interactions
    if (interaction.isStringSelectMenu()) {
        try {
            await handleSelectMenuInteraction(interaction);
        } catch (error) {
            console.error('Select menu interaction error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred!',
                    ephemeral: true
                }).catch(console.error);
            }
        }
        return;
    }

    // Handle modal submissions
    if (interaction.isModalSubmit()) {
        try {
            await handleModalSubmit(interaction);
        } catch (error) {
            console.error('Modal submit error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred!',
                    ephemeral: true
                }).catch(console.error);
            }
        }
        return;
    }

    // Handle slash commands
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
        console.error(error);
        addLog('error', 'System', `Command error: ${interaction.commandName}`, 'error');
        
        // Reply with error if interaction hasn't been replied to
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ An error occurred while executing this command!',
                ephemeral: true
            }).catch(console.error);
        }
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

// Interaction handlers
async function handleButtonInteraction(interaction) {
    const { customId } = interaction;
    
    // Ticket close button
    if (customId === 'ticket_close') {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: '❌ This can only be used in ticket channels!',
                ephemeral: true
            });
        }

        const { EmbedBuilder } = require('discord.js');
        
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('🔒 Closing Ticket')
                .setDescription(`This ticket will be closed in 5 seconds...\n\n**Closed by:** ${interaction.user}`)
                .setTimestamp()
            ]
        });

        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (error) {
                console.error('Error closing ticket:', error);
            }
        }, 5000);
        return;
    }

    // Ticket claim button
    if (customId === 'ticket_claim') {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: '❌ This can only be used in ticket channels!',
                ephemeral: true
            });
        }

        const { EmbedBuilder } = require('discord.js');
        
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✋ Ticket Claimed')
                .setDescription(`${interaction.user} is now handling this ticket.`)
                .setTimestamp()
            ]
        });
        return;
    }

    // Ticket pause button
    if (customId === 'ticket_pause') {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: '❌ This can only be used in ticket channels!',
                ephemeral: true
            });
        }

        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });

            const { EmbedBuilder } = require('discord.js');
            
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xFEE75C)
                    .setTitle('⏸️ Ticket Paused')
                    .setDescription(`This ticket has been paused by ${interaction.user}.\n\nThe channel is now locked.`)
                    .setTimestamp()
                ]
            });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to pause ticket!',
                ephemeral: true
            });
        }
        return;
    }

    // Ticket resume button
    if (customId === 'ticket_resume') {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: '❌ This can only be used in ticket channels!',
                ephemeral: true
            });
        }

        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null
            });

            const { EmbedBuilder } = require('discord.js');
            
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle('▶️ Ticket Resumed')
                    .setDescription(`This ticket has been resumed by ${interaction.user}.\n\nThe channel is now unlocked.`)
                    .setTimestamp()
                ]
            });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to resume ticket!',
                ephemeral: true
            });
        }
        return;
    }

    // Ticket priority button
    if (customId === 'ticket_priority') {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: '❌ This can only be used in ticket channels!',
                ephemeral: true
            });
        }

        const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
        
        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_priority_select')
                    .setPlaceholder('Select priority level')
                    .addOptions([
                        {
                            label: 'High Priority',
                            description: 'Urgent issue requiring immediate attention',
                            value: 'high',
                            emoji: '🔴'
                        },
                        {
                            label: 'Medium Priority',
                            description: 'Standard issue',
                            value: 'medium',
                            emoji: '🟡'
                        },
                        {
                            label: 'Low Priority',
                            description: 'Non-urgent issue',
                            value: 'low',
                            emoji: '🟢'
                        }
                    ])
            );

        await interaction.reply({
            content: '🏷️ Select ticket priority:',
            components: [selectMenu],
            ephemeral: true
        });
        return;
    }

    // Ticket save transcript button
    if (customId === 'ticket_save') {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: '❌ This can only be used in ticket channels!',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = messages.reverse().map(m => 
                `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`
            ).join('\n');

            const fs = require('fs').promises;
            const path = require('path');
            
            const transcriptDir = path.join(__dirname, '../data/transcripts');
            await fs.mkdir(transcriptDir, { recursive: true });
            
            const filename = `${interaction.channel.name}-${Date.now()}.txt`;
            const filepath = path.join(transcriptDir, filename);
            
            await fs.writeFile(filepath, transcript);

            const { EmbedBuilder } = require('discord.js');
            
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle('💾 Transcript Saved')
                    .setDescription(`Transcript saved as \`${filename}\`\n\nTotal messages: ${messages.size}`)
                    .setTimestamp()
                ]
            });

            // Try to send to transcript channel if configured
            const configFile = path.join(__dirname, '../data/ticket-config.json');
            try {
                const data = await fs.readFile(configFile, 'utf8');
                const allConfigs = JSON.parse(data);
                const config = allConfigs[interaction.guild.id];
                
                if (config && config.transcriptChannel) {
                    const transcriptChannel = interaction.guild.channels.cache.get(config.transcriptChannel);
                    if (transcriptChannel) {
                        await transcriptChannel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(0x5865F2)
                                .setTitle('📜 Ticket Transcript')
                                .setDescription(
                                    `**Ticket:** ${interaction.channel.name}\n` +
                                    `**Saved by:** ${interaction.user}\n` +
                                    `**Messages:** ${messages.size}\n` +
                                    `**File:** \`${filename}\``
                                )
                                .setTimestamp()
                            ]
                        });
                    }
                }
            } catch (err) {
                // Transcript channel not configured, skip
            }

        } catch (error) {
            console.error('Error saving transcript:', error);
            await interaction.editReply({
                content: '❌ Failed to save transcript!'
            });
        }
        return;
    }

    // Ticket creation button
    if (customId === 'create_ticket') {
        const fs = require('fs').promises;
        const path = require('path');
        const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
        
        const configFile = path.join(__dirname, '../data/ticket-config.json');
        let config;
        
        try {
            const data = await fs.readFile(configFile, 'utf8');
            const allConfigs = JSON.parse(data);
            config = allConfigs[interaction.guild.id];
        } catch (error) {
            return interaction.reply({
                content: '❌ Ticket system not configured!',
                ephemeral: true
            });
        }
        
        if (!config || config.categories.length === 0) {
            return interaction.reply({
                content: '❌ No ticket categories available!',
                ephemeral: true
            });
        }
        
        // Show category selection
        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_category')
                    .setPlaceholder('Select a category')
                    .addOptions(
                        config.categories.map(cat => ({
                            label: cat.name,
                            description: cat.description,
                            value: cat.name,
                            emoji: cat.emoji
                        }))
                    )
            );
        
        await interaction.reply({
            content: '🎫 Please select a ticket category:',
            components: [selectMenu],
            ephemeral: true
        });
    }
}

async function handleSelectMenuInteraction(interaction) {
    const { customId, values } = interaction;
    
    // Ticket priority selection
    if (customId === 'ticket_priority_select') {
        const level = values[0];
        
        const priorityEmojis = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };

        const priorityColors = {
            high: 0xED4245,
            medium: 0xFEE75C,
            low: 0x57F287
        };

        const { EmbedBuilder } = require('discord.js');

        await interaction.update({
            content: null,
            embeds: [new EmbedBuilder()
                .setColor(priorityColors[level])
                .setTitle(`${priorityEmojis[level]} Priority Set`)
                .setDescription(`This ticket's priority has been set to **${level.toUpperCase()}**`)
                .setTimestamp()
            ],
            components: []
        });

        // Send notification in channel
        await interaction.channel.send({
            embeds: [new EmbedBuilder()
                .setColor(priorityColors[level])
                .setDescription(`${priorityEmojis[level]} Priority changed to **${level.toUpperCase()}** by ${interaction.user}`)
            ]
        });
        return;
    }
    
    // Ticket category selection
    if (customId === 'ticket_category') {
        await interaction.deferReply({ ephemeral: true });
        
        const fs = require('fs').promises;
        const path = require('path');
        const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
        
        const configFile = path.join(__dirname, '../data/ticket-config.json');
        let config;
        
        try {
            const data = await fs.readFile(configFile, 'utf8');
            const allConfigs = JSON.parse(data);
            config = allConfigs[interaction.guild.id];
        } catch (error) {
            return interaction.editReply({
                content: '❌ Error loading ticket configuration!'
            });
        }
        
        const categoryName = values[0];
        const category = config.categories.find(c => c.name === categoryName);
        
        if (!category) {
            return interaction.editReply({
                content: '❌ Category not found!'
            });
        }
        
        // Create ticket channel
        config.ticketCount = (config.ticketCount || 0) + 1;
        const ticketNumber = config.ticketCount;
        
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${ticketNumber}`,
            type: ChannelType.GuildText,
            parent: category.categoryChannel || config.categoryChannel,
            topic: `${category.emoji} ${categoryName} ticket for ${interaction.user.tag}`,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                {
                    id: client.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels
                    ]
                }
            ]
        });
        
        // Add ping role if configured
        if (category.pingRole) {
            await ticketChannel.permissionOverwrites.create(category.pingRole, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
        }
        
        // Save updated config
        const allConfigs = JSON.parse(await fs.readFile(configFile, 'utf8'));
        allConfigs[interaction.guild.id] = config;
        await fs.writeFile(configFile, JSON.stringify(allConfigs, null, 2));
        
        // Send welcome message with buttons
        const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
        
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`${category.emoji} ${categoryName} Ticket`)
            .setDescription(
                `Welcome ${interaction.user}!\n\n` +
                `**Category:** ${categoryName}\n` +
                `**Description:** ${category.description}\n\n` +
                `Please describe your issue and our team will assist you shortly.`
            )
            .setFooter({ text: `Ticket #${ticketNumber}` })
            .setTimestamp();
        
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claim')
                    .setEmoji('✋')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('ticket_save')
                    .setLabel('Save Transcript')
                    .setEmoji('💾')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        const pingMessage = category.pingRole ? `<@&${category.pingRole}>` : '';
        await ticketChannel.send({ content: pingMessage, embeds: [embed], components: [buttons] });
        
        await interaction.editReply({
            content: `✅ Ticket created! ${ticketChannel}`
        });
    }
}

async function handleModalSubmit(interaction) {
    // Handle modal submissions here
    console.log('Modal submitted:', interaction.customId);
}

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
