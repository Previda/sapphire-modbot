const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const appealLibrary = require('../../utils/appealLibrary');
const { createCase } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');
const dashboardLogger = require('../../utils/dashboardLogger');
const { ModernEmbedBuilder } = require('../../utils/embedBuilder');

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
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

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
            // Log command usage to dashboard
            await dashboardLogger.logCommand('ban', interaction.user, guild, {
                target: `${targetUser.tag} (${targetUser.id})`,
                reason: reason,
                deletedays: deletedays,
                silent: silent
            });
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

            // Check if appeals are enabled
            const { loadGuildConfig } = require('../../utils/configManager');
            const config = await loadGuildConfig(guild.id);
            const appealsEnabled = config.appealsEnabled !== false; // Default to true if not set
            
            let appealCode = null;
            if (appealsEnabled) {
                // Auto-generate appeal code
                appealCode = await appealLibrary.autoGenerateAppeal(
                    guild.id,
                    targetUser.id,
                    'ban',
                    interaction.user.id,
                    reason
                );
            }

            // Try to DM user before banning
            let dmSent = false;
            let dmFailReason = '';
            if (targetUser && !targetUser.bot) {
                try {
                    const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
                    
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🔨 You have been banned')
                        .setColor(0xFF0000)
                        .addFields(
                            { name: '🏢 Server', value: guild.name, inline: true },
                            { name: '🆔 Server ID', value: guild.id, inline: true },
                            { name: '📝 Reason', value: reason, inline: false }
                        )
                        .setTimestamp();
                    
                    const components = [];
                    
                    if (appealsEnabled && appealCode) {
                        dmEmbed.addFields(
                            { name: '🎫 Appeal Code', value: `\`${appealCode}\``, inline: true },
                            { name: '📋 How to Appeal', value: `Click the button below to submit an appeal:`, inline: false }
                        );
                        
                        const appealButton = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`appeal_start_${appealCode}`)
                                    .setLabel('Submit Appeal')
                                    .setEmoji('📝')
                                    .setStyle(ButtonStyle.Primary)
                            );
                        components.push(appealButton);
                    } else {
                        dmEmbed.addFields({
                            name: '📋 Appeals',
                            value: '❌ Appeals are currently disabled on this server.',
                            inline: false
                        });
                    }

                    await targetUser.send({ embeds: [dmEmbed], components });
                    dmSent = true;
                } catch (error) {
                    console.log(`Could not DM user ${targetUser.tag}: ${error.message}`);
                    if (error.code === 50007) {
                        dmFailReason = 'User has DMs disabled or doesn\'t share a server with the bot';
                    } else {
                        dmFailReason = error.message;
                    }
                }
            }

            // Execute ban
            await guild.members.ban(targetUser, {
                deleteMessageDays: deletedays,
                reason: reason
            });

            // Log the action
            await webhookLogger.logModAction(guild.id, 'ban', {
                targetTag: targetUser.tag,
                targetId: targetUser.id,
                moderatorTag: interaction.user.tag,
                moderatorId: interaction.user.id,
                caseId: newCase.caseId,
                reason: reason
            });

            // Create success embed using ModernEmbedBuilder
            const embed = ModernEmbedBuilder.moderation('ban', {
                user: targetUser,
                moderator: interaction.user,
                caseId: newCase.caseId,
                reason: reason,
                dmSent: dmSent,
                appealCode: appealsEnabled ? appealCode : null,
                footer: dmSent 
                    ? '✅ User was notified via DM' 
                    : `❌ Could not DM user: ${dmFailReason || 'Unknown reason'}`
            });

            // Add appeal info if DM failed
            if (!dmSent && appealsEnabled && appealCode) {
                embed.addFields({ 
                    name: '⚠️ Appeal Info', 
                    value: `User has DMs disabled. Appeal code: \`${appealCode}\`\nThey can appeal using: \`/appeal submit appeal_code:${appealCode}\``, 
                    inline: false 
                });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Ban command error:', error);
            await dashboardLogger.logError(error, interaction);
            
            let errorMessage = '❌ Failed to ban the user.\n\n';
            
            if (error.code === 50013) {
                errorMessage += '**Missing Permissions**: I need the "Ban Members" permission.\n';
                errorMessage += '**Fix**: Go to Server Settings → Roles → My Role → Enable "Ban Members"';
            } else if (error.code === 50001) {
                errorMessage += '**Missing Access**: I cannot access this user.\n';
                errorMessage += '**Fix**: Make sure my role is higher than the target user\'s role.';
            } else if (error.message.includes('hierarchy')) {
                errorMessage += '**Role Hierarchy Issue**: My role is not high enough.\n';
                errorMessage += '**Fix**: Move my role above the target user\'s highest role in Server Settings → Roles.';
            } else {
                errorMessage += `**Error**: ${error.message}\n`;
                errorMessage += '**Tip**: Use \`/fix-permissions\` to check bot permissions.';
            }
            
            await interaction.editReply({ 
                content: errorMessage
            });
        }
    },
};
