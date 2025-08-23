const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logEvent } = require('../../utils/logger');
const { isSuperuser } = require('../../utils/superuserManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('🗓️ Manually create log entries')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of log event')
                .setRequired(true)
                .addChoices(
                    { name: '🔨 Moderation', value: 'moderation' },
                    { name: '⚠️ Security Alert', value: 'security' },
                    { name: '🎫 Ticket Event', value: 'ticket' },
                    { name: '📢 Announcement', value: 'announcement' },
                    { name: '🛠️ Server Changes', value: 'server' },
                    { name: '📝 Custom Event', value: 'custom' }
                ))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Log message content')
                .setRequired(true)
                .setMaxLength(1000))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User related to this log (optional)')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel related to this log (optional)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        try {
            // Check permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild) && 
                !isSuperuser(interaction.user.id)) {
                return await interaction.reply({
                    content: '❌ You need **Manage Server** permissions to use this command.',
                    flags: 64
                });
            }

            const logType = interaction.options.getString('type');
            const message = interaction.options.getString('message');
            const targetUser = interaction.options.getUser('user');
            const targetChannel = interaction.options.getChannel('channel');

            // Create log embed
            const logEmbed = new EmbedBuilder()
                .setTitle('📝 Manual Log Entry')
                .setColor(getLogColor(logType))
                .addFields(
                    { name: '📋 Type', value: getLogTypeDisplay(logType), inline: true },
                    { name: '👤 Logged by', value: `${interaction.user}`, inline: true },
                    { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '💬 Message', value: message, inline: false }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Manual Log • ID: ${interaction.id}`,
                    iconURL: interaction.guild.iconURL() 
                });

            if (targetUser) {
                logEmbed.addFields({
                    name: '👤 Related User',
                    value: `${targetUser} (${targetUser.tag})`,
                    inline: true
                });
            }

            if (targetChannel) {
                logEmbed.addFields({
                    name: '📺 Related Channel',
                    value: `${targetChannel} (${targetChannel.name})`,
                    inline: true
                });
            }

            // Log to system
            await logEvent(interaction.guild, {
                type: 'MANUAL_LOG',
                executor: interaction.user,
                target: targetUser,
                channel: targetChannel,
                reason: `Manual ${logType} log: ${message}`,
                timestamp: new Date()
            });

            // Send confirmation
            await interaction.reply({
                content: '✅ **Log entry created successfully!**',
                embeds: [logEmbed],
                flags: 64
            });

        } catch (error) {
            console.error('Error in log command:', error);
            
            await interaction.reply({
                content: '❌ **Error:** Failed to create log entry. Please try again.',
                flags: 64
            }).catch(() => {});
        }
    }
};

function getLogColor(type) {
    const colors = {
        'moderation': '#FF6B6B', // Red
        'security': '#FF4757',   // Bright Red
        'ticket': '#3742FA',     // Blue
        'announcement': '#7C4DFF', // Purple
        'server': '#26A69A',     // Teal
        'custom': '#FFA726'      // Orange
    };
    return colors[type] || '#95A5A6';
}

function getLogTypeDisplay(type) {
    const displays = {
        'moderation': '🔨 Moderation Action',
        'security': '⚠️ Security Alert',
        'ticket': '🎫 Ticket Event',
        'announcement': '📢 Server Announcement',
        'server': '🛠️ Server Configuration',
        'custom': '📝 Custom Event'
    };
    return displays[type] || '📝 Unknown';
}
