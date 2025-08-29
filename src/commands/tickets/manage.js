const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType } = require('discord.js');
const { getGuildConfig } = require('../admin/setup');
const webhookLogger = require('../../utils/webhookLogger');
const fs = require('fs').promises;
const path = require('path');

// Ticket storage
const TICKETS_FILE = path.join(process.cwd(), 'data', 'tickets.json');

async function loadTickets() {
    try {
        const data = await fs.readFile(TICKETS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function saveTickets(tickets) {
    try {
        const dataDir = path.dirname(TICKETS_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2));
    } catch (error) {
        console.error('Failed to save tickets:', error);
    }
}

// Settings handlers
async function handleCategoriesSettings(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🏷️ Ticket Categories Management')
        .setColor(0x0099ff)
        .setDescription('Configure available ticket categories')
        .addFields(
            { name: '📋 Current Categories', value: '• **General** - General support tickets\n• **Appeal** - Ban/mute appeals\n• **Report** - User/rule violations\n• **Bug** - Technical issues\n• **Staff** - Staff applications', inline: false },
            { name: '🔧 Category Features', value: '• Auto-role assignment\n• Custom permissions per category\n• Dedicated channels\n• Priority levels', inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handlePermissionsSettings(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🔐 Permission Settings')
        .setColor(0xff9900)
        .setDescription('Current permission configuration')
        .addFields(
            { name: '👥 Staff Roles Detected', value: 'Auto-detecting: `staff`, `mod`, `moderator`, `admin`, `administrator`, `support`', inline: false },
            { name: '🎫 Ticket Permissions', value: '• Staff can view all tickets\n• Users can only view their tickets\n• Admins can delete tickets\n• Mods can close/reopen tickets', inline: false },
            { name: '📍 Channel Permissions', value: '• Private channels for ticket creators\n• Staff get automatic access\n• Read/Send message permissions managed', inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleChannelsSettings(interaction) {
    const guild = interaction.guild;
    const ticketCategory = guild.channels.cache.find(ch => ch.type === 4 && ch.name.toLowerCase().includes('ticket'));
    const logsChannel = guild.channels.cache.find(ch => 
        ch.name.toLowerCase().includes('ticket') && ch.name.toLowerCase().includes('log')
    ) || guild.channels.cache.find(ch => ch.name.toLowerCase().includes('transcript'));
    
    const embed = new EmbedBuilder()
        .setTitle('📍 Channel Setup')
        .setColor(0x00ff00)
        .setDescription('Configure ticket system channels')
        .addFields(
            { 
                name: '🏷️ Ticket Category', 
                value: ticketCategory ? `✅ Found: ${ticketCategory.name}` : '❌ **Create a category named "Tickets" or "Support"**',
                inline: false 
            },
            { 
                name: '📋 Logs Channel', 
                value: logsChannel ? `✅ Found: ${logsChannel.name}` : '❌ **Create a channel named "ticket-logs" or "transcripts"**',
                inline: false 
            },
            { 
                name: '📝 Setup Instructions', 
                value: '1. Create category: **"🎫 Tickets"**\n2. Create channel: **"ticket-logs"**\n3. Set permissions for staff roles\n4. Run `/manage menu` to test',
                inline: false 
            }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleFeaturesSettings(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('⚡ Feature Settings')
        .setColor(0x9900ff)
        .setDescription('Ticket system features and capabilities')
        .addFields(
            { name: '✅ Active Features', value: '• **Auto Transcripts** - Generated on ticket close\n• **DM Transcripts** - Sent to ticket creator\n• **Staff Mentions** - Auto-ping relevant staff\n• **Control Buttons** - Close, reopen, delete, transcript\n• **Permission Management** - Auto-setup channel permissions\n• **Logs Channel** - Save transcripts to designated channel', inline: false },
            { name: '🔄 Workflow', value: '1. User creates ticket\n2. Staff gets mentioned\n3. Support conversation\n4. Generate transcript\n5. Close ticket\n6. Auto-cleanup', inline: false },
            { name: '📊 Statistics', value: 'Use `/manage list` to see active tickets and usage stats', inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manage')
        .setDescription('🎫 Manage tickets and server settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('menu')
                .setDescription('Show interactive ticket creation menu'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all active tickets')
                .addStringOption(option =>
                    option.setName('status')
                        .setDescription('Filter by ticket status')
                        .addChoices(
                            { name: 'Open', value: 'open' },
                            { name: 'Closed', value: 'closed' },
                            { name: 'All', value: 'all' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a ticket for a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to create ticket for')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Ticket category')
                        .addChoices(
                            { name: '💬 General Support', value: 'general' },
                            { name: '📋 Appeal', value: 'appeal' },
                            { name: '🚨 Report', value: 'report' },
                            { name: '🐛 Bug Report', value: 'bug' },
                            { name: '👥 Staff Application', value: 'staff' }
                        ))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for ticket creation')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Close a ticket')
                .addChannelOption(option =>
                    option.setName('ticket')
                        .setDescription('Ticket channel to close')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for closing')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('Configure ticket system settings')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Settings category')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Categories', value: 'categories' },
                            { name: 'Permissions', value: 'permissions' },
                            { name: 'Channels', value: 'channels' }
                        )))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'menu':
                await showTicketMenu(interaction);
                break;
            case 'list':
                await listTickets(interaction);
                break;
            case 'create':
                await createTicketForUser(interaction);
                break;
            case 'settings':
                await showTicketSettings(interaction);
                break;
        }
    }
};

async function showTicketMenu(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🎫 Advanced Ticket Management')
        .setDescription('Complete ticket management system with all features')
        .setColor(0x0099ff)
        .addFields(
            { name: '📋 Quick Actions', value: 'Use buttons below for instant ticket management', inline: false },
            { name: '🔧 Features', value: '• Create tickets for any user\n• List and manage all tickets\n• Generate transcripts\n• Set slowmode and permissions\n• Close with confirmation', inline: false }
        )
        .setTimestamp();

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_list')
                .setLabel('📋 List Tickets')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('ticket_create')
                .setLabel('➕ Create Ticket')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('ticket_close_menu')
                .setLabel('🔒 Close Current')
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
                .setLabel('⏱️ Slowmode')
                .setStyle(ButtonStyle.Secondary)
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_transcript')
                .setLabel('📄 Transcript')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ticket_settings')
                .setLabel('⚙️ Settings')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ 
        embeds: [embed], 
        components: [row1, row2, row3] 
    });
}

async function listTickets(interaction) {
    try {
        const [tickets] = await pool.execute(
            'SELECT * FROM tickets WHERE guildID = ? AND status = "open" ORDER BY createdAt DESC',
            [interaction.guild.id]
        );

        if (tickets.length === 0) {
            return interaction.reply({
                content: '📋 No open tickets found.',
                ephemeral: true
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

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error listing tickets:', error);
        await interaction.reply({
            content: '❌ Failed to list tickets.',
            ephemeral: true
        });
    }
}

async function createTicketForUser(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const category = interaction.options.getString('category') || 'staff';

    try {
        // Allow multiple tickets per user - restriction removed

        // Generate ticket ID
        const ticketID = `ticket-${Date.now()}`;
        
        // Create ticket channel
        const channel = await interaction.guild.channels.create({
            name: `${category}-${user.username}`,
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

        // Store ticket data locally using ticketUtils
        const { saveTicket } = require('../../utils/ticketUtils');
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

        // Find staff role (common names)
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
                { name: '📝 Reason', value: reason, inline: false },
                { name: '📂 Category', value: category, inline: true },
                { name: '🆔 Ticket ID', value: ticketID, inline: true },
                { name: '👤 Created by', value: interaction.user.tag, inline: true }
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
            content: `✅ Ticket created successfully for ${user.tag}!\n🎫 Channel: ${channel}\n🆔 ID: ${ticketID}`,
            ephemeral: false
        });

    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.reply({
            content: '❌ Failed to create ticket. Please try again.',
            ephemeral: true
        });
    }
}

async function showTicketSettings(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('⚙️ Ticket System Settings')
        .setColor(0x0099ff)
        .setDescription('Configure your ticket system settings and features')
        .addFields(
            { name: '🎫 Available Categories', value: '• **General** - General support\n• **Appeal** - Ban appeals\n• **Report** - User reports\n• **Bug** - Bug reports\n• **Staff** - Staff applications', inline: false },
            { name: '📋 Current Features', value: '✅ Auto transcripts\n✅ Staff mentions\n✅ Permission management\n✅ Control buttons\n✅ DM transcripts\n✅ Logs channel save', inline: false },
            { name: '🔧 Channel Setup', value: '• Create channels named `ticket-logs` or `transcripts` for auto-logging\n• Staff roles: `staff`, `mod`, `admin`, `support` are auto-detected', inline: false },
            { name: '🎛️ Quick Actions', value: 'Use the buttons below to manage settings', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Powered by Skyfall', iconURL: interaction.client.user.displayAvatarURL() });

    const settingsRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('settings_categories')
                .setLabel('🏷️ Manage Categories')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('settings_permissions')
                .setLabel('🔐 Permissions')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('settings_channels')
                .setLabel('📍 Setup Channels')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('settings_features')
                .setLabel('⚡ Features')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ 
        embeds: [embed], 
        components: [settingsRow], 
        ephemeral: true 
    });
}
