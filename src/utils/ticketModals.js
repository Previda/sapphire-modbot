const { EmbedBuilder } = require('discord.js');

async function handleTicketModals(interaction) {
    const modalId = interaction.customId;

    try {
        switch (modalId) {
            case 'create_ticket_modal':
                await handleCreateTicketModal(interaction);
                break;
            case 'add_user_modal':
                await handleAddUserModal(interaction);
                break;
            case 'remove_user_modal':
                await handleRemoveUserModal(interaction);
                break;
            case 'slowmode_modal':
                await handleSlowmodeModal(interaction);
                break;
            default:
                await interaction.reply({ content: '❌ Unknown modal interaction.', flags: 64 });
        }
    } catch (error) {
        console.error('Ticket modal error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ An error occurred processing your request.', flags: 64 });
        }
    }
}

async function handleCreateTicketModal(interaction) {
    const userInput = interaction.fields.getTextInputValue('ticket_user');
    const reason = interaction.fields.getTextInputValue('ticket_reason');
    const category = interaction.fields.getTextInputValue('ticket_category') || 'general';

    try {
        // Parse user input (ID or mention)
        const userMatch = userInput.match(/(\d+)/);
        if (!userMatch) {
            return interaction.reply({
                content: '❌ Invalid user ID or mention format.',
                flags: 64
            });
        }

        const userId = userMatch[1];
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        
        if (!user) {
            return interaction.reply({
                content: '❌ User not found. Please check the user ID.',
                flags: 64
            });
        }

        // Generate ticket ID
        const ticketID = `ticket-${Date.now()}`;
        
        // Create ticket channel
        const channel = await interaction.guild.channels.create({
            name: `${category}-${user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, ''),
            type: 0,
            topic: `Ticket by ${user.tag} | Reason: ${reason} | Created by: ${interaction.user.tag}`,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: ['ViewChannel']
                },
                {
                    id: user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                },
                {
                    id: interaction.user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages']
                }
            ]
        });

        // Save ticket data
        const { saveTicket } = require('./ticketUtils');
        await saveTicket({
            ticketID: ticketID,
            userID: user.id,
            guildID: interaction.guild.id,
            channelID: channel.id,
            status: 'open',
            reason: reason,
            category: category,
            createdAt: new Date().toISOString(),
            createdBy: interaction.user.id
        });

        // Send welcome message
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎫 Support Ticket Created')
            .setDescription(`Hello ${user}, your ticket has been created by staff!`)
            .addFields(
                { name: '📝 Reason', value: reason, inline: false },
                { name: '📂 Category', value: category, inline: true },
                { name: '🆔 Ticket ID', value: ticketID, inline: true },
                { name: '👤 Created by', value: interaction.user.tag, inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

        await channel.send({ content: `${user}`, embeds: [welcomeEmbed] });

        await interaction.reply({
            content: `✅ Ticket created successfully for ${user.tag}!\n🎫 Channel: ${channel}\n🆔 ID: ${ticketID}`,
            flags: 64
        });

    } catch (error) {
        console.error('Error creating ticket from modal:', error);
        await interaction.reply({
            content: '❌ Failed to create ticket. Please try again.',
            flags: 64
        });
    }
}

async function handleAddUserModal(interaction) {
    const userInput = interaction.fields.getTextInputValue('add_user_id');

    try {
        // Parse user input (ID or mention)
        const userMatch = userInput.match(/(\d+)/);
        if (!userMatch) {
            return interaction.reply({
                content: '❌ Invalid user ID or mention format.',
                flags: 64
            });
        }

        const userId = userMatch[1];
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        
        if (!user) {
            return interaction.reply({
                content: '❌ User not found. Please check the user ID.',
                flags: 64
            });
        }

        // Add user to channel permissions
        await interaction.channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        const embed = new EmbedBuilder()
            .setTitle('👤 User Added to Ticket')
            .setColor(0x00ff00)
            .addFields(
                { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
                { name: '📅 Added', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '👤 Added by', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({
            content: `✅ ${user.tag} has been added to this ticket.`,
            flags: 64
        });

    } catch (error) {
        console.error('Error adding user:', error);
        await interaction.reply({
            content: '❌ Failed to add user. Please try again.',
            flags: 64
        });
    }
}

async function handleRemoveUserModal(interaction) {
    const userInput = interaction.fields.getTextInputValue('remove_user_id');

    try {
        // Parse user input (ID or mention)
        const userMatch = userInput.match(/(\d+)/);
        if (!userMatch) {
            return interaction.reply({
                content: '❌ Invalid user ID or mention format.',
                flags: 64
            });
        }

        const userId = userMatch[1];
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        
        if (!user) {
            return interaction.reply({
                content: '❌ User not found. Please check the user ID.',
                flags: 64
            });
        }

        // Remove user from channel permissions
        await interaction.channel.permissionOverwrites.delete(user.id);

        const embed = new EmbedBuilder()
            .setTitle('👤 User Removed from Ticket')
            .setColor(0xff6b6b)
            .addFields(
                { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
                { name: '📅 Removed', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '👤 Removed by', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({
            content: `✅ ${user.tag} has been removed from this ticket.`,
            flags: 64
        });

    } catch (error) {
        console.error('Error removing user:', error);
        await interaction.reply({
            content: '❌ Failed to remove user. Please try again.',
            flags: 64
        });
    }
}

async function handleSlowmodeModal(interaction) {
    const durationInput = interaction.fields.getTextInputValue('slowmode_duration');
    const duration = parseInt(durationInput);

    try {
        if (isNaN(duration) || duration < 0 || duration > 21600) {
            return interaction.reply({
                content: '❌ Invalid duration. Please enter a number between 0 and 21600 seconds.',
                flags: 64
            });
        }

        await interaction.channel.setRateLimitPerUser(duration);

        const embed = new EmbedBuilder()
            .setTitle('⏱️ Slowmode Updated')
            .setColor(0x3498db)
            .addFields(
                { name: '⏱️ Duration', value: duration === 0 ? 'Disabled' : `${duration} seconds`, inline: true },
                { name: '📅 Updated', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '👤 Updated by', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({
            content: `✅ Slowmode has been ${duration === 0 ? 'disabled' : `set to ${duration} seconds`}.`,
            flags: 64
        });

    } catch (error) {
        console.error('Error setting slowmode:', error);
        await interaction.reply({
            content: '❌ Failed to update slowmode. Please try again.',
            flags: 64
        });
    }
}

module.exports = { handleTicketModals };
