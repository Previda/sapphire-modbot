const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const moderationManager = require('../../utils/moderationUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔇 Timeout a member from speaking in channels')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Mute duration (e.g., 10m, 1h, 1d, max 28d)')
                .setRequired(false))
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
        const targetUser = interaction.options.getUser('user');
        const duration = interaction.options.getString('duration') || '1h';
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

            // Permission checks
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ content: '❌ You cannot mute this member due to role hierarchy.', ephemeral: true });
            }
            if (!member.moderatable) {
                return interaction.reply({ content: '❌ I cannot mute this member.', ephemeral: true });
            }

            // Calculate timeout duration
            const timeoutDuration = parseDuration(duration);
            if (!timeoutDuration) {
                return interaction.reply({
                    content: '❌ Invalid duration format. Use: 10s, 5m, 1h, 2d, etc. (max 28 days)',
                    ephemeral: true
                });
            }

            // Create moderation case
            const moderationCase = moderationManager.createCase({
                type: 'mute',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: interaction.guild.id,
                reason: `${reason} (Duration: ${duration})`,
                duration: duration,
                guildName: interaction.guild.name,
                moderatorTag: interaction.user.tag,
                userTag: targetUser.tag,
                appealable: true
            });

            // Apply timeout
            await member.timeout(timeoutDuration, `${reason} | Moderator: ${interaction.user.tag} | Case #${moderationCase.caseId}`);

            // Send DM to user (unless silent)
            let dmSent = false;
            if (!silent) {
                dmSent = await moderationManager.sendDM(targetUser, moderationCase, interaction.client);
                moderationManager.updateCase(moderationCase.caseId, { dmSent });
            }

            // Create response embed
            const embed = moderationManager.createModerationEmbed(
                { ...moderationCase, dmSent },
                interaction.guild,
                interaction.user,
                targetUser
            );

            // Add mute-specific information
            const expiresAt = Date.now() + timeoutDuration;
            embed.addFields(
                { name: '⏱️ Duration', value: duration, inline: true },
                { name: '🕐 Expires', value: `<t:${Math.floor(expiresAt / 1000)}:R>`, inline: true }
            );

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
