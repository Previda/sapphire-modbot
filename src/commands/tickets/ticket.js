const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const moderationManager = require('../../utils/moderationUtils');
const { cleanupDeletedTickets } = require('../../utils/ticketUtils');
const { createCase } = require('../../utils/caseManager');
const dashboardLogger = require('../../utils/dashboardLogger');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket system commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('open')
                .setDescription('Open a support ticket')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for opening ticket')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Ticket category')
                        .setRequired(false)
                        .addChoices(
                            { name: 'General Support', value: 'general' },
                            { name: 'Ban Appeal', value: 'appeal' },
                            { name: 'Report User', value: 'report' },
                            { name: 'Bug Report', value: 'bug' },
                            { name: 'Other', value: 'other' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Close the current ticket')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for closing')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add user to ticket')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to add')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove user from ticket')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('transcript')
                .setDescription('Generate ticket transcript'))
        .setDefaultMemberPermissions(null), // Allow all users to create tickets

    async execute(interaction) {
        try {
            // Log command usage to dashboard
            const subcommand = interaction.options.getSubcommand();
            await dashboardLogger.logCommand(`ticket-${subcommand}`, interaction.user, interaction.guild, {
                subcommand: subcommand
            });
        } catch (error) {
            // No subcommand provided, show available actions
            const embed = new EmbedBuilder()
                .setTitle('🎫 Ticket System')
                .setColor(0x3498db)
                .setDescription('Available ticket commands:')
                .addFields(
                    { name: '/ticket open', value: 'Open a support ticket', inline: false },
                    { name: '/ticket close', value: 'Close the current ticket', inline: false },
                    { name: '/ticket add', value: 'Add user to ticket', inline: false },
                    { name: '/ticket remove', value: 'Remove user from ticket', inline: false },
                    { name: '/ticket transcript', value: 'Generate ticket transcript', inline: false }
                )
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        const subcommand = interaction.options.getSubcommand();
        
        try {
            switch (subcommand) {
                case 'open':
                    await handleOpenTicket(interaction);
                    break;
                case 'close':
                    // Only admins can close tickets manually
                    if (interaction.guild.ownerId !== interaction.user.id && 
                        !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                        return interaction.reply({
                            content: '❌ You need the "Manage Channels" permission or be the server owner to close tickets.',
                            flags: 64
                        });
                    }
                    await handleCloseTicket(interaction);
                    break;
                case 'add':
                    // Only admins can add users
                    if (interaction.guild.ownerId !== interaction.user.id && 
                        !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                        return interaction.reply({
                            content: '❌ You need the "Manage Channels" permission or be the server owner to add users to tickets.',
                            flags: 64
                        });
                    }
                    await handleAddUser(interaction);
                    break;
                case 'remove':
                    // Only admins can remove users
                    if (interaction.guild.ownerId !== interaction.user.id && 
                        !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                        return interaction.reply({
                            content: '❌ You need the "Manage Channels" permission or be the server owner to remove users from tickets.',
                            flags: 64
                        });
                    }
                    await handleRemoveUser(interaction);
                    break;
                case 'transcript':
                    // Anyone can generate transcript of their own ticket
                    await handleTranscript(interaction);
                    break;
            }
        } catch (error) {
            console.error(`Ticket ${subcommand} command error:`, error);
            await dashboardLogger.logError(error, interaction);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `❌ Failed to execute ticket ${subcommand} command. Please try again later.`,
                    ephemeral: true
                });
            }
        }
    }
};

async function handleOpenTicket(interaction) {
    const reason = interaction.options.getString('reason');
    const category = interaction.options.getString('category') || 'general';
    const user = interaction.user;
    const guild = interaction.guild;

    try {
        // Check if user is blacklisted
        const { isUserBlacklisted } = require('./blacklist.js');
        const isBlacklisted = await isUserBlacklisted(interaction.guild.id, user.id);
        
        if (isBlacklisted) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('🚫 Ticket Access Denied')
                    .setDescription('You are blacklisted from creating tickets in this server.')
                    .addFields(
                        { name: '📞 Contact', value: 'Contact server moderators if you believe this is a mistake.', inline: false }
                    )],
                ephemeral: true
            });
        }

        // Clean up any tickets with deleted channels first
        await cleanupDeletedTickets(interaction.guild);

        // Create case for ticket using new case system
        const ticketCase = await createCase({
            type: 'ticket',
            userId: user.id,
            moderatorId: user.id, // User creates their own ticket
            guildId: guild.id,
            reason: reason,
            status: 'open',
            appealable: false
        });

        // Create ticket channel
        const channel = await guild.channels.create({
            name: `${category}-${user.username}-${ticketCase.caseId}`,
            type: ChannelType.GuildText,
            topic: `Ticket by ${user.tag} | Case #${ticketCase.caseId} | Reason: ${reason}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: ['ViewChannel']
                },
                {
                    id: user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles']
                }
            ]
        });

        // Store ticket in local storage using ticket utils
        const { saveTicket } = require('../../utils/ticketUtils');
        await saveTicket({
            ticketID: `ticket-${ticketCase.caseId}`,
            caseId: ticketCase.caseId,
            userID: user.id,
            guildID: guild.id,
            channelID: channel.id,
            status: 'open',
            reason: reason,
            category: category,
            createdAt: new Date().toISOString(),
            createdBy: user.id
        });

        // Import required components
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        // Create ticket control buttons
        const controlRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`close_ticket`)
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId(`generate_transcript`)
                    .setLabel('Generate Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📋')
            );

        // Send welcome message
        const embed = new EmbedBuilder()
            .setTitle('🎫 Support Ticket Created')
            .setDescription(`Hello ${user}, your support ticket has been created!`)
            .addFields(
                { name: '📝 Reason', value: reason, inline: false },
                { name: '📂 Category', value: category.charAt(0).toUpperCase() + category.slice(1), inline: true },
                { name: '🆔 Case ID', value: `#${ticketCase.caseId}`, inline: true },
                { name: '⏰ Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '📋 Status', value: '🟢 Open', inline: true },
                { name: '🔧 Actions', value: 'Use the buttons below to manage this ticket', inline: false }
            )
            .setColor(0x00ff00)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Skyfall Ticket System • Case #${ticketCase.caseId}`, iconURL: guild.iconURL() })
            .setTimestamp();

        await channel.send({ 
            content: `${user} Welcome to your support ticket!`, 
            embeds: [embed], 
            components: [controlRow] 
        });

        await interaction.reply({
            content: `✅ Ticket created successfully! ${channel}`,
            ephemeral: true
        });

        // Log to mod channel if configured
        const modLogChannelId = process.env.MOD_LOG_CHANNEL_ID;
        if (modLogChannelId) {
            const modLogChannel = guild.channels.cache.get(modLogChannelId);
            if (modLogChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🎫 New Ticket Opened')
                    .addFields(
                        { name: '👤 User', value: `${user.tag}\n\`${user.id}\``, inline: true },
                        { name: '📂 Category', value: category, inline: true },
                        { name: '🆔 Case ID', value: `#${ticketCase.caseId}`, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '📍 Channel', value: `${channel}`, inline: true }
                    )
                    .setColor(0x00ff00)
                    .setTimestamp();
                await modLogChannel.send({ embeds: [logEmbed] });
            }
        }

    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.reply({
            content: '❌ Failed to create ticket. Please try again later.',
            flags: 64
        });
    }
}

async function handleCloseTicket(interaction) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const channel = interaction.channel;

    try {
        // Find ticket case by channel ID
        const allCases = moderationManager.getAllCases();
        const ticketCase = allCases.find(c => c.channelId === channel.id && c.type === 'ticket' && c.status === 'open');

        if (!ticketCase) {
            return interaction.reply({
                content: '❌ This is not an active ticket channel.',
                flags: 64
            });
        }

        // Generate transcript before closing
        const transcriptFile = await generateTranscript(channel, ticketCase);

        // Update ticket status to closed
        moderationManager.updateCase(ticketCase.caseId, { 
            status: 'closed',
            closedBy: interaction.user.id,
            closedByTag: interaction.user.tag,
            closeReason: reason,
            closedAt: Date.now(),
            transcriptFile: transcriptFile ? transcriptFile.name : null
        });

        const embed = new EmbedBuilder()
            .setTitle('🔒 Ticket Closed')
            .setDescription(`Ticket has been closed by ${interaction.user.tag}`)
            .addFields(
                { name: '🆔 Case ID', value: `#${ticketCase.caseId}`, inline: true },
                { name: '👤 Closed By', value: interaction.user.tag, inline: true },
                { name: '📋 Status', value: '🔴 Closed', inline: true },
                { name: '📝 Close Reason', value: reason, inline: false },
                { name: '⏰ Closed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📄 Transcript', value: transcriptFile ? '✅ Generated' : '❌ Failed to generate', inline: true }
            )
            .setColor(0xff0000)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Skyfall Ticket System • Case #${ticketCase.caseId}`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        if (transcriptFile) {
            embed.addFields({
                name: '📎 Download Transcript',
                value: 'Transcript has been saved and will be available in mod logs.',
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });

        // Log to mod channel if configured
        const modLogChannelId = process.env.MOD_LOG_CHANNEL_ID;
        if (modLogChannelId) {
            const modLogChannel = interaction.guild.channels.cache.get(modLogChannelId);
            if (modLogChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🔒 Ticket Closed')
                    .addFields(
                        { name: '👤 Original User', value: `<@${ticketCase.userId}>\n\`${ticketCase.userId}\``, inline: true },
                        { name: '👮 Closed By', value: `${interaction.user.tag}\n\`${interaction.user.id}\``, inline: true },
                        { name: '🆔 Case ID', value: `#${ticketCase.caseId}`, inline: true },
                        { name: '📂 Category', value: ticketCase.category || 'general', inline: true },
                        { name: '📝 Original Reason', value: ticketCase.reason, inline: false },
                        { name: '📝 Close Reason', value: reason, inline: false }
                    )
                    .setColor(0xff0000)
                    .setTimestamp();

                const components = [];
                if (transcriptFile) {
                    components.push({ files: [transcriptFile.attachment] });
                    logEmbed.addFields({
                        name: '📄 Transcript',
                        value: 'See attached file',
                        inline: true
                    });
                }

                await modLogChannel.send({ embeds: [logEmbed], ...components });
            }
        }

        // Delete channel after 30 seconds to allow reading
        setTimeout(async () => {
            try {
                await channel.delete('Ticket closed and archived');
            } catch (error) {
                console.error('Error deleting ticket channel:', error);
            }
        }, 30000);

    } catch (error) {
        console.error('Error closing ticket:', error);
        await interaction.reply({
            content: '❌ Failed to close ticket. Please try again later.',
            ephemeral: true
        });
    }
}

async function handleAddUser(interaction) {
    const targetUser = interaction.options.getUser('user');
    const channel = interaction.channel;

    try {
        // Find ticket case by channel ID
        const allCases = moderationManager.getAllCases();
        const ticketCase = allCases.find(c => c.channelId === channel.id && c.type === 'ticket' && c.status === 'open');

        if (!ticketCase) {
            return interaction.reply({
                content: '❌ This is not an active ticket channel.',
                flags: 64
            });
        }

        // Check if user is already in ticket
        const existingPermissions = channel.permissionOverwrites.cache.get(targetUser.id);
        if (existingPermissions && existingPermissions.allow.has('ViewChannel')) {
            return interaction.reply({
                content: `❌ ${targetUser.tag} is already added to this ticket.`,
                flags: 64
            });
        }

        // Add user permissions
        await channel.permissionOverwrites.create(targetUser, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            AttachFiles: true
        });

        // Update case with added user
        const currentUsers = ticketCase.addedUsers || [];
        if (!currentUsers.includes(targetUser.id)) {
            currentUsers.push(targetUser.id);
            moderationManager.updateCase(ticketCase.caseId, { addedUsers: currentUsers });
        }

        const embed = new EmbedBuilder()
            .setTitle('👤 User Added to Ticket')
            .setDescription(`${targetUser.tag} has been added to this ticket.`)
            .addFields(
                { name: '🆔 Case ID', value: `#${ticketCase.caseId}`, inline: true },
                { name: '👤 Added User', value: `${targetUser.tag}\n\`${targetUser.id}\``, inline: true },
                { name: '👮 Added By', value: interaction.user.tag, inline: true }
            )
            .setColor(0x00ff00)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Send notification to added user
        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle('🎫 Added to Support Ticket')
                .setDescription(`You have been added to a support ticket in **${interaction.guild.name}**.`)
                .addFields(
                    { name: '🆔 Case ID', value: `#${ticketCase.caseId}`, inline: true },
                    { name: '📍 Channel', value: `${channel}`, inline: true },
                    { name: '👮 Added By', value: interaction.user.tag, inline: true }
                )
                .setColor(0x00ff00)
                .setTimestamp();

            await targetUser.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log('Could not DM added user');
        }

    } catch (error) {
        console.error('Error adding user to ticket:', error);
        await interaction.reply({
            content: '❌ Failed to add user to ticket. Please check permissions.',
            ephemeral: true
        });
    }
}

async function handleRemoveUser(interaction) {
    const targetUser = interaction.options.getUser('user');
    const channel = interaction.channel;

    try {
        // Find ticket case by channel ID
        const allCases = moderationManager.getAllCases();
        const ticketCase = allCases.find(c => c.channelId === channel.id && c.type === 'ticket' && c.status === 'open');

        if (!ticketCase) {
            return interaction.reply({
                content: '❌ This is not an active ticket channel.',
                flags: 64
            });
        }

        // Check if user is the ticket owner
        if (targetUser.id === ticketCase.userId) {
            return interaction.reply({
                content: '❌ Cannot remove the ticket owner from their own ticket.',
                flags: 64
            });
        }

        // Check if user has permissions in ticket
        const existingPermissions = channel.permissionOverwrites.cache.get(targetUser.id);
        if (!existingPermissions || !existingPermissions.allow.has('ViewChannel')) {
            return interaction.reply({
                content: `❌ ${targetUser.tag} is not currently in this ticket.`,
                flags: 64
            });
        }

        // Remove user permissions
        await channel.permissionOverwrites.delete(targetUser);

        // Update case by removing user from added users
        const currentUsers = ticketCase.addedUsers || [];
        const updatedUsers = currentUsers.filter(userId => userId !== targetUser.id);
        moderationManager.updateCase(ticketCase.caseId, { addedUsers: updatedUsers });

        const embed = new EmbedBuilder()
            .setTitle('👤 User Removed from Ticket')
            .setDescription(`${targetUser.tag} has been removed from this ticket.`)
            .addFields(
                { name: '🆔 Case ID', value: `#${ticketCase.caseId}`, inline: true },
                { name: '👤 Removed User', value: `${targetUser.tag}\n\`${targetUser.id}\``, inline: true },
                { name: '👮 Removed By', value: interaction.user.tag, inline: true }
            )
            .setColor(0xff9900)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Send notification to removed user
        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle('🎫 Removed from Support Ticket')
                .setDescription(`You have been removed from a support ticket in **${interaction.guild.name}**.`)
                .addFields(
                    { name: '🆔 Case ID', value: `#${ticketCase.caseId}`, inline: true },
                    { name: '👮 Removed By', value: interaction.user.tag, inline: true }
                )
                .setColor(0xff9900)
                .setTimestamp();

            await targetUser.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log('Could not DM removed user');
        }

    } catch (error) {
        console.error('Error removing user from ticket:', error);
        await interaction.reply({
            content: '❌ Failed to remove user from ticket. Please check permissions.',
            ephemeral: true
        });
    }
}

async function handleTranscript(interaction) {
    const channel = interaction.channel;

    try {
        await interaction.deferReply();

        // Check if this is a ticket channel by name pattern
        if (!channel.name.includes('ticket') && !channel.name.includes('appeal') && !channel.name.includes('support')) {
            return interaction.editReply({
                content: '❌ This command can only be used in ticket channels.'
            });
        }

        // Generate basic transcript without requiring case data
        const transcript = await generateBasicTranscript(channel);
        
        if (transcript) {
            await interaction.editReply({
                content: '✅ Transcript generated successfully!',
                files: [{ attachment: transcript.path, name: transcript.filename }]
            });
        } else {
            await interaction.editReply({
                content: '❌ Failed to generate transcript. Please check permissions and try again.'
            });
        }

    } catch (error) {
        console.error('Error generating transcript:', error);
        
        // Ensure we respond if deferred
        if (interaction.deferred) {
            await interaction.editReply({
                content: '❌ An error occurred while generating the transcript. Please try again later.'
            });
        } else {
            await interaction.reply({
                content: '❌ An error occurred while generating the transcript. Please try again later.',
                ephemeral: true
            });
        }
    }
}

async function generateBasicTranscript(channel) {
    try {
        // Fetch all messages
        const messages = [];
        let lastMessageId;

        while (true) {
            const options = { limit: 100 };
            if (lastMessageId) options.before = lastMessageId;

            const fetchedMessages = await channel.messages.fetch(options);
            if (fetchedMessages.size === 0) break;

            messages.push(...fetchedMessages.values());
            lastMessageId = fetchedMessages.last().id;
        }

        // Sort messages by timestamp
        messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        // Generate simple HTML transcript
        let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Ticket Transcript - ${channel.name}</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #36393f; 
            color: #dcddde; 
            line-height: 1.4;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            background: linear-gradient(135deg, #5865f2, #7289da); 
            padding: 30px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
        }
        .message { 
            margin: 15px 0; 
            padding: 15px; 
            background: #40444b; 
            border-radius: 8px; 
            border-left: 4px solid #7289da;
        }
        .message-header { display: flex; align-items: center; margin-bottom: 8px; }
        .author { font-weight: bold; color: #7289da; margin-right: 10px; }
        .timestamp { color: #72767d; font-size: 12px; }
        .content { margin-top: 8px; white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎫 Ticket Transcript</h1>
            <p><strong>Channel:</strong> #${channel.name}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
`;

        for (const message of messages) {
            html += `
        <div class="message">
            <div class="message-header">
                <div class="author">${message.author.bot ? '🤖 ' : ''}${message.author.tag}</div>
                <div class="timestamp">${message.createdAt.toLocaleString()}</div>
            </div>
            <div class="content">${message.content ? message.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '<em>No text content</em>'}</div>
        </div>`;
        }

        html += `
    </div>
</body>
</html>`;

        // Save transcript file
        const transcriptPath = path.join(process.cwd(), 'data', 'transcripts');
        if (!fs.existsSync(transcriptPath)) {
            fs.mkdirSync(transcriptPath, { recursive: true });
        }

        const filename = `transcript-${channel.name}-${Date.now()}.html`;
        const filepath = path.join(transcriptPath, filename);
        
        fs.writeFileSync(filepath, html);

        return {
            path: filepath,
            filename: filename
        };

    } catch (error) {
        console.error('Error generating basic transcript:', error);
        return null;
    }
}
