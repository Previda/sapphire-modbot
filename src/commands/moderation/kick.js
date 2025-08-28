const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createCase } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');

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

        // Defer reply for moderation actions
        await interaction.deferReply({ ephemeral: silent });

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

            // Create case
            const newCase = await createCase({
                type: 'kick',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: interaction.guild.id,
                reason: reason,
                status: 'active',
                appealable: true
            });

            // Send DM to user (unless silent)
            let dmSent = false;
            if (!silent) {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🦵 You have been kicked')
                        .setColor(0xff9900)
                        .addFields(
                            { name: '🏢 Server', value: interaction.guild.name, inline: true },
                            { name: '🆔 Case ID', value: newCase.caseId, inline: true },
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

            // Execute the kick
            await member.kick(`${reason} | Moderator: ${interaction.user.tag} | Case: ${newCase.caseId}`);

            // Create response embed
            const embed = new EmbedBuilder()
                .setTitle('🦵 Member Kicked')
                .setColor(0xff9900)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag}\n\`${targetUser.id}\``, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '💬 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Log via webhook system
            await webhookLogger.logModAction(interaction.guild.id, 'kick', {
                targetTag: targetUser.tag,
                targetId: targetUser.id,
                moderatorTag: interaction.user.tag,
                moderatorId: interaction.user.id,
                caseId: newCase.caseId,
                reason: reason
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
            console.error('Kick command error:', error);
            await interaction.reply({
                content: '❌ Failed to kick the user. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};
