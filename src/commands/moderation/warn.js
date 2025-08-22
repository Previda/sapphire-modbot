const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const moderationManager = require('../../utils/moderationUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('⚠️ Warn a member for rule violations')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('silent')
                .setDescription('Don\'t send DM to user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const silent = interaction.options.getBoolean('silent') || false;

        try {
            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            // Check if user is in server (optional for warnings)
            if (member) {
                // Permission checks for in-server warnings
                if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                    return interaction.reply({ content: '❌ You cannot warn this member due to role hierarchy.', ephemeral: true });
                }
            }

            // Create moderation case
            const moderationCase = moderationManager.createCase({
                type: 'warn',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: interaction.guild.id,
                reason: reason,
                guildName: interaction.guild.name,
                moderatorTag: interaction.user.tag,
                userTag: targetUser.tag,
                appealable: true
            });

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

            // Add warning-specific information
            embed.addFields({
                name: '📝 Note',
                value: member ? 'User is in server and has been notified.' : 'User is not in server but warning has been logged.',
                inline: false
            });

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
            console.error('Warn command error:', error);
            await interaction.reply({
                content: '❌ Failed to warn the user. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};
