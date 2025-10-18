const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { loadGuildConfig, saveGuildConfig } = require('../../utils/configManager');
const appealLibrary = require('../../utils/appealLibrary');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('Appeal system commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('submit')
                .setDescription('Submit an appeal using your appeal code')
                .addStringOption(option =>
                    option
                        .setName('appeal_code')
                        .setDescription('The appeal code provided when you were moderated')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('server_id')
                        .setDescription('Server ID (optional - auto-detected from appeal code)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check the status of your appeal')
                .addStringOption(option =>
                    option
                        .setName('appeal_code')
                        .setDescription('Appeal code to check')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('server_id')
                        .setDescription('Server ID (optional - auto-detected from appeal code)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('review')
                .setDescription('Review a submitted appeal (Admin only)')
                .addStringOption(option =>
                    option
                        .setName('appeal_code')
                        .setDescription('The appeal code to review')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup appeal system channel (Admin only)')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel for appeal reviews')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('require_reason')
                        .setDescription('Require reason for approve/reject decisions')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List appeals by status (Admin only)')
                .addStringOption(option =>
                    option
                        .setName('status')
                        .setDescription('Filter by status')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Pending', value: 'pending' },
                            { name: 'Under Review', value: 'under_review' },
                            { name: 'Approved', value: 'approved' },
                            { name: 'Rejected', value: 'rejected' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('Configure appeal system settings (Admin only)')
                .addStringOption(option =>
                    option
                        .setName('action')
                        .setDescription('Settings action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Enable', value: 'enable' },
                            { name: 'Disable', value: 'disable' },
                            { name: 'View', value: 'view' }
                        )
                )
                .addChannelOption(option =>
                    option
                        .setName('category')
                        .setDescription('Appeal category channel')
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'submit':
                await handleSubmitAppeal(interaction);
                break;
            case 'status':
                await handleAppealStatus(interaction);
                break;
            case 'review':
                await handleReviewAppeal(interaction);
                break;
            case 'setup':
                await handleAppealSetup(interaction);
                break;
            case 'list':
                await handleAppealList(interaction);
                break;
            case 'settings':
                await handleAppealSettings(interaction);
                break;
        }
    }
};

async function handleSubmitAppeal(interaction) {
    const appealCode = interaction.options.getString('appeal_code');
    const serverIdRaw = interaction.options.getString('server_id');
    
    if (!appealCode) {
        return interaction.reply({
            content: '❌ Please provide an appeal code.',
            flags: 64
        });
    }
    
    // Determine guild ID (from current guild, provided server_id, or auto-find from appeal code)
    let guildId;
    let guild;
    
    if (interaction.guild) {
        guildId = interaction.guild.id;
        guild = interaction.guild;
    } else if (serverIdRaw) {
        guildId = serverIdRaw;
        try {
            guild = await interaction.client.guilds.fetch(guildId);
            if (!guild) {
                return interaction.reply({
                    content: '❌ Server not found or bot is not in that server.',
                    flags: 64
                });
            }
        } catch (error) {
            return interaction.reply({
                content: '❌ Invalid server ID or bot is not in that server.',
                flags: 64
            });
        }
    } else {
        // Auto-retrieve server ID from appeal code
        const found = await appealLibrary.findAppealByCode(appealCode);
        if (!found) {
            return interaction.reply({
                content: '❌ Appeal code not found. Please check your code and try again.',
                flags: 64
            });
        }
        
        guildId = found.guildId;
        try {
            guild = await interaction.client.guilds.fetch(guildId);
        } catch (error) {
            return interaction.reply({
                content: '❌ Could not find the server for this appeal. The bot may have been removed from the server.',
                flags: 64
            });
        }
    }
    
    // Validate appeal
    const validation = await appealLibrary.validateAppeal(appealCode, guildId);
    if (!validation.valid) {
        return interaction.reply({
            content: `❌ ${validation.reason}`,
            flags: 64
        });
    }
    
    const appeal = validation.appeal;

    // Verify user can submit this appeal
    if (appeal.moderatedUserId !== interaction.user.id) {
        return interaction.reply({
            content: '❌ You can only submit appeals for your own moderation actions.',
            flags: 64
        });
    }

    // Create and show appeal modal
    const modal = new ModalBuilder()
        .setCustomId(`appeal_modal_${appealCode}_${guildId}`)
        .setTitle(`Appeal for ${appeal.moderationType.toUpperCase()}`);

    const reasonInput = new TextInputBuilder()
        .setCustomId('appeal_reason')
        .setLabel('Why should this punishment be reversed?')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Explain why you believe this moderation action was unfair or incorrect...')
        .setRequired(true)
        .setMaxLength(1000);

    const evidenceInput = new TextInputBuilder()
        .setCustomId('appeal_evidence')
        .setLabel('Evidence (Optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Provide any evidence, screenshots, or additional context...')
        .setRequired(false)
        .setMaxLength(1000);

    const contactInput = new TextInputBuilder()
        .setCustomId('appeal_contact')
        .setLabel('Preferred Contact Method')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Discord DM, Email, etc.')
        .setRequired(false)
        .setMaxLength(100);

    const reasonRow = new ActionRowBuilder().addComponents(reasonInput);
    const evidenceRow = new ActionRowBuilder().addComponents(evidenceInput);
    const contactRow = new ActionRowBuilder().addComponents(contactInput);

    modal.addComponents(reasonRow, evidenceRow, contactRow);

    await interaction.showModal(modal);
}

async function handleAppealStatus(interaction) {
    const appealCode = interaction.options.getString('appeal_code');
    const serverIdRaw = interaction.options.getString('server_id');
    
    let guildId = interaction.guild?.id || serverIdRaw;
    
    // Auto-retrieve server ID if not provided
    if (!guildId) {
        const found = await appealLibrary.findAppealByCode(appealCode);
        if (!found) {
            return interaction.reply({
                content: '❌ Appeal code not found. Please check your code and try again.',
                flags: 64
            });
        }
        guildId = found.guildId;
    }

    await interaction.deferReply({ flags: 64 });

    try {
        const appeal = await appealLibrary.getAppeal(guildId, appealCode);
        
        if (!appeal) {
            return interaction.editReply({
                content: '❌ Appeal not found.',
                flags: 64
            });
        }

        if (appeal.moderatedUserId !== interaction.user.id) {
            return interaction.editReply({
                content: '❌ You can only check your own appeals.',
                flags: 64
            });
        }

        const embed = appealLibrary.createAppealEmbed(appeal, interaction.client);
        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error checking appeal status:', error);
        await interaction.editReply({
            content: '❌ An error occurred while checking appeal status.',
            flags: 64
        });
    }
}

async function handleReviewAppeal(interaction) {
    if (!interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: '❌ You need Administrator permissions to review appeals.',
            flags: 64
        });
    }

    const appealCode = interaction.options.getString('appeal_code');
    const guildId = interaction.guild.id;

    await interaction.deferReply();

    try {
        const appeal = await appealLibrary.getAppeal(guildId, appealCode);
        
        if (!appeal) {
            return interaction.editReply({
                content: '❌ Appeal not found.',
                flags: 64
            });
        }

        const embed = appealLibrary.createAppealEmbed(appeal, interaction.client);
        const buttons = appealLibrary.createReviewButtons(appealCode);

        await interaction.editReply({ embeds: [embed], components: [buttons] });

    } catch (error) {
        console.error('Error reviewing appeal:', error);
        await interaction.editReply({
            content: '❌ An error occurred while loading the appeal.',
            flags: 64
        });
    }
}

async function handleAppealSetup(interaction) {
    if (!interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: '❌ You need Administrator permissions to setup appeals.',
            flags: 64
        });
    }

    const channel = interaction.options.getChannel('channel');
    const requireReason = interaction.options.getBoolean('require_reason') ?? false;

    await interaction.deferReply();

    try {
        const config = await loadGuildConfig(interaction.guild.id);
        config.appeals = config.appeals || {};
        config.appeals.channel = channel.id;
        config.appeals.requireReason = requireReason;
        config.appeals.enabled = true;

        await saveGuildConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('✅ Appeal System Setup Complete')
            .setColor(0x00ff00)
            .addFields(
                { name: '📢 Appeal Channel', value: channel.toString(), inline: true },
                { name: '📝 Require Reason', value: requireReason ? 'Yes' : 'No', inline: true },
                { name: '✅ Status', value: 'Enabled', inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error setting up appeals:', error);
        await interaction.editReply({
            content: '❌ Failed to setup appeal system.',
            flags: 64
        });
    }
}

async function handleAppealList(interaction) {
    if (!interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: '❌ You need Administrator permissions to list appeals.',
            flags: 64
        });
    }

    const statusFilter = interaction.options.getString('status');
    const guildId = interaction.guild.id;

    await interaction.deferReply();

    try {
        const appeals = await appealLibrary.getGuildAppeals(guildId, statusFilter);
        const stats = await appealLibrary.getAppealStats(guildId);

        if (appeals.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('📋 No Appeals Found')
                .setColor(0x808080)
                .setDescription(statusFilter ? `No appeals with status: ${statusFilter}` : 'No appeals in this server.')
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📋 Appeal List ${statusFilter ? `(${statusFilter})` : ''}`)
            .setColor(0x5865f2)
            .setDescription(`**Stats:** ${stats.total} total | ${stats.pending} pending | ${stats.under_review} reviewing | ${stats.approved} approved | ${stats.rejected} rejected`)
            .setTimestamp();

        // Show first 10 appeals
        const displayAppeals = appeals.slice(0, 10);
        
        for (const appeal of displayAppeals) {
            const user = await interaction.client.users.fetch(appeal.moderatedUserId).catch(() => null);
            const status = appeal.status.replace('_', ' ').toUpperCase();
            
            embed.addFields({
                name: `${appeal.code} - ${appeal.moderationType.toUpperCase()}`,
                value: `**User:** ${user ? user.tag : 'Unknown'}\n**Status:** ${status}\n**Created:** <t:${Math.floor(new Date(appeal.createdAt).getTime() / 1000)}:R>`,
                inline: true
            });
        }

        if (appeals.length > 10) {
            embed.setFooter({ text: `Showing 10 of ${appeals.length} appeals` });
        }

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error listing appeals:', error);
        await interaction.editReply({
            content: '❌ Failed to load appeals list.',
            flags: 64
        });
    }
}

async function handleAppealSettings(interaction) {
    if (!interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: '❌ You need Administrator permissions to modify appeal settings.',
            flags: 64
        });
    }

    const action = interaction.options.getString('action');
    const category = interaction.options.getChannel('category');

    await interaction.deferReply();

    try {
        const config = await loadGuildConfig(interaction.guild.id);
        config.appeals = config.appeals || {};

        switch (action) {
            case 'enable':
                config.appeals.enabled = true;
                if (category) config.appeals.channel = category.id;
                break;
            case 'disable':
                config.appeals.enabled = false;
                break;
            case 'view':
                break;
        }

        if (action !== 'view') {
            await saveGuildConfig(interaction.guild.id, config);
        }

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Appeal System Settings')
            .setColor(config.appeals.enabled ? 0x00ff00 : 0xff0000)
            .addFields(
                { name: '✅ Enabled', value: config.appeals.enabled ? 'Yes' : 'No', inline: true },
                { name: '📢 Appeal Channel', value: config.appeals.channel ? `<#${config.appeals.channel}>` : 'Not set', inline: true },
                { name: '📝 Require Reason', value: config.appeals.requireReason ? 'Yes' : 'No', inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error managing appeal settings:', error);
        await interaction.editReply({
            content: '❌ Failed to update appeal settings.',
            flags: 64
        });
    }
}
