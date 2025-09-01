const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { createPunishment, getPunishments, updatePunishment } = require('../../utils/punishmentUtils');
const { getCaseById, appealCase } = require('../../utils/caseManager');
const { loadConfig, saveConfig } = require('../../utils/configManager');
const appealLibrary = require('../../utils/appealLibrary');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('Appeal system commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('submit')
                .setDescription('Submit an appeal for a case')
                .addStringOption(option =>
                    option
                        .setName('appeal_code')
                        .setDescription('The appeal code provided when you were moderated')
                        .setRequired(true)
                ).addStringOption(option =>
                    option.setName('server_id')
                        .setDescription('Server ID (required for DMs)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check the status of your appeal')
                .addStringOption(option =>
                    option.setName('case_id')
                        .setDescription('Case ID to check')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('review')
                .setDescription('Review a submitted appeal (Admin only)')
                .addStringOption(option =>
                    option
                        .setName('appeal_code')
                        .setDescription('The appeal code to review')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup appeal system channel (Admin only)')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel for appeal reviews')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('require_reason')
                        .setDescription('Require reason for approve/reject decisions')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List appeals by status (Admin only)')
                .addStringOption(option =>
                    option
                        .setName('status')
                        .setDescription('Filter by status')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Pending', value: 'pending' },
                            { name: 'Under Review', value: 'under_review' },
                            { name: 'Approved', value: 'approved' },
                            { name: 'Rejected', value: 'rejected' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('Configure appeal system settings (Admin only)')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Settings action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Enable', value: 'enable' },
                            { name: 'Disable', value: 'disable' },
                            { name: 'Set Category', value: 'category' },
                            { name: 'View Settings', value: 'view' }
                        ))
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('Appeal category channel')
                        .setRequired(false))),

    async execute(interaction) {
        let subcommand;
        try {
            subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'submit':
                await handleSubmitAppeal(interaction);
                break;
            case 'status':
                await handleAppealStatus(interaction);
                break;
            case 'review':
                await handleReviewAppeal(interaction);
                break;
            case 'setup':
                await handleAppealSetup(interaction);
                break;
            case 'list':
                await handleAppealList(interaction);
                break;
            case 'settings':
                await handleAppealSettings(interaction);
                break;
        }
    }
};

async function handleSubmitAppeal(interaction) {
    const appealCode = interaction.options.getString('appeal_code');
    const serverIdRaw = interaction.options.getString('server_id');
    
    if (!appealCode) {
        return interaction.reply({
            content: '❌ Please provide an appeal code.',
            flags: 64
        });
    }
    
    // Determine guild ID (from current guild or provided server_id for DMs)
    let guildId;
    let guild;
    
    if (interaction.guild) {
        // Command used in server
        guildId = interaction.guild.id;
        guild = interaction.guild;
    } else if (serverIdRaw) {
        // Command used in DM with server_id provided
        guildId = serverIdRaw;
        try {
            guild = await interaction.client.guilds.fetch(guildId);
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
        // Command used in DM without server_id
        return interaction.reply({
            content: '❌ When using appeals in DMs, please provide the server_id parameter.\nExample: `/appeal submit appeal_code:ABC12345 server_id:123456789`',
            flags: 64
        });
    }
    
    // Validate appeal
    const validation = await appealLibrary.validateAppeal(appealCode, guildId);
    if (!validation.valid) {
        return interaction.reply({
            content: `❌ ${validation.reason}`,
            flags: 64
        });
    }
    
    const appeal = validation.appeal;

    // Verify user can submit this appeal
    if (appeal.moderatedUserId !== interaction.user.id) {
        return interaction.reply({
            content: '❌ You can only submit appeals for your own moderation actions.',
            flags: 64
        });
    }

    try {
        
        if (!caseData) {
            return interaction.reply({
                content: `❌ Case \`${caseID}\` not found. Please check the case ID and try again.`,
                flags: 64
            });
        }

        if (!caseData.userId || caseData.userId !== interaction.user.id) {
            return interaction.reply({
                content: '❌ You can only appeal your own cases.',
                flags: 64
            });
        }

        if (!caseData.appealable) {
            return interaction.reply({
                content: '❌ This case is not appealable.',
                flags: 64
            });
        }

        if (caseData.appealed) {
            return interaction.reply({
                content: `❌ This case has already been appealed. Status: ${caseData.status}`,
                flags: 64
            });
        }

        // Create appeal modal (embed guild ID for DM support)
        const modal = new ModalBuilder()
            .setCustomId(`appeal_modal_${caseID}_${guildId}`)
            .setTitle(`Appeal Case ${caseID}`);

        const reasonInput = new TextInputBuilder()
            .setCustomId('appeal_reason')
            .setLabel('Why should this punishment be appealed?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Explain why you believe this punishment was unfair or incorrect...')
            .setRequired(true)
            .setMaxLength(1000);

        const evidenceInput = new TextInputBuilder()
            .setCustomId('appeal_evidence')
            .setLabel('Additional Evidence (Optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Provide any additional evidence or context...')
            .setRequired(false)
            .setMaxLength(1000);

        const contactInput = new TextInputBuilder()
            .setCustomId('appeal_contact')
            .setLabel('Preferred Contact Method')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Discord DM, Email, etc.')
            .setRequired(false)
            .setMaxLength(100);

        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
        const secondActionRow = new ActionRowBuilder().addComponents(evidenceInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(contactInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);

    } catch (error) {
        console.error('Error handling appeal submit:', error);
        await interaction.reply({
            content: '❌ An error occurred while processing your appeal.',
            flags: 64
        });
    }
}

async function handleAppealStatus(interaction) {
    const caseIDRaw = interaction.options.getString('case_id');
    
    if (!caseIDRaw) {
        return interaction.editReply({
            content: '❌ Please provide a case ID to check status.'
        });
    }
    
    const caseID = caseIDRaw.toUpperCase();

    try {
        const caseData = await getCaseById(caseID, interaction.guild.id);
        
        if (!caseData) {
            return interaction.editReply({
                content: `❌ Case \`${caseID}\` not found. Please check the case ID and try again.`
            });
        }

        if (!caseData.userId || caseData.userId !== interaction.user.id) {
            return interaction.editReply({
                content: '❌ You can only check the status of your own appeals.'
            });
        }

        const statusColors = {
            'active': 0xff9900,
            'appealed': 0x3498db,
            'approved': 0x00ff00,
            'denied': 0xff0000,
            'closed': 0x808080
        };

        const embed = new EmbedBuilder()
            .setTitle(`📝 Appeal Status: ${caseID}`)
            .setColor(statusColors[caseData.status] || 0x3498db)
            .addFields(
                { name: '⚖️ Case Type', value: caseData.type.charAt(0).toUpperCase() + caseData.type.slice(1), inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(new Date(caseData.createdAt).getTime() / 1000)}:F>`, inline: true },
                { name: '📝 Reason', value: caseData.reason || 'No reason provided', inline: false },
                { name: '🔍 Status', value: caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1), inline: true },
                { name: '📊 Appealable', value: caseData.appealable ? '✅ Yes' : '❌ No', inline: true },
                { name: '🎯 Appealed', value: caseData.appealed ? '✅ Yes' : '❌ No', inline: true }
            )
            .setTimestamp();

        if (caseData.appealed && caseData.appealReason) {
            embed.addFields(
                { name: '📝 Appeal Reason', value: caseData.appealReason, inline: false },
                { name: '📅 Appeal Date', value: `<t:${Math.floor(new Date(caseData.appealedAt).getTime() / 1000)}:F>`, inline: true }
            );
        }

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error checking appeal status:', error);
        await interaction.editReply({
            content: '❌ An error occurred while checking appeal status.'
        });
    }
}

async function handleAppealReview(interaction) {
    // Staff only command
    if (!interaction.member.permissions.has('ModerateMembers')) {
        return interaction.reply({
            content: '❌ You need the **Moderate Members** permission to review appeals.',
            flags: 64
        });
    }

    const caseID = interaction.options.getString('case_id');
    const action = interaction.options.getString('action');
    const response = interaction.options.getString('response');
    
    if (!caseID) {
        return interaction.reply({
            content: '❌ Please provide a case ID to review.',
            flags: 64
        });
    }

    try {
        const { getCaseById } = require('../../utils/caseManager');
        const caseData = await getCaseById(caseID.toUpperCase(), interaction.guild.id);
        
        if (!caseData) {
            return interaction.reply({
                content: `❌ Case \`${caseID}\` not found.`,
                flags: 64
            });
        }

        if (!caseData.appealed) {
            return interaction.reply({
                content: `❌ Case \`${caseID}\` has not been appealed.`,
                flags: 64
            });
        }

        const reviewEmbed = new EmbedBuilder()
            .setTitle(`📋 Appeal Review - Case ${caseID}`)
            .setColor(0xffa500)
            .addFields(
                { name: '👤 User', value: `<@${caseData.userId}> (${caseData.userId})`, inline: true },
                { name: '⚖️ Punishment', value: caseData.type.toUpperCase(), inline: true },
                { name: '📅 Appeal Date', value: new Date(caseData.appealData.submittedAt).toLocaleString(), inline: true },
                { name: '📝 Appeal Reason', value: caseData.appealData.reason, inline: false },
                { name: '🔍 Evidence', value: caseData.appealData.evidence, inline: false },
                { name: '📞 Contact', value: caseData.appealData.contact, inline: true },
                { name: '📊 Status', value: caseData.status, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [reviewEmbed], flags: 64 });

    } catch (error) {
        console.error('Error reviewing appeal:', error);
        await interaction.reply({
            content: '❌ An error occurred while reviewing the appeal.',
            flags: 64
        });
    }
}

async function listPendingAppeals(interaction) {
    // This would require a database query to get pending appeals
    // For now, show a placeholder
    const embed = new EmbedBuilder()
        .setTitle('📋 Pending Appeals')
        .setColor(0xffa500)
        .setDescription('Use `/appeal review <case_id>` to review a specific appeal.')
        .addFields(
            { name: '🔍 How to Review', value: 'Provide a case ID to review that specific appeal', inline: false }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

function getStatusColor(status) {
    switch (status) {
        case 'approved': return 0x00ff00;
        case 'denied': return 0xff0000;
        case 'pending': return 0xffa500;
        default: return 0x808080;
    }
}

function getStatusText(status) {
    switch (status) {
        case 'approved': return '✅ Approved';
        case 'denied': return '❌ Denied';
        case 'pending': return '⏳ Under Review';
        case 'none': return '❌ Not Appealed';
        default: return '❓ Unknown';
    }
}
