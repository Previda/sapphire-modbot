const { EmbedBuilder } = require('discord.js');

async function handleAppealModal(interaction) {
    const customId = interaction.customId;
    
    // Extract case ID and guild ID from custom ID format: appeal_modal_CASEID_GUILDID
    let caseID, guildId;
    if (customId.includes('_')) {
        const parts = customId.replace('appeal_modal_', '').split('_');
        if (parts.length >= 2) {
            caseID = parts[0];
            guildId = parts[1];
        } else {
            caseID = parts[0];
        }
    } else {
        caseID = customId.replace('appeal_modal_', '');
    }
    
    const reason = interaction.fields.getTextInputValue('appeal_reason');
    const evidence = interaction.fields.getTextInputValue('appeal_evidence') || 'None provided';
    const contact = interaction.fields.getTextInputValue('appeal_contact') || 'Discord DM';

    try {
        const { getCaseById, appealCase } = require('./caseManager');
        
        // Determine guild ID (for DM support)
        let guild;
        
        if (interaction.guild) {
            guildId = interaction.guild.id;
            guild = interaction.guild;
        } else if (guildId) {
            // For DMs, use the guild ID from modal custom ID
            try {
                guild = await interaction.client.guilds.fetch(guildId);
                if (!guild) {
                    return interaction.reply({
                        content: '❌ Could not find the server for this appeal.',
                        flags: 64
                    });
                }
            } catch (error) {
                return interaction.reply({
                    content: '❌ Could not access the server for this appeal.',
                    flags: 64
                });
            }
        } else {
            return interaction.reply({
                content: '❌ Could not determine which server this case belongs to. Please submit the appeal in the server.',
                flags: 64
            });
        }
        
        // Get case data
        const caseData = await getCaseById(caseID, guildId);
        
        if (!caseData) {
            return interaction.reply({
                content: '❌ Case not found. Please try again.',
                flags: 64
            });
        }

        // Update case with appeal information
        const appealData = {
            reason,
            evidence,
            contact,
            submittedAt: new Date().toISOString(),
            submittedBy: interaction.user.id
        };

        await appealCase(caseID, interaction.guild.id, appealData);

        // Send confirmation to user
        const confirmEmbed = new EmbedBuilder()
            .setTitle('📝 Appeal Submitted Successfully')
            .setColor(0x00ff00)
            .addFields(
                { name: '🆔 Case ID', value: caseID, inline: true },
                { name: '📅 Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📝 Your Reason', value: reason, inline: false },
                { name: '🔍 Evidence', value: evidence, inline: false },
                { name: '📞 Contact Method', value: contact, inline: true },
                { name: '⏳ Status', value: 'Under Review', inline: true }
            )
            .setFooter({ text: 'Staff will review your appeal and respond accordingly.' })
            .setTimestamp();

        await interaction.reply({ embeds: [confirmEmbed], flags: 64 });

        // Send notification to staff
        await notifyStaffOfAppeal(interaction, caseID, caseData, appealData);

    } catch (error) {
        console.error('Error processing appeal:', error);
        await interaction.reply({
            content: '❌ An error occurred while submitting your appeal. Please try again.',
            flags: 64
        });
    }
}

async function notifyStaffOfAppeal(interaction, caseID, caseData, appealData) {
    try {
        // Find staff/mod channel
        const modLogChannel = interaction.guild.channels.cache.find(
            channel => channel.name.includes('mod-log') || channel.name.includes('staff')
        );

        if (!modLogChannel) return;

        const user = await interaction.client.users.fetch(caseData.userId).catch(() => null);
        const staffNotifyEmbed = new EmbedBuilder()
            .setTitle('📋 New Appeal Submitted')
            .setColor(0xffa500)
            .addFields(
                { name: '🆔 Case ID', value: caseID, inline: true },
                { name: '👤 User', value: user ? `${user.tag} (${user.id})` : 'Unknown', inline: true },
                { name: '⚖️ Original Punishment', value: caseData.type.toUpperCase(), inline: true },
                { name: '📝 Appeal Reason', value: appealData.reason, inline: false },
                { name: '🔍 Evidence', value: appealData.evidence, inline: false },
                { name: '📞 Contact', value: appealData.contact, inline: true },
                { name: '📅 Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setFooter({ text: `Use /appeal review ${caseID} to review this appeal` })
            .setTimestamp();

        await modLogChannel.send({ embeds: [staffNotifyEmbed] });
    } catch (error) {
        console.error('Error notifying staff of appeal:', error);
    }
}

module.exports = { handleAppealModal };
