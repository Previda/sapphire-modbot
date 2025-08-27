const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { isConnected } = require('../models/database');
const { loadTicketsData, saveTicketsData, saveTicket, getGuildTickets, getUserTickets, getTicketByChannel, updateTicketStatus, closeTicket } = require('./ticketUtils');

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
        const tickets = await getGuildTickets(interaction.guild.id, 'open');

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
        .setLabel('Duration in seconds (0-21600)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter duration in seconds (0 to disable)')
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(durationInput);
    modal.addComponents(row);
    await interaction.showModal(modal);
}

// Handle add user modal
async function handleAddUserModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('add_user_modal')
        .setTitle('Add User to Ticket');

    const userInput = new TextInputBuilder()
        .setCustomId('user_input')
        .setLabel('User ID or @mention')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter user ID or @mention')
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(userInput);
    modal.addComponents(row);
    await interaction.showModal(modal);
}

// Handle remove user modal
async function handleRemoveUserModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('remove_user_modal')
        .setTitle('Remove User from Ticket');

    const userInput = new TextInputBuilder()
        .setCustomId('user_input')
        .setLabel('User ID or @mention')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter user ID or @mention')
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(userInput);
    modal.addComponents(row);
    await interaction.showModal(modal);
}

// Handle settings menu
async function handleSettingsMenu(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('⚙️ Ticket Settings')
        .setDescription('Configure ticket system settings')
        .setColor(0x9b59b6)
        .addFields(
            { name: '📂 Category', value: 'Use `/setup tickets` to configure', inline: true },
            { name: '👥 Support Role', value: 'Use `/setup tickets` to configure', inline: true },
            { name: '📝 Status', value: 'Active', inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Handle close ticket menu
async function handleCloseTicketMenu(interaction) {
    try {
        // Check if current channel is a ticket using utility function
        const ticket = await getTicketByChannel(interaction.channel.id);

        if (!ticket || ticket.status !== 'open') {
            return interaction.reply({
                content: '❌ This channel is not an active ticket.',
                ephemeral: true
            });
        }

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

    switch (customId) {
        case 'create_ticket_modal':
            await handleCreateTicketSubmit(interaction);
            break;
        case 'slowmode_modal':
            await handleSlowmodeSubmit(interaction);
            break;
        case 'add_user_modal':
            await handleAddUserSubmit(interaction);
            break;
        case 'remove_user_modal':
            await handleRemoveUserSubmit(interaction);
            break;
        default:
            await interaction.reply({
                content: '❌ Unknown modal submission.',
                ephemeral: true
            });
            break;
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

        // Store ticket using utility function
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

        // Find staff roles for mentions
        const staffRoles = interaction.guild.roles.cache.filter(role => 
            ['staff', 'mod', 'moderator', 'admin', 'administrator', 'support'].some(name => 
                role.name.toLowerCase().includes(name)
            )
        );
        
        let staffMentions = '';
        if (staffRoles.size > 0) {
            staffMentions = staffRoles.map(role => role.toString()).join(' ');
        }

        // Send welcome message with user mention and staff ping
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

        // Create ticket control buttons
        const controlRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`close_ticket_${ticketID}`)
                    .setLabel('🔒 Close Ticket')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`transcript_ticket_${ticketID}`)
                    .setLabel('📄 Transcript')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`reopen_ticket_${ticketID}`)
                    .setLabel('🔓 Reopen')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`delete_ticket_${ticketID}`)
                    .setLabel('🗑️ Delete')
                    .setStyle(ButtonStyle.Danger)
            );

        const mentionText = staffMentions ? `${user} ${staffMentions}` : `${user}`;
        await channel.send({ 
            content: mentionText, 
            embeds: [welcomeEmbed], 
            components: [controlRow] 
        });

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

// Handle add user submission
async function handleAddUserSubmit(interaction) {
    try {
        const userInput = interaction.fields.getTextInputValue('user_input');
        let userId = userInput.replace(/[<@!>]/g, '');
        
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        if (!user) {
            return interaction.reply({
                content: '❌ Invalid user ID or mention.',
                ephemeral: true
            });
        }

        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!member) {
            return interaction.reply({
                content: '❌ User is not in this server.',
                ephemeral: true
            });
        }

        await interaction.channel.permissionOverwrites.edit(userId, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        const embed = new EmbedBuilder()
            .setTitle('✅ User Added to Ticket')
            .setColor(0x00ff00)
            .addFields(
                { name: 'User', value: user.tag, inline: true },
                { name: 'Channel', value: interaction.channel.toString(), inline: true },
                { name: 'Added by', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error adding user:', error);
        await interaction.reply({
            content: '❌ Failed to add user to ticket.',
            ephemeral: true
        });
    }
}

// Handle remove user submission
async function handleRemoveUserSubmit(interaction) {
    try {
        const userInput = interaction.fields.getTextInputValue('user_input');
        let userId = userInput.replace(/[<@!>]/g, '');
        
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        if (!user) {
            return interaction.reply({
                content: '❌ Invalid user ID or mention.',
                ephemeral: true
            });
        }

        await interaction.channel.permissionOverwrites.edit(userId, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false
        });

        const embed = new EmbedBuilder()
            .setTitle('🚫 User Removed from Ticket')
            .setColor(0xff0000)
            .addFields(
                { name: 'User', value: user.tag, inline: true },
                { name: 'Channel', value: interaction.channel.toString(), inline: true },
                { name: 'Removed by', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error removing user:', error);
        await interaction.reply({
            content: '❌ Failed to remove user from ticket.',
            ephemeral: true
        });
    }
}

// Handle button interactions
async function handleTicketButtonInteraction(interaction) {
    const customId = interaction.customId;
    
    try {
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
                await handleTicketTranscript(interaction, null);
                break;
            case 'ticket_settings':
                await handleSettingsMenu(interaction);
                break;
            case 'cancel_close':
                await interaction.update({
                    content: '❌ Ticket close cancelled.',
                    embeds: [],
                    components: []
                });
                break;
            default:
                // Handle dynamic button IDs
                if (customId.startsWith('close_ticket_')) {
                    const ticketId = customId.replace('close_ticket_', '');
                    await handleTicketClose(interaction, ticketId);
                } else if (customId.startsWith('transcript_ticket_')) {
                    const ticketId = customId.replace('transcript_ticket_', '');
                    await handleTicketTranscript(interaction, ticketId);
                } else if (customId.startsWith('reopen_ticket_')) {
                    const ticketId = customId.replace('reopen_ticket_', '');
                    await handleTicketReopen(interaction, ticketId);
                } else if (customId.startsWith('delete_ticket_')) {
                    const ticketId = customId.replace('delete_ticket_', '');
                    await handleTicketDelete(interaction, ticketId);
                } else if (customId.startsWith('confirm_delete_')) {
                    const ticketId = customId.replace('confirm_delete_', '');
                    await handleDeleteConfirmation(interaction, ticketId);
                } else if (customId === 'cancel_delete') {
                    await interaction.update({
                        content: '❌ Delete cancelled.',
                        embeds: [],
                        components: []
                    });
                } else if (customId.startsWith('ticket_transcript_')) {
                    const caseId = customId.split('_')[2];
                    await handleTicketTranscript(interaction, caseId);
                } else {
                    await interaction.reply({
                        content: '❌ Unknown ticket action.',
                        ephemeral: true
                    });
                }
                break;
        }
    } catch (error) {
        console.error('Ticket button interaction error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ An error occurred processing your request.',
                ephemeral: true
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
        const ticket = await getTicketByChannel(channel.id);
        
        if (!ticket) {
            return await interaction.editReply({
                content: '❌ This channel is not a ticket.'
            });
        }
        
        // Fetch messages in batches to get full history
        let allMessages = [];
        let lastMessageId = null;
        
        while (true) {
            const options = { limit: 100 };
            if (lastMessageId) {
                options.before = lastMessageId;
            }
            
            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) break;
            
            allMessages = allMessages.concat(Array.from(messages.values()));
            lastMessageId = messages.last().id;
            
            if (messages.size < 100) break; // No more messages
        }
        
        // Sort messages by creation date (oldest first)
        allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        
        // Generate transcript
        const transcriptId = `${ticket.ticketID}_${Date.now()}`;
        let transcript = `=== TICKET TRANSCRIPT ===\n`;
        transcript += `Ticket ID: ${ticket.ticketID}\n`;
        transcript += `Channel: ${channel.name} (${channel.id})\n`;
        transcript += `User: ${ticket.userID}\n`;
        transcript += `Reason: ${ticket.reason}\n`;
        transcript += `Created: ${ticket.createdAt}\n`;
        transcript += `Generated: ${new Date().toISOString()}\n`;
        transcript += `Total Messages: ${allMessages.length}\n\n`;
        transcript += `==========================================\n\n`;
        
        for (const msg of allMessages) {
            const timestamp = msg.createdAt.toISOString();
            const author = msg.author.tag;
            const content = msg.content || '[No text content]';
            
            transcript += `[${timestamp}] ${author}: ${content}\n`;
            
            // Include attachments
            if (msg.attachments.size > 0) {
                msg.attachments.forEach(attachment => {
                    transcript += `    📎 Attachment: ${attachment.name} (${attachment.url})\n`;
                });
            }
            
            // Include embeds
            if (msg.embeds.length > 0) {
                msg.embeds.forEach((embed, index) => {
                    transcript += `    📋 Embed ${index + 1}: ${embed.title || 'No Title'}\n`;
                    if (embed.description) {
                        transcript += `        Description: ${embed.description.substring(0, 200)}...\n`;
                    }
                });
            }
        }
        
        // Save transcript to file
        const fs = require('fs').promises;
        const path = require('path');
        const transcriptDir = path.join(process.cwd(), 'data', 'transcripts');
        const transcriptPath = path.join(transcriptDir, `${transcriptId}.txt`);
        
        await fs.mkdir(transcriptDir, { recursive: true });
        await fs.writeFile(transcriptPath, transcript);
        
        // Update ticket with transcript info
        const ticketsData = await loadTicketsData();
        for (const guildId in ticketsData) {
            const tickets = ticketsData[guildId];
            const ticketIndex = tickets.findIndex(t => t.channelID === channel.id);
            
            if (ticketIndex !== -1) {
                ticketsData[guildId][ticketIndex].transcriptId = transcriptId;
                ticketsData[guildId][ticketIndex].transcriptPath = transcriptPath;
                ticketsData[guildId][ticketIndex].transcriptGeneratedAt = new Date().toISOString();
                await saveTicketsData(ticketsData);
                break;
            }
        }
        
        await interaction.editReply({
            content: `✅ **Transcript Generated Successfully**\n📄 File: \`${transcriptId}.txt\`\n📊 Messages captured: ${allMessages.length}\n💾 Saved to: \`/data/transcripts/\``,
        });
        
    } catch (error) {
        console.error('Error generating transcript:', error);
        await interaction.editReply({
            content: '❌ Failed to generate transcript. Check logs for details.'
        });
    }
}

// Handle ticket reopen button
async function handleTicketReopen(interaction, ticketId) {
    try {
        const ticket = await getTicketByChannel(interaction.channel.id);
        
        if (!ticket) {
            return interaction.reply({
                content: '❌ This channel is not a ticket.',
                ephemeral: true
            });
        }

        // Update ticket status
        await updateTicketStatus(ticket.ticketID, 'open');

        const embed = new EmbedBuilder()
            .setTitle('🔓 Ticket Reopened')
            .setColor(0x00ff00)
            .addFields(
                { name: 'Ticket ID', value: ticket.ticketID, inline: true },
                { name: 'Reopened by', value: interaction.user.tag, inline: true },
                { name: 'Status', value: '🟢 Open', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error reopening ticket:', error);
        await interaction.reply({
            content: '❌ Failed to reopen ticket.',
            ephemeral: true
        });
    }
}

// Handle ticket delete button
async function handleTicketDelete(interaction, ticketId) {
    try {
        const ticket = await getTicketByChannel(interaction.channel.id);
        
        if (!ticket) {
            return interaction.reply({
                content: '❌ This channel is not a ticket.',
                ephemeral: true
            });
        }

        // Show confirmation
        const embed = new EmbedBuilder()
            .setTitle('⚠️ Delete Ticket Confirmation')
            .setColor(0xff0000)
            .setDescription('**WARNING:** This will permanently delete the ticket channel and all messages!')
            .addFields(
                { name: 'Ticket ID', value: ticket.ticketID, inline: true },
                { name: 'User', value: `<@${ticket.userID}>`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(new Date(ticket.createdAt).getTime() / 1000)}:R>`, inline: true }
            );

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_delete_${ticketId}`)
                    .setLabel('🗑️ DELETE FOREVER')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel_delete')
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [confirmRow], 
            ephemeral: true 
        });

    } catch (error) {
        console.error('Error showing delete confirmation:', error);
        await interaction.reply({
            content: '❌ Failed to show delete confirmation.',
            ephemeral: true
        });
    }
}

// Handle delete confirmation
async function handleDeleteConfirmation(interaction, ticketId) {
    try {
        const ticket = await getTicketByChannel(interaction.channel.id);
        
        if (ticket) {
            // Update ticket status before deletion
            await updateTicketStatus(ticket.ticketID, 'deleted');
        }

        await interaction.update({
            content: '🗑️ Deleting ticket in 5 seconds...',
            embeds: [],
            components: []
        });
        
        setTimeout(async () => {
            try {
                await interaction.channel.delete('Ticket deleted by staff');
            } catch (error) {
                console.error('Error deleting ticket channel:', error);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error confirming delete:', error);
        await interaction.update({
            content: '❌ Failed to delete ticket.',
            embeds: [],
            components: []
        });
    }
}

module.exports = {
    handleTicketMenu,
    handleTicketMenuInteraction,
    handleModalSubmit,
    handleTicketButtonInteraction,
    handleTicketReopen,
    handleTicketDelete,
    handleDeleteConfirmation
};
