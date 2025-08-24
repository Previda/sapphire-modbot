const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

async function handleTicketButtons(interaction) {
    const buttonId = interaction.customId;

    try {
        switch (buttonId) {
            case 'ticket_list':
                await listAllTickets(interaction);
                break;
            case 'ticket_create':
                await showCreateTicketModal(interaction);
                break;
            case 'ticket_close_menu':
                await showCloseConfirmation(interaction);
                break;
            case 'ticket_add_user':
                await showAddUserModal(interaction);
                break;
            case 'ticket_remove_user':
                await showRemoveUserModal(interaction);
                break;
            case 'ticket_slowmode':
                await showSlowmodeModal(interaction);
                break;
            case 'ticket_transcript':
                await generateTranscript(interaction);
                break;
            case 'ticket_settings':
                await showTicketSettings(interaction);
                break;
            case 'confirm_close':
                await confirmCloseTicket(interaction);
                break;
            case 'cancel_close':
                await cancelCloseTicket(interaction);
                break;
            default:
                await interaction.reply({ content: '❌ Unknown button interaction.', flags: 64 });
        }
    } catch (error) {
        console.error('Ticket button error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ An error occurred processing your request.', flags: 64 });
        }
    }
}

async function listAllTickets(interaction) {
    const { getTickets } = require('./ticketUtils');
    const tickets = await getTickets(interaction.guild.id);
    
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

    for (const ticket of tickets.slice(0, 10)) {
        const channel = interaction.guild.channels.cache.get(ticket.channelID);
        const user = await interaction.client.users.fetch(ticket.userID).catch(() => null);
        
        embed.addFields({
            name: `🎫 ${ticket.ticketID}`,
            value: `**User:** ${user ? user.tag : 'Unknown'}\n**Channel:** ${channel ? channel.toString() : 'Deleted'}\n**Reason:** ${ticket.reason}\n**Created:** <t:${Math.floor(new Date(ticket.createdAt).getTime() / 1000)}:R>`,
            inline: true
        });
    }

    await interaction.reply({ embeds: [embed], flags: 64 });
}

async function showCreateTicketModal(interaction) {
    // Determine ticket type from button ID
    const ticketType = interaction.customId.includes('_') ? 
        interaction.customId.split('_')[2] : 'general';
    
    const ticketTypeMap = {
        'general': { title: 'General Support', emoji: '🎫' },
        'technical': { title: 'Technical Help', emoji: '⚙️' },
        'report': { title: 'Report Issue', emoji: '📝' },
        'billing': { title: 'Billing Support', emoji: '💰' }
    };
    
    const typeInfo = ticketTypeMap[ticketType] || ticketTypeMap.general;

    const modal = new ModalBuilder()
        .setCustomId(`create_ticket_modal_${ticketType}`)
        .setTitle(`${typeInfo.emoji} ${typeInfo.title}`);

    const userInput = new TextInputBuilder()
        .setCustomId('ticket_user')
        .setLabel('User ID or @mention')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('Enter user ID or @username');

    const subjectInput = new TextInputBuilder()
        .setCustomId('ticket_subject')
        .setLabel('Subject/Title')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100)
        .setPlaceholder('Brief title for your issue...');

    const reasonInput = new TextInputBuilder()
        .setCustomId('ticket_reason')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000)
        .setPlaceholder('Please describe your issue or question in detail...');

    const priorityInput = new TextInputBuilder()
        .setCustomId('ticket_priority')
        .setLabel('Priority Level (Low/Medium/High)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(10)
        .setPlaceholder('Low');

    const categoryInput = new TextInputBuilder()
        .setCustomId('ticket_category')
        .setLabel('Category (general/appeal/report/bug/staff)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue('general');

    // For user-created tickets from panel, remove user input field
    if (ticketType !== 'staff') {
        const firstRow = new ActionRowBuilder().addComponents(subjectInput);
        const secondRow = new ActionRowBuilder().addComponents(reasonInput);
        const thirdRow = new ActionRowBuilder().addComponents(priorityInput);
        modal.addComponents(firstRow, secondRow, thirdRow);
    } else {
        // For staff-created tickets, keep user input
        const firstRow = new ActionRowBuilder().addComponents(userInput);
        const secondRow = new ActionRowBuilder().addComponents(subjectInput);
        const thirdRow = new ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(firstRow, secondRow, thirdRow);
    }
    await interaction.showModal(modal);
}

async function showCloseConfirmation(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🔒 Close Ticket Confirmation')
        .setDescription('Are you sure you want to close this ticket?')
        .addFields(
            { name: '📄 Action', value: 'Generate transcript and close ticket', inline: false },
            { name: '⚠️ Warning', value: 'This action cannot be undone!', inline: false }
        )
        .setColor(0xff6b6b)
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_close')
                .setLabel('✅ Confirm Close')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel_close')
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
}

async function confirmCloseTicket(interaction) {
    // Generate transcript first
    const { generateTicketTranscript } = require('../commands/tickets/ticket');
    await generateTicketTranscript(interaction.channel);

    // Close the ticket
    await interaction.update({ 
        content: '🔒 **Ticket closed successfully!** Transcript has been generated.',
        embeds: [], 
        components: [] 
    });

    // Delete channel after 5 seconds
    setTimeout(async () => {
        try {
            await interaction.channel.delete('Ticket closed by staff');
        } catch (error) {
            console.error('Error deleting ticket channel:', error);
        }
    }, 5000);
}

async function cancelCloseTicket(interaction) {
    await interaction.update({ 
        content: '❌ Ticket closure cancelled.', 
        embeds: [], 
        components: [] 
    });
}

async function showAddUserModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('add_user_modal')
        .setTitle('Add User to Ticket');

    const userInput = new TextInputBuilder()
        .setCustomId('add_user_id')
        .setLabel('User ID or @mention')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('Enter user ID or @username');

    const row = new ActionRowBuilder().addComponents(userInput);
    modal.addComponents(row);
    await interaction.showModal(modal);
}

async function showRemoveUserModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('remove_user_modal')
        .setTitle('Remove User from Ticket');

    const userInput = new TextInputBuilder()
        .setCustomId('remove_user_id')
        .setLabel('User ID or @mention')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('Enter user ID or @username');

    const row = new ActionRowBuilder().addComponents(userInput);
    modal.addComponents(row);
    await interaction.showModal(modal);
}

async function showSlowmodeModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('slowmode_modal')
        .setTitle('Set Channel Slowmode');

    const durationInput = new TextInputBuilder()
        .setCustomId('slowmode_duration')
        .setLabel('Slowmode duration (seconds, 0-21600)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue('0')
        .setPlaceholder('Enter seconds (0 to disable)');

    const row = new ActionRowBuilder().addComponents(durationInput);
    modal.addComponents(row);
    await interaction.showModal(modal);
}

async function generateTranscript(interaction) {
    try {
        const { generateTicketTranscript } = require('../commands/tickets/ticket');
        const result = await generateTicketTranscript(interaction.channel);
        
        if (result) {
            await interaction.reply({
                content: '📄 **Transcript generated successfully!**\nTranscript has been saved and can be retrieved later.',
                flags: 64
            });
        } else {
            await interaction.reply({
                content: '❌ Failed to generate transcript. Please try again.',
                flags: 64
            });
        }
    } catch (error) {
        console.error('Error generating transcript:', error);
        await interaction.reply({
            content: '❌ Error generating transcript. Please try again.',
            flags: 64
        });
    }
}

async function showTicketSettings(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('⚙️ Ticket System Settings')
        .setColor(0x0099ff)
        .setDescription('Configure your ticket system settings')
        .addFields(
            { name: '🎫 Categories Available', value: 'General, Appeal, Report, Bug, Staff', inline: false },
            { name: '📋 Features Enabled', value: '• Auto transcripts\n• User mentions\n• Permission management\n• Slowmode control', inline: false },
            { name: '🔧 Management Options', value: 'Use `/manage menu` for interactive controls', inline: false },
            { name: '💾 Storage', value: 'Using local JSON storage with Google Cloud backup', inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
}

module.exports = { handleTicketButtons };
