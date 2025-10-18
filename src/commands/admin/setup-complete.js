const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { loadGuildConfig, saveGuildConfig } = require('../../utils/configManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-complete')
        .setDescription('🔧 Complete server setup wizard')
        .addSubcommand(subcommand =>
            subcommand
                .setName('logs')
                .setDescription('Setup logging channels')
                .addChannelOption(option =>
                    option
                        .setName('mod_logs')
                        .setDescription('Channel for moderation logs')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('appeal_logs')
                        .setDescription('Channel for appeal notifications')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('ticket_logs')
                        .setDescription('Channel for ticket transcripts')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('server_logs')
                        .setDescription('Channel for server events (joins, leaves, etc.)')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('appeals')
                .setDescription('Setup appeal system')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable appeals?')
                        .setRequired(true))
                .addChannelOption(option =>
                    option
                        .setName('review_channel')
                        .setDescription('Channel where appeals will be reviewed')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('verification')
                .setDescription('Setup verification system')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable verification?')
                        .setRequired(true))
                .addChannelOption(option =>
                    option
                        .setName('verify_channel')
                        .setDescription('Channel where users verify')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addRoleOption(option =>
                    option
                        .setName('verified_role')
                        .setDescription('Role to give after verification')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current server configuration'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('quick')
                .setDescription('Quick setup - automatically create all channels'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'logs':
                await handleLogsSetup(interaction);
                break;
            case 'appeals':
                await handleAppealsSetup(interaction);
                break;
            case 'verification':
                await handleVerificationSetup(interaction);
                break;
            case 'view':
                await handleViewConfig(interaction);
                break;
            case 'quick':
                await handleQuickSetup(interaction);
                break;
        }
    }
};

async function handleLogsSetup(interaction) {
    await interaction.deferReply({ flags: 64 });

    const modLogs = interaction.options.getChannel('mod_logs');
    const appealLogs = interaction.options.getChannel('appeal_logs');
    const ticketLogs = interaction.options.getChannel('ticket_logs');
    const serverLogs = interaction.options.getChannel('server_logs');

    const config = await loadGuildConfig(interaction.guild.id);

    if (modLogs) config.modLogChannel = modLogs.id;
    if (appealLogs) config.appealLogChannel = appealLogs.id;
    if (ticketLogs) config.ticketLogChannel = ticketLogs.id;
    if (serverLogs) config.serverLogChannel = serverLogs.id;

    await saveGuildConfig(interaction.guild.id, config);

    const embed = new EmbedBuilder()
        .setTitle('✅ Logging Channels Updated')
        .setColor('#00ff00')
        .addFields(
            { name: '👮 Mod Logs', value: modLogs ? `${modLogs}` : config.modLogChannel ? `<#${config.modLogChannel}>` : '❌ Not set', inline: true },
            { name: '📋 Appeal Logs', value: appealLogs ? `${appealLogs}` : config.appealLogChannel ? `<#${config.appealLogChannel}>` : '❌ Not set', inline: true },
            { name: '🎫 Ticket Logs', value: ticketLogs ? `${ticketLogs}` : config.ticketLogChannel ? `<#${config.ticketLogChannel}>` : '❌ Not set', inline: true },
            { name: '📊 Server Logs', value: serverLogs ? `${serverLogs}` : config.serverLogChannel ? `<#${config.serverLogChannel}>` : '❌ Not set', inline: true }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleAppealsSetup(interaction) {
    await interaction.deferReply({ flags: 64 });

    const enabled = interaction.options.getBoolean('enabled');
    const reviewChannel = interaction.options.getChannel('review_channel');

    const config = await loadGuildConfig(interaction.guild.id);
    config.appealsEnabled = enabled;
    if (reviewChannel) config.appealLogChannel = reviewChannel.id;

    await saveGuildConfig(interaction.guild.id, config);

    const embed = new EmbedBuilder()
        .setTitle('✅ Appeal System Updated')
        .setColor(enabled ? '#00ff00' : '#ff0000')
        .addFields(
            { name: '📊 Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '📋 Review Channel', value: reviewChannel ? `${reviewChannel}` : config.appealLogChannel ? `<#${config.appealLogChannel}>` : '❌ Not set', inline: true }
        )
        .setDescription(enabled ? 'Users can now appeal bans, warns, and other moderation actions.' : 'Appeals are disabled. Users cannot submit appeals.')
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleVerificationSetup(interaction) {
    await interaction.deferReply({ flags: 64 });

    const enabled = interaction.options.getBoolean('enabled');
    const verifyChannel = interaction.options.getChannel('verify_channel');
    const verifiedRole = interaction.options.getRole('verified_role');

    const config = await loadGuildConfig(interaction.guild.id);
    config.verificationEnabled = enabled;
    if (verifyChannel) config.verificationChannel = verifyChannel.id;
    if (verifiedRole) config.verifiedRole = verifiedRole.id;

    await saveGuildConfig(interaction.guild.id, config);

    const embed = new EmbedBuilder()
        .setTitle('✅ Verification System Updated')
        .setColor(enabled ? '#00ff00' : '#ff0000')
        .addFields(
            { name: '📊 Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '🔐 Verify Channel', value: verifyChannel ? `${verifyChannel}` : config.verificationChannel ? `<#${config.verificationChannel}>` : '❌ Not set', inline: true },
            { name: '✅ Verified Role', value: verifiedRole ? `${verifiedRole}` : config.verifiedRole ? `<@&${config.verifiedRole}>` : '❌ Not set', inline: true }
        )
        .setDescription(enabled ? 'New members must verify before accessing the server.' : 'Verification is disabled. All members have full access.')
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleViewConfig(interaction) {
    await interaction.deferReply({ flags: 64 });

    const config = await loadGuildConfig(interaction.guild.id);

    const embed = new EmbedBuilder()
        .setTitle('⚙️ Server Configuration')
        .setDescription(`Configuration for **${interaction.guild.name}**`)
        .setColor('#3498db')
        .addFields(
            { name: '📋 Appeals', value: config.appealsEnabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '🔐 Verification', value: config.verificationEnabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '\u200b', value: '\u200b', inline: true }
        )
        .setTimestamp();

    // Logging channels
    let logsText = '';
    logsText += `**Mod Logs:** ${config.modLogChannel ? `<#${config.modLogChannel}>` : '❌ Not set'}\n`;
    logsText += `**Appeal Logs:** ${config.appealLogChannel ? `<#${config.appealLogChannel}>` : '❌ Not set'}\n`;
    logsText += `**Ticket Logs:** ${config.ticketLogChannel ? `<#${config.ticketLogChannel}>` : '❌ Not set'}\n`;
    logsText += `**Server Logs:** ${config.serverLogChannel ? `<#${config.serverLogChannel}>` : '❌ Not set'}`;
    embed.addFields({ name: '📊 Logging Channels', value: logsText, inline: false });

    // Verification
    if (config.verificationEnabled) {
        let verifyText = '';
        verifyText += `**Channel:** ${config.verificationChannel ? `<#${config.verificationChannel}>` : '❌ Not set'}\n`;
        verifyText += `**Role:** ${config.verifiedRole ? `<@&${config.verifiedRole}>` : '❌ Not set'}`;
        embed.addFields({ name: '🔐 Verification', value: verifyText, inline: false });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleQuickSetup(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
        const guild = interaction.guild;
        const config = await loadGuildConfig(guild.id);

        // Create category
        const category = await guild.channels.create({
            name: '📋 Bot Logs',
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]
        });

        // Create channels
        const modLogs = await guild.channels.create({
            name: '👮-mod-logs',
            type: ChannelType.GuildText,
            parent: category.id,
            topic: 'Moderation action logs (bans, kicks, warns, etc.)'
        });

        const appealLogs = await guild.channels.create({
            name: '📋-appeal-logs',
            type: ChannelType.GuildText,
            parent: category.id,
            topic: 'Appeal submissions and reviews'
        });

        const ticketLogs = await guild.channels.create({
            name: '🎫-ticket-logs',
            type: ChannelType.GuildText,
            parent: category.id,
            topic: 'Ticket transcripts and logs'
        });

        const serverLogs = await guild.channels.create({
            name: '📊-server-logs',
            type: ChannelType.GuildText,
            parent: category.id,
            topic: 'Server events (joins, leaves, role changes, etc.)'
        });

        // Create verified role
        const verifiedRole = await guild.roles.create({
            name: '✅ Verified',
            color: '#00ff00',
            reason: 'Auto-created by bot setup'
        });

        // Update config
        config.modLogChannel = modLogs.id;
        config.appealLogChannel = appealLogs.id;
        config.ticketLogChannel = ticketLogs.id;
        config.serverLogChannel = serverLogs.id;
        config.verifiedRole = verifiedRole.id;
        config.appealsEnabled = true;
        config.verificationEnabled = false; // Disabled by default

        await saveGuildConfig(guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('✅ Quick Setup Complete!')
            .setDescription('All channels and roles have been created automatically.')
            .setColor('#00ff00')
            .addFields(
                { name: '📁 Category', value: `${category}`, inline: false },
                { name: '👮 Mod Logs', value: `${modLogs}`, inline: true },
                { name: '📋 Appeal Logs', value: `${appealLogs}`, inline: true },
                { name: '🎫 Ticket Logs', value: `${ticketLogs}`, inline: true },
                { name: '📊 Server Logs', value: `${serverLogs}`, inline: true },
                { name: '✅ Verified Role', value: `${verifiedRole}`, inline: true },
                { name: '\u200b', value: '\u200b', inline: true }
            )
            .addFields({
                name: '📝 Next Steps',
                value: '1. Move the category to your preferred position\n2. Enable verification: `/setup-complete verification enabled:true`\n3. Create verification channel: `/verify setup`\n4. Configure appeal questions: `/appeal-config edit-questions`',
                inline: false
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Quick setup error:', error);
        await interaction.editReply({
            content: `❌ Failed to complete quick setup: ${error.message}\n\nPlease check bot permissions and try again.`
        });
    }
}
