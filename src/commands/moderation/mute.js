const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const moderationManager = require('../../utils/moderationUtils');
const { createCase } = require('../../utils/caseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔇 Timeout a member from speaking in channels')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Mute duration in minutes (max 40320 = 28 days)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(40320))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('silent')
                .setDescription('Don\'t send DM to user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        // Defer reply for moderation actions
        await interaction.deferReply();

        // Check if user is server owner or has required permissions
        if (interaction.guild.ownerId !== interaction.user.id && 
            !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.editReply({
                content: '❌ You need the **Moderate Members** permission to use this command.'
            });
        }

        const targetUser = interaction.options.getUser('user');
        const durationMinutes = interaction.options.getInteger('duration') || 60; // Default 1 hour
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const silent = interaction.options.getBoolean('silent') || false;

        try {
            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            // Permission checks (skip for server owner)
            if (interaction.guild.ownerId !== interaction.user.id) {
                if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                    return interaction.reply({ content: '❌ You cannot mute this member due to role hierarchy.', ephemeral: true });
                }
            }
            
            if (!member.moderatable) {
                return interaction.reply({ content: '❌ I cannot mute this member.', ephemeral: true });
            }

            // Calculate timeout duration in milliseconds
            const timeoutDuration = durationMinutes * 60 * 1000;
            const durationText = `${durationMinutes}m`;

            // Create moderation case with proper case ID
            const muteCase = await createCase({
                type: 'mute',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: interaction.guild.id,
                reason: reason,
                expires: new Date(Date.now() + timeoutDuration).toISOString(),
                appealable: true
            });

            // Apply timeout
            await member.timeout(timeoutDuration, `${reason} | Moderator: ${interaction.user.tag} | Case #${muteCase.caseId}`);

            // Send DM to user (unless silent)
            let dmSent = false;
            if (!silent) {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🔇 You have been muted')
                        .setColor(0xff9900)
                        .addFields(
                            { name: '🏢 Server', value: interaction.guild.name, inline: true },
                            { name: '⏱️ Duration', value: durationText, inline: true },
                            { name: '📝 Reason', value: reason, inline: false },
                            { name: '🆔 Case ID', value: muteCase.caseId, inline: true },
                            { name: '📋 Appeal', value: 'Use `/appeal submit` with your case ID if you believe this is unfair', inline: false }
                        )
                        .setTimestamp();
                    
                    await targetUser.send({ embeds: [dmEmbed] });
                    dmSent = true;
                } catch (error) {
                    console.log(`Could not DM user ${targetUser.tag}: ${error.message}`);
                    dmSent = false;
                }
            }

            // Create response embed with real information
            const expiresAt = Date.now() + timeoutDuration;
            const embed = new EmbedBuilder()
                .setTitle('🔇 Member Muted')
                .setColor(0xff9900)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: muteCase.caseId, inline: true },
                    { name: '⏱️ Duration', value: durationText, inline: true },
                    { name: '🕐 Expires', value: `<t:${Math.floor(expiresAt / 1000)}:R>`, inline: true },
                    { name: '💬 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Log to mod channel if configured
            const modLogChannelId = process.env.MOD_LOG_CHANNEL_ID;
            if (modLogChannelId) {
                const modLogChannel = interaction.guild.channels.cache.get(modLogChannelId);
                if (modLogChannel) {
                    await modLogChannel.send({ embeds: [embed] });
                }
            }

        } catch (error) {
            console.error('Mute command error:', error);
            await interaction.reply({
                content: '❌ Failed to mute the user. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};

function parseDuration(duration) {
    const regex = /^(\d+)([smhd])$/;
    const match = duration.match(regex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };
    
    const result = value * multipliers[unit];
    return result > 2419200000 ? 2419200000 : result; // Max 28 days
}
