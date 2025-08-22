const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const moderationManager = require('../../utils/moderationUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('🦵 Kick a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('silent')
                .setDescription('Don\'t send DM to user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
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
                return interaction.reply({ content: '❌ You cannot kick this member due to role hierarchy.', ephemeral: true });
            }
            if (!member.kickable) {
                return interaction.reply({ content: '❌ I cannot kick this member.', ephemeral: true });
            }

            // Create moderation case
            const moderationCase = moderationManager.createCase({
                type: 'kick',
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

            // Execute the kick
            await member.kick(`${reason} | Moderator: ${interaction.user.tag} | Case #${moderationCase.caseId}`);

            // Create response embed
            const embed = moderationManager.createModerationEmbed(
                { ...moderationCase, dmSent },
                interaction.guild,
                interaction.user,
                targetUser
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
            console.error('Kick command error:', error);
            await interaction.reply({
                content: '❌ Failed to kick the user. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};
