const { Client, GatewayIntentBits, Collection } = require('discord.js');
const axios = require('axios');
const { handleCommand } = require('./handlers/commandHandler');
const { handleButtonInteraction } = require('./handlers/buttonHandler');
require('dotenv').config();

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

// Bot configuration
const config = {
    token: process.env.DISCORD_BOT_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID || '1358527215020544222',
    apiUrl: process.env.API_URL || 'http://localhost:3004'
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
    
    // Send initial data to API
    await updateAPIData();
    
    // Update API every 30 seconds
    setInterval(updateAPIData, 30000);
});

// Handle slash commands and button interactions
client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            // Handle slash commands
            await handleCommand(interaction);
            
            // Log command usage to API
            await axios.post(`${config.apiUrl}/api/internal/add-log`, {
                action: 'Command executed',
                user: interaction.user.tag,
                details: `Used /${interaction.commandName}`,
                type: 'command'
            }).catch(() => {});
            
        } else if (interaction.isButton()) {
            // Handle button interactions (verify, tickets)
            await handleButtonInteraction(interaction);
        }
    } catch (error) {
        console.error('Interaction error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ An error occurred while processing this interaction.',
                ephemeral: true
            }).catch(() => {});
        }
    }
});

// Update API with real Discord data
async function updateAPIData() {
    try {
        // Get guild data
        const guilds = client.guilds.cache.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL(),
            memberCount: guild.memberCount,
            onlineMembers: guild.members.cache.filter(m => m.presence?.status !== 'offline').size,
            boostLevel: guild.premiumTier,
            boostCount: guild.premiumSubscriptionCount || 0,
            isOwner: guild.ownerId === client.user.id,
            canManage: guild.members.me?.permissions.has('Administrator') || false
        }));
        
        // Send to API
        await axios.post(`${config.apiUrl}/api/internal/update-guilds`, { guilds }).catch(() => {});
        
        // Send commands to API
        await axios.post(`${config.apiUrl}/api/internal/update-commands`, { commands: allCommands }).catch(() => {});
        
        console.log(`📊 Updated API with ${guilds.length} guilds and ${allCommands.length} commands`);
    } catch (error) {
        console.error('Failed to update API:', error.message);
    }
}

// Guild events
client.on('guildCreate', async (guild) => {
    console.log(`📥 Joined guild: ${guild.name}`);
    await updateAPIData();
    
    // Log to API
    await axios.post(`${config.apiUrl}/api/internal/add-log`, {
        action: 'Guild joined',
        user: 'System',
        details: `Bot joined ${guild.name}`,
        type: 'system'
    }).catch(() => {});
});

client.on('guildDelete', async (guild) => {
    console.log(`📤 Left guild: ${guild.name}`);
    await updateAPIData();
    
    // Log to API
    await axios.post(`${config.apiUrl}/api/internal/add-log`, {
        action: 'Guild left',
        user: 'System',
        details: `Bot left ${guild.name}`,
        type: 'system'
    }).catch(() => {});
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
