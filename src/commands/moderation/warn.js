const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCase } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');
const appealLibrary = require('../../utils/appealLibrary');
const { canModerate } = require('../../utils/permissionChecker');

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

        // Defer reply for moderation actions
        await interaction.deferReply({ ephemeral: silent });

        try {
            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            // Check if user is in server (optional for warnings)
            if (member) {
                // Permission checks for in-server warnings
                const permCheck = canModerate(interaction.member, member, interaction.guild);
                if (!permCheck.allowed) {
                    return interaction.editReply({ content: permCheck.reason });
                }
            }

            // Create case
            const newCase = await createCase(interaction.guild.id, {
                type: 'warn',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                reason: reason,
                status: 'active',
                appealable: true
            });

            // Check if appeals are enabled
            const { loadGuildConfig } = require('../../utils/configManager');
            const config = await loadGuildConfig(interaction.guild.id);
            const appealsEnabled = config.appealsEnabled !== false;
            
            let appealCode = null;
            if (appealsEnabled) {
                // Auto-generate appeal code
                appealCode = await appealLibrary.autoGenerateAppeal(
                    interaction.guild.id,
                    targetUser.id,
                    'warn',
                    interaction.user.id,
                    reason
                );
            }

            // Send DM to user (unless silent)
            let dmSent = false;
            if (!silent) {
                try {
                    const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
                    
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('⚠️ You have been warned')
                        .setColor(0xffff00)
                        .addFields(
                            { name: '🏢 Server', value: interaction.guild.name, inline: true },
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
                }
            }

            // Create response embed
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Member Warned')
                .setColor(0xffff00)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag}\n\`${targetUser.id}\``, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '💬 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            // Add warning-specific information
            embed.addFields({
                name: '📝 Note',
                value: member ? 'User is in server and has been notified.' : 'User is not in server but warning has been logged.',
                inline: false
            });

            await interaction.editReply({ embeds: [embed] });

            // Log to webhook if configured
            await webhookLogger.logModAction(interaction.guild.id, 'warn', {
                targetTag: targetUser.tag,
                targetId: targetUser.id,
                moderatorTag: interaction.user.tag,
                moderatorId: interaction.user.id,
                caseId: newCase.caseId,
                reason: reason
            });

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
            await interaction.editReply({
                content: '❌ Failed to warn the user. Please check my permissions.'
            });
        }
    }
};
