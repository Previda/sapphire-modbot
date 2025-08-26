const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createCase } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');

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

            // Create case
            const newCase = await createCase({
                type: 'ban',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: interaction.guild.id,
                reason: reason,
                status: 'active',
                appealable: true,
                duration: null
            });

            // Send DM to user (unless silent)
            let dmSent = false;
            if (!silent) {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🔨 You have been banned')
                        .setColor(0xff0000)
                        .addFields(
                            { name: '🏢 Server', value: interaction.guild.name, inline: true },
                            { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                            { name: '⏱️ Duration', value: 'Permanent', inline: true },
                            { name: '📝 Reason', value: reason, inline: false },
                            { name: '📋 Appeal', value: `Use \`/appeal submit case_id:${newCase.caseId}\` if you believe this is unfair`, inline: false }
                        )
                        .setTimestamp();

                    await targetUser.send({ embeds: [dmEmbed] });
                    dmSent = true;
                } catch (error) {
                    console.log(`Could not DM user ${targetUser.tag}: ${error.message}`);
                }
            }

            // Execute the ban
            await interaction.guild.bans.create(targetUser.id, { 
                reason: `${reason} | Moderator: ${interaction.user.tag} | Case: ${newCase.caseId}`,
                deleteMessageDays: deletedays 
            });

            // Create response embed
            const embed = new EmbedBuilder()
                .setTitle('🔨 Member Banned')
                .setColor(0xff0000)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag}\n\`${targetUser.id}\``, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '⏱️ Duration', value: 'Permanent', inline: true },
                    { name: '🗑️ Delete Messages', value: `${deletedays} days`, inline: true },
                    { name: '💬 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            embed.addFields({ name: '🗑️ Messages Deleted', value: `${deletedays} days`, inline: true });

            await interaction.reply({ embeds: [embed] });

            // Log via webhook system
            await webhookLogger.logModAction(interaction.guild.id, 'ban', {
                targetTag: targetUser.tag,
                targetId: targetUser.id,
                moderatorTag: interaction.user.tag,
                moderatorId: interaction.user.id,
                caseId: newCase.caseId,
                reason: reason,
                duration: 'Permanent'
            });

            // Fallback: Log to mod channel if configured
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
