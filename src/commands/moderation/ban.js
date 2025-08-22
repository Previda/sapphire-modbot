const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const moderationManager = require('../../utils/moderationUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 Ban a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('deletedays')
                .setDescription('Days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('silent')
                .setDescription('Don\'t send DM to user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deletedays = interaction.options.getInteger('deletedays') || 0;
        const silent = interaction.options.getBoolean('silent') || false;

        try {
            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
            
            // Permission checks
            if (member) {
                if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                    return interaction.reply({ content: '❌ You cannot ban this member due to role hierarchy.', ephemeral: true });
                }
                if (!member.bannable) {
                    return interaction.reply({ content: '❌ I cannot ban this member.', ephemeral: true });
                }
            }

            // Create moderation case
            const moderationCase = moderationManager.createCase({
                type: 'ban',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: interaction.guild.id,
                reason: reason,
                deleteMessageDays: deletedays,
                guildName: interaction.guild.name,
                moderatorTag: interaction.user.tag,
                userTag: targetUser.tag,
                appealable: true
            });

            // Execute the ban
            await interaction.guild.bans.create(targetUser.id, { 
                reason: `${reason} | Moderator: ${interaction.user.tag} | Case #${moderationCase.caseId}`,
                deleteMessageDays: deletedays 
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

            embed.addFields({ name: '🗑️ Messages Deleted', value: `${deletedays} days`, inline: true });

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
            console.error('Ban command error:', error);
            await interaction.reply({ 
                content: '❌ Failed to ban the user. Please check my permissions.', 
                ephemeral: true 
            });
        }
    },
};
