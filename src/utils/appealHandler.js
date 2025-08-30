const { EmbedBuilder } = require('discord.js');
const appealLibrary = require('./appealLibrary');

async function handleAppealModal(interaction) {
    const customId = interaction.customId;
    
    // Extract appeal code and guild ID from custom ID format: appeal_modal_APPEALCODE_GUILDID
    let appealCode, guildId;
    if (customId.includes('_')) {
        const parts = customId.replace('appeal_modal_', '').split('_');
        if (parts.length >= 2) {
            appealCode = parts[0];
            guildId = parts[1];
        } else {
            appealCode = parts[0];
        }
    } else {
        appealCode = customId.replace('appeal_modal_', '');
    }
    
    const reason = interaction.fields.getTextInputValue('appeal_reason');
    const evidence = interaction.fields.getTextInputValue('appeal_evidence') || 'None provided';
    const contact = interaction.fields.getTextInputValue('appeal_contact') || 'Discord DM';

    try {
        // Determine guild (for DM support)
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
                content: '❌ Could not determine which server this appeal belongs to.',
                flags: 64
            });
        }
        
        // Submit appeal using appeal library
        const appeal = await appealLibrary.submitAppeal(
            appealCode,
            guildId,
            reason,
            evidence,
            contact,
            interaction.user.id
        );

        // Send confirmation to user
        const confirmEmbed = new EmbedBuilder()
            .setTitle('📝 Appeal Submitted Successfully')
            .setColor(0x00ff00)
            .addFields(
                { name: '🆔 Appeal Code', value: appealCode, inline: true },
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
        await notifyStaffOfAppeal(guild, appealCode, appeal, { reason, evidence, contact }, interaction.client);

    } catch (error) {
        console.error('Error processing appeal:', error);
        await interaction.reply({
            content: '❌ An error occurred while submitting your appeal. Please try again.',
            flags: 64
        });
    }
}

async function notifyStaffOfAppeal(guild, appealCode, appeal, appealData, client) {
    try {
        // Get appeal channel from config
        const { loadConfig } = require('./configManager');
        const config = await loadConfig(guild.id);
        
        let appealChannel = null;
        if (config.appeals?.channel) {
            appealChannel = guild.channels.cache.get(config.appeals.channel);
        }
        
        // Fallback to mod-log channel
        if (!appealChannel) {
            appealChannel = guild.channels.cache.find(
                channel => channel.name.includes('mod-log') || channel.name.includes('staff')
            );
        }

        if (!appealChannel) return;

        const user = await client.users.fetch(appeal.moderatedUserId).catch(() => null);
        const moderator = await client.users.fetch(appeal.moderatorId).catch(() => null);
        
        const embed = appealLibrary.createAppealEmbed(appeal, client);
        const buttons = appealLibrary.createReviewButtons(appealCode, config.appeals?.requireReason);

        embed.setTitle('🔔 New Appeal Submitted');
        embed.addFields(
            { name: '👮 Original Moderator', value: moderator ? moderator.tag : 'Unknown', inline: true }
        );

        await appealChannel.send({ embeds: [embed], components: [buttons] });
    } catch (error) {
        console.error('Error notifying staff of appeal:', error);
    }
}

module.exports = { handleAppealModal };
