const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const TICKET_CONFIG_FILE = path.join(__dirname, '../../../data/ticket-config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('🎫 Complete ticket system management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup ticket system'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('panel')
                .setDescription('Send ticket panel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to send panel')
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('category')
                .setDescription('Add/edit ticket category')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Category name (e.g., Support, Report, Appeal)')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('emoji')
                        .setDescription('Category emoji')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('description')
                        .setDescription('Category description')
                        .setRequired(true))
                .addRoleOption(option =>
                    option
                        .setName('ping_role')
                        .setDescription('Role to ping when ticket is created'))
                .addChannelOption(option =>
                    option
                        .setName('category_channel')
                        .setDescription('Discord category for tickets')
                        .addChannelTypes(ChannelType.GuildCategory)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-category')
                .setDescription('Remove a ticket category')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Category name to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all ticket categories'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Close current ticket')
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Reason for closing')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add user to ticket')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to add')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove user from ticket')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View ticket statistics'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup':
                await handleSetup(interaction);
                break;
            case 'panel':
                await handlePanel(interaction);
                break;
            case 'category':
                await handleCategory(interaction);
                break;
            case 'remove-category':
                await handleRemoveCategory(interaction);
                break;
            case 'list':
                await handleList(interaction);
                break;
            case 'close':
                await handleClose(interaction);
                break;
            case 'add':
                await handleAdd(interaction);
                break;
            case 'remove':
                await handleRemove(interaction);
                break;
            case 'stats':
                await handleStats(interaction);
                break;
        }
    }
};

async function loadConfig(guildId) {
    try {
        const data = await fs.readFile(TICKET_CONFIG_FILE, 'utf8');
        const allConfigs = JSON.parse(data);
        return allConfigs[guildId] || getDefaultConfig();
    } catch (error) {
        return getDefaultConfig();
    }
}

async function saveConfig(guildId, config) {
    try {
        let allConfigs = {};
        try {
            const data = await fs.readFile(TICKET_CONFIG_FILE, 'utf8');
            allConfigs = JSON.parse(data);
        } catch (error) {
            // File doesn't exist
        }
        allConfigs[guildId] = config;
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(TICKET_CONFIG_FILE), { recursive: true });
        await fs.writeFile(TICKET_CONFIG_FILE, JSON.stringify(allConfigs, null, 2));
    } catch (error) {
        console.error('Error saving ticket config:', error);
    }
}

function getDefaultConfig() {
    return {
        enabled: false,
        categories: [],
        ticketChannel: null,
        supportRole: null,
        transcriptChannel: null,
        ticketCount: 0
    };
}

async function handleSetup(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
        const guild = interaction.guild;
        const config = await loadConfig(guild.id);

        // Create ticket category
        const ticketCategory = await guild.channels.create({
            name: '📋 TICKETS',
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: guild.members.me,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels]
                }
            ]
        });

        // Create ticket panel channel
        const panelChannel = await guild.channels.create({
            name: '🎫-create-ticket',
            type: ChannelType.GuildText,
            topic: 'Click the button below to create a support ticket',
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                    deny: [PermissionFlagsBits.SendMessages]
                },
                {
                    id: guild.members.me,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                }
            ]
        });

        // Create transcript channel
        const transcriptChannel = await guild.channels.create({
            name: '📜-ticket-logs',
            type: ChannelType.GuildText,
            parent: ticketCategory,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: guild.members.me,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                }
            ]
        });

        // Add default categories
        config.enabled = true;
        config.ticketChannel = panelChannel.id;
        config.transcriptChannel = transcriptChannel.id;
        config.categoryChannel = ticketCategory.id;
        config.categories = [
            {
                name: 'Support',
                emoji: '🆘',
                description: 'Get help from our support team',
                pingRole: null
            },
            {
                name: 'Report',
                emoji: '⚠️',
                description: 'Report a user or issue',
                pingRole: null
            },
            {
                name: 'Question',
                emoji: '❓',
                description: 'Ask a question',
                pingRole: null
            }
        ];

        await saveConfig(guild.id, config);

        // Send panel
        await sendTicketPanel(panelChannel, config);

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Ticket System Created!')
                .setDescription('The ticket system is now active!')
                .addFields(
                    { name: '🎫 Panel Channel', value: panelChannel.toString(), inline: true },
                    { name: '📋 Category', value: ticketCategory.toString(), inline: true },
                    { name: '📜 Logs', value: transcriptChannel.toString(), inline: true }
                )
                .addFields({
                    name: '📝 Next Steps',
                    value: 
                        '• Use `/ticket category` to add custom categories\n' +
                        '• Use `/ticket panel` to send a new panel\n' +
                        '• Users can now create tickets!'
                })
                .setTimestamp()
            ]
        });

    } catch (error) {
        console.error('Ticket setup error:', error);
        await interaction.editReply({
            content: `❌ Setup failed: ${error.message}`
        });
    }
}

async function handlePanel(interaction) {
    await interaction.deferReply({ flags: 64 });

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const config = await loadConfig(interaction.guild.id);

    if (!config.enabled || config.categories.length === 0) {
        return interaction.editReply({
            content: '❌ Ticket system not set up! Use `/ticket setup` first.'
        });
    }

    await sendTicketPanel(channel, config);

    await interaction.editReply({
        content: `✅ Ticket panel sent to ${channel}!`
    });
}

async function sendTicketPanel(channel, config) {
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎫 Support Tickets')
        .setDescription(
            '**Need help? Create a ticket!**\n\n' +
            'Click the button below to create a support ticket.\n' +
            'Our team will respond as soon as possible.\n\n' +
            '**Available Categories:**\n' +
            config.categories.map(cat => `${cat.emoji} **${cat.name}** - ${cat.description}`).join('\n')
        )
        .setFooter({ text: 'Click the button below to get started' })
        .setTimestamp();

    const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Create Ticket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary)
        );

    await channel.send({ embeds: [embed], components: [button] });
}

async function handleCategory(interaction) {
    await interaction.deferReply({ flags: 64 });

    const name = interaction.options.getString('name');
    const emoji = interaction.options.getString('emoji');
    const description = interaction.options.getString('description');
    const pingRole = interaction.options.getRole('ping_role');
    const categoryChannel = interaction.options.getChannel('category_channel');

    const config = await loadConfig(interaction.guild.id);

    // Find existing or create new
    const existingIndex = config.categories.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    
    const category = {
        name,
        emoji,
        description,
        pingRole: pingRole?.id || null,
        categoryChannel: categoryChannel?.id || config.categoryChannel
    };

    if (existingIndex >= 0) {
        config.categories[existingIndex] = category;
    } else {
        config.categories.push(category);
    }

    await saveConfig(interaction.guild.id, config);

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle(existingIndex >= 0 ? '✅ Category Updated' : '✅ Category Added')
            .setDescription(`Ticket category **${name}** has been ${existingIndex >= 0 ? 'updated' : 'added'}!`)
            .addFields(
                { name: 'Name', value: name, inline: true },
                { name: 'Emoji', value: emoji, inline: true },
                { name: 'Description', value: description, inline: false },
                { name: 'Ping Role', value: pingRole?.toString() || 'None', inline: true }
            )
            .setFooter({ text: 'Use /ticket panel to update the panel' })
            .setTimestamp()
        ]
    });
}

async function handleRemoveCategory(interaction) {
    await interaction.deferReply({ flags: 64 });

    const name = interaction.options.getString('name');
    const config = await loadConfig(interaction.guild.id);

    const index = config.categories.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    
    if (index === -1) {
        return interaction.editReply({
            content: `❌ Category "${name}" not found!`
        });
    }

    config.categories.splice(index, 1);
    await saveConfig(interaction.guild.id, config);

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ Category Removed')
            .setDescription(`Category **${name}** has been removed!`)
            .setFooter({ text: 'Use /ticket panel to update the panel' })
            .setTimestamp()
        ]
    });
}

async function handleList(interaction) {
    await interaction.deferReply({ flags: 64 });

    const config = await loadConfig(interaction.guild.id);

    if (config.categories.length === 0) {
        return interaction.editReply({
            content: '❌ No categories configured! Use `/ticket category` to add one.'
        });
    }

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📋 Ticket Categories')
        .setDescription(
            config.categories.map((cat, i) => 
                `**${i + 1}. ${cat.emoji} ${cat.name}**\n` +
                `└ ${cat.description}\n` +
                `└ Ping: ${cat.pingRole ? `<@&${cat.pingRole}>` : 'None'}`
            ).join('\n\n')
        )
        .setFooter({ text: `Total: ${config.categories.length} categories` })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleClose(interaction) {
    // Check if in ticket channel
    if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({
            content: '❌ This command can only be used in ticket channels!',
            flags: 64
        });
    }

    const reason = interaction.options.getString('reason') || 'No reason provided';

    await interaction.reply({
        embeds: [new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🔒 Closing Ticket')
            .setDescription(`This ticket will be closed in 5 seconds...\n\n**Reason:** ${reason}`)
            .setFooter({ text: `Closed by ${interaction.user.tag}` })
            .setTimestamp()
        ]
    });

    setTimeout(async () => {
        try {
            await interaction.channel.delete();
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    }, 5000);
}

async function handleAdd(interaction) {
    if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({
            content: '❌ This command can only be used in ticket channels!',
            flags: 64
        });
    }

    const user = interaction.options.getUser('user');

    await interaction.channel.permissionOverwrites.create(user, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
    });

    await interaction.reply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ User Added')
            .setDescription(`${user} has been added to this ticket.`)
            .setTimestamp()
        ]
    });
}

async function handleRemove(interaction) {
    if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({
            content: '❌ This command can only be used in ticket channels!',
            flags: 64
        });
    }

    const user = interaction.options.getUser('user');

    await interaction.channel.permissionOverwrites.delete(user);

    await interaction.reply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ User Removed')
            .setDescription(`${user} has been removed from this ticket.`)
            .setTimestamp()
        ]
    });
}

async function handleStats(interaction) {
    await interaction.deferReply({ flags: 64 });

    const config = await loadConfig(interaction.guild.id);
    const ticketChannels = interaction.guild.channels.cache.filter(c => c.name.startsWith('ticket-'));

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📊 Ticket Statistics')
            .addFields(
                { name: '🎫 Active Tickets', value: ticketChannels.size.toString(), inline: true },
                { name: '📋 Categories', value: config.categories.length.toString(), inline: true },
                { name: '📈 Total Created', value: config.ticketCount.toString(), inline: true }
            )
            .setTimestamp()
        ]
    });
}
