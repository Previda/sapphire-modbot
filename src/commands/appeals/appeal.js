const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { createPunishment, getPunishments, updatePunishment } = require('../../utils/punishmentUtils');
const { getCaseById, appealCase, getUserCases } = require('../../utils/caseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('Appeal system commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('submit')
                .setDescription('Submit an appeal for a punishment')
                .addStringOption(option =>
                    option.setName('case_id')
                        .setDescription('Case ID to appeal (e.g., CASE-ABC123)')
                        .setRequired(true)))
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
                .setDescription('Review pending appeals (Staff only)')
                .addStringOption(option =>
                    option.setName('case_id')
                        .setDescription('Case ID to review')
                        .setRequired(false))),

    async execute(interaction) {
        let subcommand;
        try {
            subcommand = interaction.options.getSubcommand();
        } catch (error) {
            // No subcommand provided, show available actions
            const embed = new EmbedBuilder()
                .setTitle('📋 Appeal System')
                .setColor(0x3498db)
                .setDescription('Available appeal commands:')
                .addFields(
                    { name: '/appeal submit', value: 'Submit an appeal for a case', inline: false },
                    { name: '/appeal status', value: 'Check your appeal status', inline: false },
                    { name: '/appeal review', value: 'Review appeals (Staff only)', inline: false }
                )
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], flags: 64 }); // 64 = ephemeral
        }

        switch (subcommand) {
            case 'submit':
                await handleAppealSubmit(interaction);
                break;
            case 'status':
                await handleAppealStatus(interaction);
                break;
            case 'review':
                await handleAppealReview(interaction);
                break;
        }
    }
};

async function handleAppealSubmit(interaction) {
    const caseID = interaction.options.getString('case_id').toUpperCase();

    try {
        const caseData = await getCaseById(caseID, interaction.guild.id);
        
        if (!caseData) {
            return interaction.reply({
                content: `❌ Case \`${caseID}\` not found. Please check the case ID and try again.`,
                flags: 64
            });
        }

        if (caseData.userId !== interaction.user.id) {
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

        // Create appeal modal
        const modal = new ModalBuilder()
            .setCustomId(`appeal_modal_${caseID}`)
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
    const caseID = interaction.options.getString('case_id').toUpperCase();

    try {
        const caseData = await getCaseById(caseID, interaction.guild.id);
        
        if (!caseData) {
            return interaction.reply({
                content: `❌ Case \`${caseID}\` not found. Please check the case ID and try again.`,
                flags: 64
            });
        }

        if (caseData.userId !== interaction.user.id) {
            return interaction.reply({
                content: '❌ You can only check the status of your own appeals.',
                flags: 64
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

        await interaction.reply({ embeds: [embed], flags: 64 });

    } catch (error) {
        console.error('Error checking appeal status:', error);
        await interaction.reply({
            content: '❌ An error occurred while checking appeal status.',
            flags: 64
        });
    }
}

async function handleAppealReview(interaction) {
    // Check if user has permission to review appeals
    if (!interaction.member.permissions.has('ModerateMembers')) {
        return interaction.reply({
            content: '❌ You need Moderate Members permission to review appeals.',
            flags: 64
        });
    }

    const caseID = interaction.options.getString('case_id');

    if (caseID) {
        // Review specific case
        await reviewSpecificAppeal(interaction, caseID.toUpperCase());
    } else {
        // List all pending appeals
        await listPendingAppeals(interaction);
    }
}

async function reviewSpecificAppeal(interaction, caseID) {
    try {
        const punishment = await getPunishmentByCase(caseID);
        
        if (!punishment) {
            return interaction.reply({
                content: '❌ Case not found.',
                flags: 64
            });
        }

        if (!punishment.appealStatus || punishment.appealStatus === 'none') {
            return interaction.reply({
                content: '❌ This case has no pending appeal.',
                flags: 64
            });
        }

        const user = await interaction.client.users.fetch(punishment.userID).catch(() => null);
        
        const embed = new EmbedBuilder()
            .setTitle(`📋 Appeal Review: ${caseID}`)
            .setColor(0xffa500)
            .addFields(
                { name: '👤 User', value: user ? user.tag : 'Unknown', inline: true },
                { name: '⚖️ Punishment', value: punishment.type.toUpperCase(), inline: true },
                { name: '📅 Date', value: new Date(punishment.timestamp).toLocaleString(), inline: true },
                { name: '📝 Original Reason', value: punishment.reason || 'No reason provided', inline: false }
            );

        if (punishment.appealReason) {
            try {
                const appealData = JSON.parse(punishment.appealReason);
                embed.addFields(
                    { name: '📝 Appeal Reason', value: appealData.reason || 'No reason provided', inline: false },
                    { name: '🔍 Evidence', value: appealData.evidence || 'None provided', inline: false },
                    { name: '📞 Contact', value: appealData.contact || 'None provided', inline: true }
                );
            } catch (e) {
                embed.addFields(
                    { name: '📝 Appeal', value: punishment.appealReason, inline: false }
                );
            }
        }

        await interaction.reply({ embeds: [embed], flags: 64 });

    } catch (error) {
        console.error('Error reviewing appeal:', error);
        await interaction.reply({
            content: '❌ An error occurred while reviewing appeal.',
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

    await interaction.reply({ embeds: [embed], flags: 64 });
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
