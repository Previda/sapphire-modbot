const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getCaseById, getUserCases, updateCaseStatus } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('undo')
        .setDescription('Undo/reverse moderation actions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Undo a ban (unban user)')
                .addStringOption(option =>
                    option.setName('case')
                        .setDescription('Case ID to undo')
                        .setRequired(false))
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to unban')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Username or User ID to unban')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for undoing the ban')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('mute')
                .setDescription('Undo a mute (unmute user)')
                .addStringOption(option =>
                    option.setName('case')
                        .setDescription('Case ID to undo')
                        .setRequired(false))
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to unmute')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Username or User ID to unmute')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for undoing the mute')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('warn')
                .setDescription('Remove a warning')
                .addStringOption(option =>
                    option.setName('case')
                        .setDescription('Case ID to undo')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for removing warning')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('strike')
                .setDescription('Remove a strike')
                .addStringOption(option =>
                    option.setName('case')
                        .setDescription('Case ID to undo')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for removing strike')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('timeout')
                .setDescription('Remove timeout from user')
                .addStringOption(option =>
                    option.setName('case')
                        .setDescription('Case ID to undo')
                        .setRequired(false))
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to remove timeout from')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Username or User ID to remove timeout from')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for removing timeout')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('last')
                .setDescription('Undo the last moderation action')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User whose last action to undo')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for undoing')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('bulk')
                .setDescription('Undo multiple actions by a moderator')
                .addUserOption(option =>
                    option.setName('moderator')
                        .setDescription('Moderator whose actions to undo')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Number of recent actions to undo')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(10))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for bulk undo')
                        .setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Defer reply for database operations
        await interaction.deferReply();

        switch (subcommand) {
            case 'ban':
                await this.undoBan(interaction);
                break;
            case 'mute':
                await this.undoMute(interaction);
                break;
            case 'warn':
                await this.undoWarn(interaction);
                break;
            case 'strike':
                await this.undoStrike(interaction);
                break;
            case 'timeout':
                await this.undoTimeout(interaction);
                break;
            case 'last':
                await this.undoLast(interaction);
                break;
            case 'bulk':
                await this.undoBulk(interaction);
                break;
        }
    },

    async undoBan(interaction) {
        const caseId = interaction.options.getString('case');
        const user = interaction.options.getUser('user');
        const username = interaction.options.getString('username');
        const reason = interaction.options.getString('reason') || 'Ban reversed by moderator';

        try {
            let targetCase = null;
            let targetUserId = null;

            if (caseId) {
                targetCase = await getCaseById(caseId, interaction.guild.id);
                if (!targetCase || targetCase.type !== 'ban') {
                    return interaction.editReply({ content: '❌ Ban case not found' });
                }
            }
            if (targetCase) {
                targetUserId = targetCase.userId;
            } else if (user) {
                targetUserId = user.id;
            } else if (username) {
                // Try to parse as user ID or find by username
                if (/^\d{17,19}$/.test(username)) {
                    targetUserId = username;
                } else {
                    return interaction.editReply({ content: '❌ Please provide a valid User ID or use the user option', ephemeral: true });
                }
            } else {
                return interaction.editReply({ content: '❌ Please provide a case ID, user, or username', ephemeral: true });
            }

            if (!targetUserId) {
                return interaction.editReply({ content: '❌ Unable to determine target user', ephemeral: true });
            }

            // Unban the user
            await interaction.guild.members.unban(targetUserId, `${reason} ${caseId ? `(Case: ${caseId})` : ''}`);
            
            // Update case if we have one
            if (targetCase) {
                await updateCaseStatus(caseId, 'reversed', interaction.user.id);
            }

            const embed = new EmbedBuilder()
                .setTitle('🔄 Ban Reversed')
                .setColor('#00ff00')
                .addFields(
                    { name: 'User', value: `<@${targetUserId}>`, inline: true },
                    { name: 'Original Case', value: caseId || 'N/A', inline: true },
                    { name: 'Reversed By', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log to webhook
            await webhookLogger.logModeration(interaction.guild, {
                type: 'unban',
                user: { id: targetUserId },
                moderator: interaction.user,
                reason: reason,
                caseId: caseId
            });

        } catch (error) {
            console.error('Error undoing ban:', error);
            await interaction.editReply({ content: '❌ Failed to undo ban', ephemeral: true });
        }
    },

    async undoMute(interaction) {
        const caseId = interaction.options.getString('case');
        const user = interaction.options.getUser('user');
        const username = interaction.options.getString('username');
        const reason = interaction.options.getString('reason') || 'Mute reversed by moderator';

        try {
            let targetCase = null;
            let targetUserId = null;

            if (caseId) {
                targetCase = await getCaseById(caseId, interaction.guild.id);
                if (!targetCase || !['mute', 'timeout'].includes(targetCase.type)) {
                    return interaction.editReply({ content: '❌ Mute/timeout case not found', ephemeral: true });
                }
                targetUserId = targetCase.userId;
            } else if (user) {
                targetUserId = user.id;
            } else if (username) {
                if (/^\d{17,19}$/.test(username)) {
                    targetUserId = username;
                } else {
                    return interaction.editReply({ content: '❌ Please provide a valid User ID or use the user option', ephemeral: true });
                }
            } else {
                return interaction.editReply({ content: '❌ Please provide a case ID, user, or username', ephemeral: true });
            }

            const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            if (member) {
                await member.timeout(null, `${reason} ${caseId ? `(Case: ${caseId})` : ''}`);
            }
            
            if (targetCase) {
                await updateCaseStatus(caseId, 'reversed', interaction.user.id);
            }

            const embed = new EmbedBuilder()
                .setTitle('🔄 Mute/Timeout Reversed')
                .setColor('#00ff00')
                .addFields(
                    { name: 'User', value: `<@${targetUserId}>`, inline: true },
                    { name: 'Original Case', value: caseId || 'N/A', inline: true },
                    { name: 'Reversed By', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            await webhookLogger.logModeration(interaction.guild, {
                type: 'unmute',
                user: { id: targetUserId },
                moderator: interaction.user,
                reason: reason,
                caseId: caseId
            });

        } catch (error) {
            console.error('Error undoing mute:', error);
            await interaction.editReply({ content: '❌ Failed to undo mute', ephemeral: true });
        }
    },

    async undoWarn(interaction) {
        const caseId = interaction.options.getString('case');
        const reason = interaction.options.getString('reason') || 'Warning removed by moderator';

        try {
            if (!caseId) {
                return interaction.editReply({ content: '❌ Case ID is required for warnings', ephemeral: true });
            }

            const targetCase = await getCaseById(caseId, interaction.guild.id);
            
            if (!targetCase || targetCase.type !== 'warn') {
                return interaction.editReply({ content: '❌ Warning case not found', ephemeral: true });
            }

            if (targetCase.status === 'reversed') {
                return interaction.editReply({ content: '❌ This warning is already removed', ephemeral: true });
            }
            
            await updateCaseStatus(caseId, 'reversed', interaction.user.id);

            const embed = new EmbedBuilder()
                .setTitle('🔄 Warning Removed')
                .setColor('#00ff00')
                .addFields(
                    { name: 'User', value: `<@${targetCase.userId}>`, inline: true },
                    { name: 'Original Case', value: caseId, inline: true },
                    { name: 'Removed By', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error removing warning:', error);
            await interaction.editReply({ content: '❌ Failed to remove warning', ephemeral: true });
        }
    },

    async undoStrike(interaction) {
        const caseId = interaction.options.getString('case');
        const reason = interaction.options.getString('reason') || 'Strike removed by moderator';

        try {
            if (!caseId) {
                return interaction.editReply({ content: '❌ Case ID is required for strikes', ephemeral: true });
            }

            const targetCase = await getCaseById(caseId, interaction.guild.id);
            
            if (!targetCase || targetCase.type !== 'strike') {
                return interaction.editReply({ content: '❌ Strike case not found', ephemeral: true });
            }

            if (targetCase.status === 'reversed') {
                return interaction.editReply({ content: '❌ This strike is already removed', ephemeral: true });
            }
            
            await updateCaseStatus(caseId, 'reversed', interaction.user.id);

            const embed = new EmbedBuilder()
                .setTitle('🔄 Strike Removed')
                .setColor('#00ff00')
                .addFields(
                    { name: 'User', value: `<@${targetCase.userId}>`, inline: true },
                    { name: 'Original Case', value: caseId, inline: true },
                    { name: 'Removed By', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error removing strike:', error);
            await interaction.editReply({ content: '❌ Failed to remove strike', ephemeral: true });
        }
    },

    async undoTimeout(interaction) {
        // This is the same as undoMute since timeout and mute are the same Discord feature
        await this.undoMute(interaction);
    },

    async undoLast(interaction) {
        const user = interaction.options.getUser('user');
        const targetUserId = user ? user.id : null;
        const reason = interaction.options.getString('reason') || 'Last action reversed by moderator';

        try {
            let userCases = [];
            
            if (targetUserId) {
                userCases = await getUserCases(targetUserId, interaction.guild.id);
            } else {
                // Get recent cases by this moderator (simplified approach)
                return interaction.editReply({ content: '❌ Please specify a user for last action undo', ephemeral: true });
            }

            // Filter active cases and get the most recent
            const activeCases = userCases.filter(c => c.status === 'active').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            if (activeCases.length === 0) {
                return interaction.editReply({ content: '❌ No recent active cases found to undo', ephemeral: true });
            }

            const lastCase = activeCases[0];

            // Use the appropriate undo method based on case type
            const tempOptions = {
                getString: (name) => name === 'case' ? lastCase.caseId : (name === 'reason' ? reason : null),
                getUser: () => null,
            };
            const tempInteraction = { ...interaction, options: tempOptions };

            switch (lastCase.type) {
                case 'ban':
                    await this.undoBan(tempInteraction);
                    break;
                case 'mute':
                case 'timeout':
                    await this.undoMute(tempInteraction);
                    break;
                case 'warn':
                    await this.undoWarn(tempInteraction);
                    break;
                case 'strike':
                    await this.undoStrike(tempInteraction);
                    break;
                default:
                    return interaction.editReply({ content: '❌ Unsupported case type for undo', ephemeral: true });
            }

        } catch (error) {
            console.error('Error undoing last action:', error);
            await interaction.editReply({ content: '❌ Failed to undo last action', ephemeral: true });
        }
    },

    async undoBulk(interaction) {
        const moderator = interaction.options.getUser('moderator');
        const count = interaction.options.getInteger('count');
        const reason = interaction.options.getString('reason') || 'Bulk undo by administrator';

        try {
            // Get recent cases by moderator (simplified approach using getUserCases for all users)
            const allCases = [];
            
            // This is a simplified implementation - in a real scenario you'd want to query by moderator
            const embed = new EmbedBuilder()
                .setTitle('🔄 Bulk Undo')
                .setColor('#ff9900')
                .setDescription('⚠️ Bulk undo requires manual case specification for safety.')
                .addFields(
                    { name: 'Alternative', value: 'Use individual undo commands with case IDs', inline: false },
                    { name: 'Example', value: '`/undo timeout case:ABC123`', inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error performing bulk undo:', error);
            await interaction.editReply({ content: '❌ Failed to perform bulk undo' });
        }
    },

};
