const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCase } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('⏰ Remove timeout from a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to remove timeout from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for removing the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Defer reply for moderation actions
        await interaction.deferReply();

        try {
            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({ 
                    content: '❌ User not found in this server.', 
                    ephemeral: true 
                });
            }

            // Check if user is actually timed out
            if (!member.isCommunicationDisabled()) {
                return interaction.reply({ 
                    content: '❌ This member is not currently timed out.', 
                    ephemeral: true 
                });
            }

            // Permission checks
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ content: '❌ You cannot untimeout this member due to role hierarchy.', ephemeral: true });
            }
            if (!member.moderatable) {
                return interaction.reply({ content: '❌ I cannot modify this member\'s timeout.', ephemeral: true });
            }

            // Create case
            const newCase = await createCase({
                type: 'untimeout',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: interaction.guild.id,
                reason: reason,
                status: 'active',
                appealable: false
            });

            // Remove the timeout
            await member.timeout(null, `${reason} | Moderator: ${interaction.user.tag} | Case: ${newCase.caseId}`);

            // Create response embed
            const embed = new EmbedBuilder()
                .setTitle('✅ Timeout Removed')
                .setColor(0x00ff00)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag}\n\`${targetUser.id}\``, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log to webhook if configured
            await webhookLogger.logModAction(interaction.guild.id, 'untimeout', {
                targetTag: targetUser.tag,
                targetId: targetUser.id,
                moderatorTag: interaction.user.tag,
                moderatorId: interaction.user.id,
                caseId: newCase.caseId,
                reason: reason
            });

            // Send DM to user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('✅ Your timeout has been removed')
                    .setColor(0x00ff00)
                    .addFields(
                        { name: '🏢 Server', value: interaction.guild.name, inline: true },
                        { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '🎉 Status', value: 'You can now participate in chat again!', inline: false }
                    )
                    .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log(`Could not DM user ${targetUser.tag}: ${error.message}`);
            }

            // Log to mod channel if configured
            const modLogChannelId = process.env.MOD_LOG_CHANNEL_ID;
            if (modLogChannelId) {
                const modLogChannel = interaction.guild.channels.cache.get(modLogChannelId);
                if (modLogChannel) {
                    await modLogChannel.send({ embeds: [embed] });
                }
            }

        } catch (error) {
            console.error('Untimeout command error:', error);
            await interaction.editReply({
                content: '❌ Failed to remove timeout. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};
