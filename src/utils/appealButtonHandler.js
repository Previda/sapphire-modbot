const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const appealLibrary = require('./appealLibrary');

async function handleAppealButtons(interaction) {
    const customId = interaction.customId;
    
    if (!customId.startsWith('appeal_')) return false;
    
    const [, action, appealCode] = customId.split('_');
    
    switch (action) {
        case 'approve':
            await handleApproveAppeal(interaction, appealCode, false);
            break;
        case 'reject':
            await handleRejectAppeal(interaction, appealCode, false);
            break;
        case 'skip':
            await handleSkipAppeal(interaction, appealCode);
            break;
        default:
            if (customId.includes('approve_reason')) {
                await handleApproveAppeal(interaction, appealCode, true);
            }
            break;
    }
    
    return true;
}

async function handleApproveAppeal(interaction, appealCode, withReason = false) {
    const guildId = interaction.guild.id;
    
    try {
        const appeal = await appealLibrary.getAppeal(guildId, appealCode);
        if (!appeal) {
            return interaction.reply({
                content: '❌ Appeal not found.',
                flags: 64
            });
        }

        if (withReason) {
            // Show modal for reason
            const modal = new ModalBuilder()
                .setCustomId(`appeal_approve_modal_${appealCode}`)
                .setTitle('Approve Appeal - Add Reason');

            const reasonInput = new TextInputBuilder()
                .setCustomId('approve_reason')
                .setLabel('Reason for approval (optional)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explain why this appeal was approved...')
                .setRequired(false)
                .setMaxLength(500);

            const row = new ActionRowBuilder().addComponents(reasonInput);
            modal.addComponents(row);

            await interaction.showModal(modal);
            return;
        }

        await approveAppeal(interaction, appeal, appealCode);

    } catch (error) {
        console.error('Error approving appeal:', error);
        await interaction.reply({
            content: '❌ Failed to approve appeal.',
            flags: 64
        });
    }
}

async function handleRejectAppeal(interaction, appealCode, withReason = false) {
    const guildId = interaction.guild.id;
    
    try {
        const appeal = await appealLibrary.getAppeal(guildId, appealCode);
        if (!appeal) {
            return interaction.reply({
                content: '❌ Appeal not found.',
                flags: 64
            });
        }

        if (withReason) {
            // Show modal for reason
            const modal = new ModalBuilder()
                .setCustomId(`appeal_reject_modal_${appealCode}`)
                .setTitle('Reject Appeal - Add Reason');

            const reasonInput = new TextInputBuilder()
                .setCustomId('reject_reason')
                .setLabel('Reason for rejection')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explain why this appeal was rejected...')
                .setRequired(true)
                .setMaxLength(500);

            const row = new ActionRowBuilder().addComponents(reasonInput);
            modal.addComponents(row);

            await interaction.showModal(modal);
            return;
        }

        await rejectAppeal(interaction, appeal, appealCode);

    } catch (error) {
        console.error('Error rejecting appeal:', error);
        await interaction.reply({
            content: '❌ Failed to reject appeal.',
            flags: 64
        });
    }
}

async function handleSkipAppeal(interaction, appealCode) {
    await interaction.reply({
        content: `⏭️ Skipped appeal ${appealCode}. Use \`/appeal list\` to see all pending appeals.`,
        flags: 64
    });
}

async function approveAppeal(interaction, appeal, appealCode, reviewReason = null) {
    try {
        // Update appeal status
        await appealLibrary.reviewAppeal(appealCode, interaction.guild.id, interaction.user.id, 'approved', reviewReason);

        // Notify user of approval
        const user = await interaction.client.users.fetch(appeal.moderatedUserId).catch(() => null);
        if (user) {
            const approvalEmbed = new EmbedBuilder()
                .setTitle('✅ Appeal Approved')
                .setColor(0x00ff00)
                .addFields(
                    { name: '🆔 Appeal Code', value: appealCode, inline: true },
                    { name: '🏛️ Server', value: interaction.guild.name, inline: true },
                    { name: '⚖️ Original Action', value: appeal.moderationType.toUpperCase(), inline: true },
                    { name: '👮 Reviewed by', value: interaction.user.tag, inline: true },
                    { name: '📅 Reviewed', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                );

            if (reviewReason) {
                approvalEmbed.addFields({ name: '📝 Review Reason', value: reviewReason, inline: false });
            }

            approvalEmbed.setFooter({ text: 'Your appeal has been approved. Thank you for your patience.' });

            try {
                await user.send({ embeds: [approvalEmbed] });
            } catch (error) {
                console.log('Could not DM user about appeal approval');
            }
        }

        // Update the message
        const updatedEmbed = appealLibrary.createAppealEmbed(await appealLibrary.getAppeal(interaction.guild.id, appealCode), interaction.client);
        await interaction.update({ embeds: [updatedEmbed], components: [] });

        // Log the action
        console.log(`Appeal ${appealCode} approved by ${interaction.user.tag}`);

    } catch (error) {
        console.error('Error processing appeal approval:', error);
        throw error;
    }
}

async function rejectAppeal(interaction, appeal, appealCode, reviewReason = null) {
    try {
        // Update appeal status
        await appealLibrary.reviewAppeal(appealCode, interaction.guild.id, interaction.user.id, 'rejected', reviewReason);

        // Notify user of rejection
        const user = await interaction.client.users.fetch(appeal.moderatedUserId).catch(() => null);
        if (user) {
            const rejectionEmbed = new EmbedBuilder()
                .setTitle('❌ Appeal Rejected')
                .setColor(0xff0000)
                .addFields(
                    { name: '🆔 Appeal Code', value: appealCode, inline: true },
                    { name: '🏛️ Server', value: interaction.guild.name, inline: true },
                    { name: '⚖️ Original Action', value: appeal.moderationType.toUpperCase(), inline: true },
                    { name: '👮 Reviewed by', value: interaction.user.tag, inline: true },
                    { name: '📅 Reviewed', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                );

            if (reviewReason) {
                rejectionEmbed.addFields({ name: '📝 Review Reason', value: reviewReason, inline: false });
            }

            rejectionEmbed.setFooter({ text: 'Your appeal has been rejected.' });

            try {
                await user.send({ embeds: [rejectionEmbed] });
            } catch (error) {
                console.log('Could not DM user about appeal rejection');
            }
        }

        // Update the message
        const updatedEmbed = appealLibrary.createAppealEmbed(await appealLibrary.getAppeal(interaction.guild.id, appealCode), interaction.client);
        await interaction.update({ embeds: [updatedEmbed], components: [] });

        // Log the action
        console.log(`Appeal ${appealCode} rejected by ${interaction.user.tag}`);

    } catch (error) {
        console.error('Error processing appeal rejection:', error);
        throw error;
    }
}

async function handleAppealReviewModal(interaction) {
    const customId = interaction.customId;
    const appealCode = customId.split('_')[3]; // appeal_approve_modal_CODE or appeal_reject_modal_CODE
    const isApproval = customId.includes('approve');
    
    const reviewReason = interaction.fields.getTextInputValue(isApproval ? 'approve_reason' : 'reject_reason');
    
    try {
        const appeal = await appealLibrary.getAppeal(interaction.guild.id, appealCode);
        if (!appeal) {
            return interaction.reply({
                content: '❌ Appeal not found.',
                flags: 64
            });
        }

        if (isApproval) {
            await approveAppeal(interaction, appeal, appealCode, reviewReason);
        } else {
            await rejectAppeal(interaction, appeal, appealCode, reviewReason);
        }

    } catch (error) {
        console.error('Error processing appeal review modal:', error);
        await interaction.reply({
            content: '❌ Failed to process appeal review.',
            flags: 64
        });
    }
}

module.exports = { 
    handleAppealButtons, 
    handleAppealReviewModal 
};
