const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const moderationManager = require('../../utils/moderationUtils');
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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        // Check if user is server owner or has required permissions
        if (interaction.guild.ownerId !== interaction.user.id && 
            !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: '❌ You need the "Manage Channels" permission or be the server owner to use this command.',
                flags: 64
            });
        }

        let subcommand;
        try {
            subcommand = interaction.options.getSubcommand();
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

        switch (subcommand) {
            case 'open':
                await handleOpenTicket(interaction);
                break;
            case 'close':
                await handleCloseTicket(interaction);
                break;
            case 'add':
                await handleAddUser(interaction);
                break;
            case 'remove':
                await handleRemoveUser(interaction);
                break;
            case 'transcript':
                await handleTranscript(interaction);
                break;
        }
    }
};

async function handleOpenTicket(interaction) {
    const reason = interaction.options.getString('reason');
    const category = interaction.options.getString('category') || 'general';
    const user = interaction.user;
    const guild = interaction.guild;

    try {
        // Check if user already has an open ticket using moderation manager
        const existingCases = moderationManager.getUserCases(user.id, guild.id);
        const openTickets = existingCases.filter(c => c.type === 'ticket' && c.status === 'open');

        if (openTickets.length > 0) {
            return interaction.reply({
                content: `❌ You already have an open ticket! Check <#${openTickets[0].channelId}>`,
                flags: 64
            });
        }

        // Create moderation case for ticket
        const ticketCase = moderationManager.createCase({
            type: 'ticket',
            userId: user.id,
            moderatorId: user.id, // User creates their own ticket
            guildId: guild.id,
            reason: reason,
            category: category,
            status: 'open',
            guildName: guild.name,
            moderatorTag: user.tag,
            userTag: user.tag,
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

        // Update case with channel ID
        moderationManager.updateCase(ticketCase.caseId, { 
            channelId: channel.id,
            channelName: channel.name
        });

        // Create ticket control buttons
        const controlRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_close_${ticketCase.caseId}`)
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId(`ticket_transcript_${ticketCase.caseId}`)
                    .setLabel('Generate Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📄')
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
            .setFooter({ text: `Sapphire Ticket System • Case #${ticketCase.caseId}`, iconURL: guild.iconURL() })
            .setTimestamp();

        await channel.send({ 
            content: `${user} Welcome to your support ticket!`, 
            embeds: [embed], 
            components: [controlRow] 
        });

        await interaction.reply({
            content: `✅ Ticket created successfully! Please check ${channel}\n🆔 **Case ID:** #${ticketCase.caseId}`,
            flags: 64
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
            .setFooter({ text: `Sapphire Ticket System • Case #${ticketCase.caseId}`, iconURL: interaction.guild.iconURL() })
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
        // Find ticket case by channel ID
        const allCases = moderationManager.getAllCases();
        const ticketCase = allCases.find(c => c.channelId === channel.id && c.type === 'ticket');

        if (!ticketCase) {
            return interaction.reply({
                content: '❌ This is not a ticket channel.',
                flags: 64
            });
        }

        await interaction.deferReply();

        const transcript = await generateTranscript(channel, ticketCase);
        
        if (transcript) {
            await interaction.editReply({
                content: '✅ Transcript generated successfully!',
                files: [transcript.attachment]
            });
        } else {
            await interaction.editReply({
                content: '❌ Failed to generate transcript.'
            });
        }

    } catch (error) {
        console.error('Error generating transcript:', error);
        await interaction.editReply({
            content: '❌ Failed to generate transcript. Please try again later.'
        });
    }
}

async function generateTranscript(channel, ticketCase) {
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

        // Generate HTML transcript with improved styling
        let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Ticket Transcript - Case #${ticketCase.caseId}</title>
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
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .header h1 { margin: 0 0 20px 0; font-size: 28px; }
        .header-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .header-item { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; }
        .header-item strong { display: block; margin-bottom: 5px; }
        .message { 
            margin: 15px 0; 
            padding: 15px; 
            background: #40444b; 
            border-radius: 8px; 
            border-left: 4px solid #7289da;
            transition: all 0.2s ease;
        }
        .message:hover { background: #42464d; }
        .message-header { display: flex; align-items: center; margin-bottom: 8px; }
        .author { 
            font-weight: bold; 
            color: #7289da; 
            margin-right: 10px;
            font-size: 16px;
        }
        .timestamp { 
            color: #72767d; 
            font-size: 12px; 
            background: rgba(0,0,0,0.2);
            padding: 2px 6px;
            border-radius: 4px;
        }
        .content { 
            margin-top: 8px; 
            white-space: pre-wrap; 
            word-wrap: break-word;
        }
        .embed { 
            border-left: 4px solid #faa61a; 
            background: rgba(250, 166, 26, 0.1);
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 0 8px 8px 0;
        }
        .embed-title { font-weight: bold; margin-bottom: 8px; color: #faa61a; }
        .attachment { 
            background: rgba(114, 137, 218, 0.1);
            border: 1px solid #7289da;
            padding: 10px; 
            margin: 5px 0; 
            border-radius: 6px;
            display: inline-block;
        }
        .attachment a { color: #7289da; text-decoration: none; }
        .attachment a:hover { text-decoration: underline; }
        .stats { 
            background: #2f3136; 
            padding: 20px; 
            border-radius: 8px; 
            margin-top: 30px;
            text-align: center;
        }
        .bot-message { border-left-color: #5865f2; }
        .system-message { border-left-color: #faa61a; background: #42424242; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎫 Sapphire Ticket Transcript</h1>
            <div class="header-grid">
                <div class="header-item">
                    <strong>🆔 Case ID</strong>
                    #${ticketCase.caseId}
                </div>
                <div class="header-item">
                    <strong>👤 User</strong>
                    ${ticketCase.userTag} (${ticketCase.userId})
                </div>
                <div class="header-item">
                    <strong>📂 Category</strong>
                    ${ticketCase.category || 'General'}
                </div>
                <div class="header-item">
                    <strong>📝 Reason</strong>
                    ${ticketCase.reason}
                </div>
                <div class="header-item">
                    <strong>⏰ Created</strong>
                    ${new Date(ticketCase.timestamp).toLocaleString()}
                </div>
                <div class="header-item">
                    <strong>📍 Channel</strong>
                    #${channel.name}
                </div>
                <div class="header-item">
                    <strong>📋 Status</strong>
                    ${ticketCase.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                </div>
                <div class="header-item">
                    <strong>🏠 Server</strong>
                    ${ticketCase.guildName}
                </div>
            </div>
        </div>
`;

        for (const message of messages) {
            const isBot = message.author.bot;
            const isSystem = message.author.system;
            const messageClass = isBot ? 'bot-message' : isSystem ? 'system-message' : '';
            
            html += `
        <div class="message ${messageClass}">
            <div class="message-header">
                <div class="author">${message.author.bot ? '🤖 ' : ''}${message.author.tag}</div>
                <div class="timestamp">${message.createdAt.toLocaleString()}</div>
            </div>
            <div class="content">${message.content ? message.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '<em>No text content</em>'}</div>
`;
            
            if (message.embeds.length > 0) {
                for (const embed of message.embeds) {
                    html += `
            <div class="embed">
                ${embed.title ? `<div class="embed-title">${embed.title}</div>` : ''}
                ${embed.description ? `<div>${embed.description}</div>` : ''}
                ${embed.fields && embed.fields.length > 0 ? 
                    embed.fields.map(field => 
                        `<div><strong>${field.name}:</strong> ${field.value}</div>`
                    ).join('') : ''
                }
            </div>`;
                }
            }

            if (message.attachments.size > 0) {
                for (const attachment of message.attachments.values()) {
                    html += `
            <div class="attachment">
                📎 <a href="${attachment.url}" target="_blank">${attachment.name}</a>
                <small>(${(attachment.size / 1024).toFixed(1)} KB)</small>
            </div>`;
                }
            }

            html += `        </div>`;
        }

        html += `
        <div class="stats">
            <h3>📊 Transcript Statistics</h3>
            <p><strong>Total Messages:</strong> ${messages.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Transcript ID:</strong> transcript-${ticketCase.caseId}-${Date.now()}</p>
        </div>
    </div>
</body>
</html>`;

        // Save transcript file
        const transcriptPath = path.join(__dirname, '../../transcripts');
        if (!fs.existsSync(transcriptPath)) {
            fs.mkdirSync(transcriptPath, { recursive: true });
        }

        const filename = `transcript-case-${ticketCase.caseId}-${Date.now()}.html`;
        const filepath = path.join(transcriptPath, filename);
        
        fs.writeFileSync(filepath, html);

        return {
            attachment: filepath,
            name: filename
        };

    } catch (error) {
        console.error('Error generating transcript:', error);
        return null;
    }
}
