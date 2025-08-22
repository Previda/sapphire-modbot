const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { isConnected } = require('../models/database');
const fs = require('fs').promises;
const path = require('path');

// Local storage for tickets
const TICKETS_FILE = path.join(process.cwd(), 'data', 'tickets.json');

// Load tickets from local storage
async function loadTickets() {
    try {
        const data = await fs.readFile(TICKETS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save tickets to local storage
async function saveTickets(tickets) {
    try {
        const dataDir = path.dirname(TICKETS_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2));
    } catch (error) {
        console.error('Failed to save tickets:', error);
    }
}

// Handle ticket menu command (!ticket)
async function handleTicketMenu(message) {
    try {
        // Check if user is server owner or has manage channels permission
        if (message.guild.ownerId !== message.author.id && 
            !message.member.permissions.has('ManageChannels')) {
            return message.reply('❌ You need Manage Channels permission or be the server owner to use ticket management.');
        }

        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket Management Menu')
            .setDescription('Select an action to manage tickets')
            .setColor(0x0099ff)
            .addFields(
                { name: '📋 Available Actions', value: 'Use the buttons below to manage tickets', inline: false }
            )
            .setTimestamp();

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_list')
                    .setLabel('📋 List Open Tickets')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('ticket_create')
                    .setLabel('➕ Create Ticket')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_close_menu')
                    .setLabel('🔒 Close Ticket')
                    .setStyle(ButtonStyle.Danger)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_add_user')
                    .setLabel('👤 Add User')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('ticket_remove_user')
                    .setLabel('👤 Remove User')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('ticket_slowmode')
                    .setLabel('⏱️ Set Slowmode')
                    .setStyle(ButtonStyle.Secondary)
            );

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('📄 Generate Transcript')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('ticket_settings')
                    .setLabel('⚙️ Ticket Settings')
                    .setStyle(ButtonStyle.Secondary)
            );

        await message.reply({ 
            embeds: [embed], 
            components: [row1, row2, row3] 
        });

    } catch (error) {
        console.error('Error showing ticket menu:', error);
        try {
            await message.reply('❌ Failed to show ticket menu.');
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
}

// Handle ticket menu interactions
async function handleTicketMenuInteraction(interaction) {
    const customId = interaction.customId;

    switch (customId) {
        case 'ticket_list':
            await handleListTickets(interaction);
            break;
        case 'ticket_create':
            await handleCreateTicketModal(interaction);
            break;
        case 'ticket_close_menu':
            await handleCloseTicketMenu(interaction);
            break;
        case 'ticket_add_user':
            await handleAddUserModal(interaction);
            break;
        case 'ticket_remove_user':
            await handleRemoveUserModal(interaction);
            break;
        case 'ticket_slowmode':
            await handleSlowmodeModal(interaction);
            break;
        case 'ticket_transcript':
            await handleTranscriptGeneration(interaction);
            break;
        case 'ticket_settings':
            await handleTicketSettings(interaction);
            break;
    }
}

// List all open tickets
async function handleListTickets(interaction) {
    try {
        let tickets = [];
        
        if (!isConnected()) {
            // Use local storage
            const ticketData = await loadTickets();
            tickets = ticketData.filter(t => t.guildID === interaction.guild.id && t.status === 'open');
        } else {
            console.log('📝 MongoDB ticket listing - not yet implemented');
        }

        if (tickets.length === 0) {
            return interaction.reply({
                content: '📋 No open tickets found.',
                flags: 64
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('📋 Open Tickets')
            .setColor(0x00ff00)
            .setDescription(`Found ${tickets.length} open ticket(s)`)
            .setTimestamp();

        for (const ticket of tickets.slice(0, 10)) { // Show max 10 tickets
            const channel = interaction.guild.channels.cache.get(ticket.channelID);
            const user = await interaction.client.users.fetch(ticket.userID).catch(() => null);
            
            embed.addFields({
                name: `🎫 ${ticket.ticketID}`,
                value: `**User:** ${user ? user.tag : 'Unknown'}\n**Channel:** ${channel ? channel.toString() : 'Deleted'}\n**Reason:** ${ticket.reason}\n**Created:** <t:${Math.floor(new Date(ticket.createdAt).getTime() / 1000)}:R>`,
                inline: true
            });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
        console.error('Error listing tickets:', error);
        await interaction.reply({
            content: '❌ Failed to list tickets.',
            ephemeral: true
        });
    }
}

// Create ticket modal
async function handleCreateTicketModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('create_ticket_modal')
        .setTitle('Create New Ticket');

    const userInput = new TextInputBuilder()
        .setCustomId('ticket_user')
        .setLabel('User ID or @mention')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('123456789012345678 or @username')
        .setRequired(true);

    const reasonInput = new TextInputBuilder()
        .setCustomId('ticket_reason')
        .setLabel('Ticket Reason')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Reason for creating this ticket...')
        .setRequired(true);

    const categoryInput = new TextInputBuilder()
        .setCustomId('ticket_category')
        .setLabel('Category (optional)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('general, appeal, report, bug, other')
        .setRequired(false);

    const row1 = new ActionRowBuilder().addComponents(userInput);
    const row2 = new ActionRowBuilder().addComponents(reasonInput);
    const row3 = new ActionRowBuilder().addComponents(categoryInput);

    modal.addComponents(row1, row2, row3);
    await interaction.showModal(modal);
}

// Handle slowmode modal
async function handleSlowmodeModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('slowmode_modal')
        .setTitle('Set Channel Slowmode');

    const durationInput = new TextInputBuilder()
        .setCustomId('slowmode_duration')
        .setLabel('Slowmode Duration (seconds)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('0-21600 (0 to disable, max 6 hours)')
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(durationInput);
    modal.addComponents(row);
    await interaction.showModal(modal);
}

// Handle close ticket menu
async function handleCloseTicketMenu(interaction) {
    try {
        // Check if current channel is a ticket
        const [tickets] = await pool.execute(
            'SELECT * FROM tickets WHERE channelID = ? AND status = "open"',
            [interaction.channel.id]
        );

        if (tickets.length === 0) {
            return interaction.reply({
                content: '❌ This channel is not an active ticket.',
                ephemeral: true
            });
        }

        const ticket = tickets[0];
        const user = await interaction.client.users.fetch(ticket.userID).catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle('🔒 Close Ticket Confirmation')
            .setColor(0xff0000)
            .addFields(
                { name: 'Ticket ID', value: ticket.ticketID, inline: true },
                { name: 'User', value: user ? user.tag : 'Unknown', inline: true },
                { name: 'Reason', value: ticket.reason, inline: false }
            )
            .setDescription('Are you sure you want to close this ticket?');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`close_ticket_${ticket.ticketID}`)
                    .setLabel('🔒 Close Ticket')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel_close')
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    } catch (error) {
        console.error('Error showing close menu:', error);
        await interaction.reply({
            content: '❌ Failed to show close menu.',
            ephemeral: true
        });
    }
}

// Handle modal submissions
async function handleModalSubmit(interaction) {
    const customId = interaction.customId;

    if (customId === 'create_ticket_modal') {
        await handleCreateTicketSubmit(interaction);
    } else if (customId === 'slowmode_modal') {
        await handleSlowmodeSubmit(interaction);
    }
}

// Handle create ticket submission
async function handleCreateTicketSubmit(interaction) {
    try {
        const userInput = interaction.fields.getTextInputValue('ticket_user');
        const reason = interaction.fields.getTextInputValue('ticket_reason');
        const category = interaction.fields.getTextInputValue('ticket_category') || 'staff-created';

        // Parse user ID
        let userId = userInput.replace(/[<@!>]/g, '');
        const user = await interaction.client.users.fetch(userId).catch(() => null);

        if (!user) {
            return interaction.reply({
                content: '❌ Invalid user ID or mention.',
                ephemeral: true
            });
        }

        // Create ticket channel
        const ticketID = `ticket-${Date.now()}`;
        const channel = await interaction.guild.channels.create({
            name: `${category}-${user.username}`,
            type: 0, // Text channel
            topic: `Ticket by ${user.tag} | Reason: ${reason}`,
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

        // Store in database
        await pool.execute(
            'INSERT INTO tickets (ticketID, userID, guildID, channelID, status, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [ticketID, user.id, interaction.guild.id, channel.id, 'open', reason]
        );

        // Send welcome message with user mention
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎫 Support Ticket Created')
            .setDescription(`Hello ${user}, your ticket has been created by staff!`)
            .addFields(
                { name: 'Reason', value: reason, inline: false },
                { name: 'Category', value: category, inline: true },
                { name: 'Ticket ID', value: ticketID, inline: true },
                { name: 'Created by', value: interaction.user.tag, inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

        await channel.send({ content: `${user}`, embeds: [welcomeEmbed] });

        await interaction.reply({
            content: `✅ Ticket created successfully! ${channel}`,
            ephemeral: true
        });

    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.reply({
            content: '❌ Failed to create ticket.',
            ephemeral: true
        });
    }
}

// Handle slowmode submission
async function handleSlowmodeSubmit(interaction) {
    try {
        const duration = parseInt(interaction.fields.getTextInputValue('slowmode_duration'));

        if (isNaN(duration) || duration < 0 || duration > 21600) {
            return interaction.reply({
                content: '❌ Invalid duration. Must be between 0 and 21600 seconds.',
                ephemeral: true
            });
        }

        await interaction.channel.setRateLimitPerUser(duration);

        const embed = new EmbedBuilder()
            .setTitle('⏱️ Slowmode Updated')
            .setColor(0x00ff00)
            .addFields(
                { name: 'Channel', value: interaction.channel.toString(), inline: true },
                { name: 'Duration', value: duration === 0 ? 'Disabled' : `${duration} seconds`, inline: true },
                { name: 'Set by', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error setting slowmode:', error);
        await interaction.reply({
            content: '❌ Failed to set slowmode.',
            ephemeral: true
        });
    }
}

// Handle button interactions
async function handleTicketButtonInteraction(interaction) {
    const customId = interaction.customId;
    
    try {
        if (customId.startsWith('ticket_close_')) {
            const caseId = customId.split('_')[2];
            await handleTicketClose(interaction, caseId);
        } else if (customId.startsWith('ticket_transcript_')) {
            const caseId = customId.split('_')[2];
            await handleTicketTranscript(interaction, caseId);
        } else {
            await interaction.reply({
                content: '❌ Unknown ticket action.',
                flags: 64
            });
        }
    } catch (error) {
        console.error('Ticket button interaction error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ An error occurred processing your request.',
                flags: 64
            });
        }
    }
}

// Handle ticket close button
async function handleTicketClose(interaction, caseId) {
    const channel = interaction.channel;
    
    try {
        await interaction.reply({
            content: '🔒 Closing ticket in 10 seconds...',
            flags: 64
        });
        
        setTimeout(async () => {
            try {
                await channel.delete('Ticket closed by user');
            } catch (error) {
                console.error('Error deleting ticket channel:', error);
            }
        }, 10000);
        
    } catch (error) {
        console.error('Error closing ticket:', error);
        await interaction.reply({
            content: '❌ Failed to close ticket.',
            flags: 64
        });
    }
}

// Handle ticket transcript button
async function handleTicketTranscript(interaction, caseId) {
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const channel = interaction.channel;
        const messages = await channel.messages.fetch({ limit: 100 });
        
        let transcript = `=== TICKET TRANSCRIPT ===\n`;
        transcript += `Case ID: ${caseId}\n`;
        transcript += `Channel: ${channel.name}\n`;
        transcript += `Generated: ${new Date().toISOString()}\n\n`;
        
        messages.reverse().forEach(msg => {
            transcript += `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content}\n`;
        });
        
        // Save transcript to file
        const fs = require('fs').promises;
        const path = require('path');
        const transcriptPath = path.join(process.cwd(), 'data', 'transcripts', `ticket-${caseId}.txt`);
        
        await fs.mkdir(path.dirname(transcriptPath), { recursive: true });
        await fs.writeFile(transcriptPath, transcript);
        
        await interaction.editReply({
            content: `✅ Transcript generated and saved to: ticket-${caseId}.txt`,
        });
        
    } catch (error) {
        console.error('Error generating transcript:', error);
        await interaction.editReply({
            content: '❌ Failed to generate transcript.'
        });
    }
}

module.exports = {
    handleTicketMenu,
    handleTicketMenuInteraction,
    handleModalSubmit,
    handleTicketButtonInteraction
};
