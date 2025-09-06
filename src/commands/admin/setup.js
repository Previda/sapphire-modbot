const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

// Configuration file path
const CONFIG_FILE = path.join(process.cwd(), 'data', 'guild-config.json');

// Load guild configuration
async function loadGuildConfig() {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Save guild configuration
async function saveGuildConfig(config) {
    try {
        const dataDir = path.dirname(CONFIG_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Failed to save guild config:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configure bot settings for your server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('modlog')
                .setDescription('Set moderation log channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel for moderation logs')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('tickets')
                .setDescription('Configure ticket system')
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('Category for ticket channels')
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(false))
                .addRoleOption(option =>
                    option.setName('support_role')
                        .setDescription('Role that can manage tickets')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('automod')
                .setDescription('Configure auto-moderation settings')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable auto-moderation')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('warn_threshold')
                        .setDescription('Number of warnings before auto-mute')
                        .setMinValue(1)
                        .setMaxValue(10)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('xp')
                .setDescription('Configure XP system')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable XP system')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('per_message')
                        .setDescription('XP gained per message (1-50)')
                        .setMinValue(1)
                        .setMaxValue(50)
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('levelup_channel')
                        .setDescription('Channel for level up announcements')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current server configuration'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset all server configuration'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // Check permissions
        if (interaction.guild.ownerId !== interaction.user.id && 
            !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: '❌ You need the "Manage Server" permission or be the server owner to use setup commands.',
                flags: 64
            });
        }

        let subcommand;
        try {
            subcommand = interaction.options.getSubcommand();
        } catch (error) {
            // Show setup menu
            return await showSetupMenu(interaction);
        }

        // Defer reply to prevent timeout on slow operations
        await interaction.deferReply({ ephemeral: true });

        try {
            const guildConfig = await loadGuildConfig();
            if (!guildConfig[interaction.guild.id]) {
                guildConfig[interaction.guild.id] = {
                    modlog: null,
                    tickets: {
                        category: null,
                        supportRole: null,
                        enabled: true
                    },
                    automod: {
                        enabled: false,
                        warnThreshold: 3
                    },
                    xp: {
                        enabled: true,
                        perMessage: 15,
                        levelupChannel: null
                    }
                };
            }

            const serverConfig = guildConfig[interaction.guild.id];

        switch (subcommand) {
            case 'modlog':
                await handleModlogSetup(interaction, guildConfig, serverConfig);
                break;
            case 'tickets':
                await handleTicketSetup(interaction, guildConfig, serverConfig);
                break;
            case 'automod':
                await handleAutomodSetup(interaction, guildConfig, serverConfig);
                break;
            case 'xp':
                await handleXPSetup(interaction, guildConfig, serverConfig);
                break;
            case 'view':
                await handleViewConfig(interaction, serverConfig);
                break;
            case 'reset':
                await handleResetConfig(interaction, guildConfig);
                break;
            default:
                await interaction.editReply({
                    content: '❌ Unknown setup command.'
                });
        }
        } catch (error) {
            console.error('Setup command error:', error);
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ An error occurred during setup. Please try again.'
                });
            } else {
                await interaction.reply({
                    content: '❌ An error occurred during setup. Please try again.',
                    ephemeral: true
                });
            }
        }
    }
};

async function showSetupMenu(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🛠️ Bot Setup System')
        .setColor(0x00ff00)
        .setDescription('Configure your server settings using the subcommands below:')
        .addFields(
            { name: '/setup modlog', value: 'Set moderation log channel', inline: false },
            { name: '/setup tickets', value: 'Configure ticket system', inline: false },
            { name: '/setup automod', value: 'Configure auto-moderation', inline: false },
            { name: '/setup xp', value: 'Configure XP system', inline: false },
            { name: '/setup view', value: 'View current configuration', inline: false },
            { name: '/setup reset', value: 'Reset all settings', inline: false }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
}

async function handleModlogSetup(interaction, guildConfig, serverConfig) {
    const channel = interaction.options.getChannel('channel');
    
    serverConfig.modlog = channel.id;
    await saveGuildConfig(guildConfig);

    const embed = new EmbedBuilder()
        .setTitle('✅ Modlog Channel Set')
        .setColor(0x00ff00)
        .addFields(
            { name: '📝 Channel', value: channel.toString(), inline: true },
            { name: '🆔 Channel ID', value: channel.id, inline: true }
        )
        .setDescription('Moderation actions will now be logged to this channel.')
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleTicketSetup(interaction, guildConfig, serverConfig) {
    try {
        const category = interaction.options.getChannel('category');
        const supportRole = interaction.options.getRole('support_role');

        if (category) {
            // Validate category is actually a category channel
            if (category.type !== ChannelType.GuildCategory) {
                return interaction.editReply({
                    content: '❌ Please select a category channel for tickets.'
                });
            }
            serverConfig.tickets.category = category.id;
        }
        
        if (supportRole) {
            // Validate role exists and bot can see it
            if (!supportRole) {
                return interaction.editReply({
                    content: '❌ Could not find the specified support role.'
                });
            }
            serverConfig.tickets.supportRole = supportRole.id;
        }

        await saveGuildConfig(guildConfig);

        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket System Configured')
            .setColor(0x3498db)
            .addFields(
                { name: '📂 Category', value: category ? `${category.name} (\`${category.id}\`)` : 'Not changed', inline: true },
                { name: '👥 Support Role', value: supportRole ? supportRole.toString() : 'Not changed', inline: true },
                { name: '✅ Status', value: 'Enabled', inline: true }
            )
            .setDescription('Ticket system has been configured successfully.')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        
    } catch (error) {
        console.error('Error in handleTicketSetup:', error);
        await interaction.editReply({
            content: '❌ Failed to configure ticket system. Please check my permissions and try again.'
        });
    }
}

async function handleAutomodSetup(interaction, guildConfig, serverConfig) {
    const enabled = interaction.options.getBoolean('enabled');
    const warnThreshold = interaction.options.getInteger('warn_threshold') || 3;

    serverConfig.automod.enabled = enabled;
    serverConfig.automod.warnThreshold = warnThreshold;

    await saveGuildConfig(guildConfig);

    const embed = new EmbedBuilder()
        .setTitle('🤖 Auto-Moderation Configured')
        .setColor(enabled ? 0x00ff00 : 0xff0000)
        .addFields(
            { name: '⚡ Status', value: enabled ? 'Enabled' : 'Disabled', inline: true },
            { name: '⚠️ Warning Threshold', value: warnThreshold.toString(), inline: true }
        )
        .setDescription(`Auto-moderation has been ${enabled ? 'enabled' : 'disabled'}.`)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleXPSetup(interaction, guildConfig, serverConfig) {
    const enabled = interaction.options.getBoolean('enabled');
    const perMessage = interaction.options.getInteger('per_message') || 15;
    const levelupChannel = interaction.options.getChannel('levelup_channel');

    serverConfig.xp.enabled = enabled;
    serverConfig.xp.perMessage = perMessage;
    if (levelupChannel) {
        serverConfig.xp.levelupChannel = levelupChannel.id;
    }

    await saveGuildConfig(guildConfig);

    const embed = new EmbedBuilder()
        .setTitle('⭐ XP System Configured')
        .setColor(enabled ? 0xffd700 : 0x808080)
        .addFields(
            { name: '💫 Status', value: enabled ? 'Enabled' : 'Disabled', inline: true },
            { name: '📈 XP per Message', value: perMessage.toString(), inline: true },
            { name: '📢 Levelup Channel', value: levelupChannel ? levelupChannel.toString() : 'Current channel', inline: true }
        )
        .setDescription(`XP system has been ${enabled ? 'enabled' : 'disabled'}.`)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleViewConfig(interaction, serverConfig) {
    const guild = interaction.guild;
    
    const modlogChannel = serverConfig.modlog ? guild.channels.cache.get(serverConfig.modlog) : null;
    const ticketCategory = serverConfig.tickets.category ? guild.channels.cache.get(serverConfig.tickets.category) : null;
    const supportRole = serverConfig.tickets.supportRole ? guild.roles.cache.get(serverConfig.tickets.supportRole) : null;
    const levelupChannel = serverConfig.xp.levelupChannel ? guild.channels.cache.get(serverConfig.xp.levelupChannel) : null;

    const embed = new EmbedBuilder()
        .setTitle('⚙️ Server Configuration')
        .setColor(0x9b59b6)
        .addFields(
            { 
                name: '📝 Moderation Log', 
                value: modlogChannel ? modlogChannel.toString() : 'Not configured', 
                inline: true 
            },
            { 
                name: '🎫 Ticket System', 
                value: `**Status:** ${serverConfig.tickets.enabled ? 'Enabled' : 'Disabled'}\n**Category:** ${ticketCategory ? ticketCategory.name : 'Not set'}\n**Support Role:** ${supportRole ? supportRole.toString() : 'Not set'}`, 
                inline: true 
            },
            { 
                name: '🤖 Auto-Moderation', 
                value: `**Status:** ${serverConfig.automod.enabled ? 'Enabled' : 'Disabled'}\n**Warn Threshold:** ${serverConfig.automod.warnThreshold}`, 
                inline: true 
            },
            { 
                name: '⭐ XP System', 
                value: `**Status:** ${serverConfig.xp.enabled ? 'Enabled' : 'Disabled'}\n**XP per Message:** ${serverConfig.xp.perMessage}\n**Levelup Channel:** ${levelupChannel ? levelupChannel.toString() : 'Current channel'}`, 
                inline: true 
            }
        )
        .setFooter({ text: `${guild.name} • ${guild.memberCount} members` })
        .setThumbnail(guild.iconURL())
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleResetConfig(interaction, guildConfig) {
    delete guildConfig[interaction.guild.id];
    await saveGuildConfig(guildConfig);

    const embed = new EmbedBuilder()
        .setTitle('🔄 Configuration Reset')
        .setColor(0xe74c3c)
        .setDescription('All server configuration has been reset to defaults.')
        .addFields(
            { name: '⚠️ Note', value: 'You will need to reconfigure your settings using `/setup` commands.', inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

// Export configuration loader for other modules
async function getGuildConfig(guildId) {
    const config = await loadGuildConfig();
    return config[guildId] || {
        modlog: null,
        tickets: { category: null, supportRole: null, enabled: true },
        automod: { enabled: false, warnThreshold: 3 },
        xp: { enabled: true, perMessage: 15, levelupChannel: null }
    };
}

module.exports.getGuildConfig = getGuildConfig;
