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
    
    // Defer reply immediately to prevent timeout
    await interaction.deferReply({ flags: 64 }).catch(console.error);
    
    let reason, evidence, contact;
    try {
        reason = interaction.fields.getTextInputValue('appeal_reason');
        evidence = interaction.fields.getTextInputValue('appeal_evidence') || 'None provided';
        contact = interaction.fields.getTextInputValue('appeal_contact') || 'Discord DM';
    } catch (error) {
        console.error('Error reading modal fields:', error);
        return interaction.editReply({
            content: '❌ Failed to read appeal form data. Please try again.'
        }).catch(console.error);
    }

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
                    return interaction.editReply({
                        content: '❌ Could not find the server for this appeal. The bot may have been removed from the server.'
                    }).catch(console.error);
                }
            } catch (error) {
                console.error('Error fetching guild:', error);
                return interaction.editReply({
                    content: '❌ Could not access the server for this appeal. Please contact server staff directly.'
                }).catch(console.error);
            }
        } else {
            return interaction.editReply({
                content: '❌ Could not determine which server this appeal belongs to. Please use the appeal command with your appeal code.'
            }).catch(console.error);
        }
        
        // Submit appeal using appeal library
        let appeal;
        try {
            appeal = await appealLibrary.submitAppeal(
                appealCode,
                guildId,
                reason,
                evidence,
                contact,
                interaction.user.id
            );
        } catch (error) {
            console.error('Error submitting appeal:', error);
            return interaction.editReply({
                content: `❌ Failed to submit appeal: ${error.message}`
            }).catch(console.error);
        }

        // Send confirmation to user
        const confirmEmbed = new EmbedBuilder()
            .setTitle('📝 Appeal Submitted Successfully')
            .setColor(0x00ff00)
            .addFields(
                { name: '🆔 Appeal Code', value: `\`${appealCode}\``, inline: true },
                { name: '📅 Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📝 Your Reason', value: reason.slice(0, 1024), inline: false },
                { name: '🔍 Evidence', value: evidence.slice(0, 1024), inline: false },
                { name: '📞 Contact Method', value: contact, inline: true },
                { name: '⏳ Status', value: '🔍 Under Review', inline: true }
            )
            .setDescription('✅ Your appeal has been submitted to the server staff for review.')
            .setFooter({ text: 'Staff will review your appeal and respond accordingly. Keep this code for reference.' })
            .setTimestamp();

        await interaction.editReply({ embeds: [confirmEmbed] }).catch(console.error);

        // Send notification to staff (non-blocking)
        notifyStaffOfAppeal(guild, appealCode, appeal, { reason, evidence, contact }, interaction.client).catch(error => {
            console.error('Error notifying staff of appeal:', error);
        });

    } catch (error) {
        console.error('Error processing appeal:', error);
        const errorMessage = '❌ An error occurred while submitting your appeal. Please try again or contact server staff directly.';
        
        if (interaction.deferred) {
            await interaction.editReply({ content: errorMessage }).catch(console.error);
        } else if (!interaction.replied) {
            await interaction.reply({ content: errorMessage, flags: 64 }).catch(console.error);
        }
    }
}

async function notifyStaffOfAppeal(guild, appealCode, appeal, appealData, client) {
    try {
        // Get appeal channel from config
        const { loadConfig } = require('./configManager');
        const config = await loadConfig(guild.id).catch(() => ({}));
        
        let appealChannel = null;
        if (config.appeals?.channel) {
            appealChannel = guild.channels.cache.get(config.appeals.channel);
        }
        
        // Fallback to mod-log channel
        if (!appealChannel) {
            appealChannel = guild.channels.cache.find(
                channel => channel.name.includes('mod-log') || 
                          channel.name.includes('staff') || 
                          channel.name.includes('appeal')
            );
        }

        if (!appealChannel) {
            console.log(`No appeal channel found for guild ${guild.name} (${guild.id})`);
            return;
        }

        const user = await client.users.fetch(appeal.moderatedUserId).catch(() => null);
        const moderator = await client.users.fetch(appeal.moderatorId).catch(() => null);
        
        const embed = appealLibrary.createAppealEmbed(appeal, client);
        const buttons = appealLibrary.createReviewButtons(appealCode, config.appeals?.requireReason);

        embed.setTitle('🔔 New Appeal Submitted');
        embed.addFields(
            { name: '👮 Original Moderator', value: moderator ? `<@${moderator.id}> (${moderator.tag})` : 'Unknown', inline: true }
        );

        await appealChannel.send({ embeds: [embed], components: [buttons] }).catch(error => {
            console.error('Failed to send appeal notification:', error);
        });
    } catch (error) {
        console.error('Error notifying staff of appeal:', error);
    }
}

module.exports = { handleAppealModal };
