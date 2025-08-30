const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const appealLibrary = require('../../utils/appealLibrary');
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
        .addStringOption(option =>
            option.setName('server_id')
                .setDescription('Server ID (required for DMs)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deletedays = interaction.options.getInteger('deletedays') || 0;
        const silent = interaction.options.getBoolean('silent') || false;
        const serverIdRaw = interaction.options.getString('server_id');

        // Determine guild (from current guild or provided server_id for DMs)
        let guild;
        
        if (interaction.guild) {
            guild = interaction.guild;
        } else if (serverIdRaw) {
            try {
                guild = await interaction.client.guilds.fetch(serverIdRaw);
                if (!guild) {
                    return interaction.reply({
                        content: '❌ Server not found or bot is not in that server.',
                        flags: 64
                    });
                }
            } catch (error) {
                return interaction.reply({
                    content: '❌ Invalid server ID or bot is not in that server.',
                    flags: 64
                });
            }
        } else {
            return interaction.reply({
                content: '❌ When using moderation commands in DMs, please provide the server_id parameter.\nExample: `/ban user:@user server_id:123456789`',
                flags: 64
            });
        }

        // Defer reply for moderation actions
        await interaction.deferReply({ flags: silent ? 64 : 0 });

        try {
            const member = await guild.members.fetch(targetUser.id).catch(() => null);
            
            // Permission checks (skip hierarchy check in DMs)
            if (member && interaction.guild) {
                if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                    return interaction.editReply({ content: '❌ You cannot ban this member due to role hierarchy.' });
                }
                if (!member.bannable) {
                    return interaction.editReply({ content: '❌ I cannot ban this member.' });
                }
            }

            // Create case record
            const newCase = await createCase(guild.id, {
                type: 'ban',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                reason: reason,
                timestamp: new Date().toISOString(),
                appealable: true
            });

            // Auto-generate appeal code
            const appealCode = await appealLibrary.autoGenerateAppeal(
                guild.id,
                targetUser.id,
                'ban',
                interaction.user.id,
                reason
            );

            // Try to DM user before banning
            let dmSent = false;
            if (targetUser && !targetUser.bot) {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🔨 You have been banned')
                        .setColor(0xFF0000)
                        .addFields(
                            { name: '🏢 Server', value: guild.name, inline: true },
                            { name: '🆔 Server ID', value: guild.id, inline: true },
                            { name: '🎫 Appeal Code', value: `\`${appealCode}\``, inline: true },
                            { name: '📝 Reason', value: reason, inline: false },
                            { name: '📋 Appeal', value: `Use \`/appeal submit appeal_code:${appealCode} server_id:${guild.id}\` if you believe this is unfair`, inline: false }
                        )
                        .setTimestamp();

                    await targetUser.send({ embeds: [dmEmbed] });
                    dmSent = true;
                } catch (error) {
                    console.log(`Could not DM user ${targetUser.tag}: ${error.message}`);
                }
            }

            // Execute ban
            await guild.members.ban(targetUser, {
                deleteMessageDays: deletedays,
                reason: reason
            });

            // Log the action
            await webhookLogger.logModeration(guild, {
                type: 'ban',
                user: targetUser,
                moderator: interaction.user,
                reason: reason,
                caseId: newCase.caseId
            });

            // Create success embed
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔨 Member Banned')
                .addFields(
                    { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Case ID', value: newCase.caseId, inline: true },
                    { name: 'Server', value: `${guild.name}`, inline: true }
                )
                .setTimestamp();

            if (dmSent) {
                embed.setFooter({ text: 'User was notified via DM' });
            } else {
                embed.setFooter({ text: 'User could not be notified' });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Ban command error:', error);
            await interaction.editReply({ 
                content: '❌ Failed to ban the user. Please check my permissions.'
            });
        }
    },
};
