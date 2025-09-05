const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { getDocument, setDocument } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription('Manage server verification system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up the verification system')
                .addChannel('channel', channel =>
                    channel
                        .setDescription('Channel for verification messages')
                        .setRequired(true))
                .addRole('role', role =>
                    role
                        .setDescription('Role to give verified members')
                        .setRequired(true))
                .addString('type', type =>
                    type
                        .setDescription('Verification type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Button Click', value: 'button' },
                            { name: 'Captcha', value: 'captcha' },
                            { name: 'Email', value: 'email' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable verification system'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('View verification system status'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('Configure verification settings')
                .addBoolean('dm_welcome', dm =>
                    dm.setDescription('Send welcome DM to verified members'))
                .addString('welcome_message', msg =>
                    msg.setDescription('Custom welcome message'))
                .addBoolean('remove_unverified', remove =>
                    remove.setDescription('Remove unverified members after timeout'))
                .addInteger('timeout_hours', timeout =>
                    timeout.setDescription('Hours before removing unverified members (1-168)')
                        .setMinValue(1)
                        .setMaxValue(168))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            switch (subcommand) {
                case 'setup':
                    await setupVerification(interaction, guildId);
                    break;
                case 'disable':
                    await disableVerification(interaction, guildId);
                    break;
                case 'status':
                    await showVerificationStatus(interaction, guildId);
                    break;
                case 'settings':
                    await configureSettings(interaction, guildId);
                    break;
            }
        } catch (error) {
            console.error('Verification command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while managing verification settings.',
                ephemeral: true
            });
        }
    }
};

async function setupVerification(interaction, guildId) {
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');
    const type = interaction.options.getString('type');

    // Validate permissions
    if (!channel.permissionsFor(interaction.guild.members.me).has(['SendMessages', 'EmbedLinks'])) {
        return interaction.reply({
            content: '❌ I need Send Messages and Embed Links permissions in that channel.',
            ephemeral: true
        });
    }

    if (!interaction.guild.members.me.permissions.has('ManageRoles') || 
        role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({
            content: '❌ I need Manage Roles permission and the verification role must be below my highest role.',
            ephemeral: true
        });
    }

    const config = {
        enabled: true,
        channelId: channel.id,
        roleId: role.id,
        type: type,
        dmWelcome: false,
        welcomeMessage: `Welcome to **${interaction.guild.name}**! You have been successfully verified.`,
        removeUnverified: false,
        timeoutHours: 24,
        createdAt: Date.now(),
        createdBy: interaction.user.id
    };

    await setDocument('verification', guildId, config);

    // Send verification message to channel
    await sendVerificationMessage(channel, type, interaction.guild.name);

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Verification System Setup Complete')
        .setDescription('The verification system has been successfully configured!')
        .addFields(
            { name: '📍 Channel', value: `${channel}`, inline: true },
            { name: '🎭 Verified Role', value: `${role}`, inline: true },
            { name: '🔐 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true }
        )
        .setFooter({ text: 'Use /verification settings to configure additional options' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function sendVerificationMessage(channel, type, guildName) {
    let embed, components;

    switch (type) {
        case 'button':
            embed = new EmbedBuilder()
                .setColor('#5865f2')
                .setTitle('🔐 Server Verification Required')
                .setDescription(`Welcome to **${guildName}**!\n\nTo access the server, please click the verify button below. This helps us keep the server secure and spam-free.`)
                .addFields(
                    { name: '📋 Instructions', value: '1. Click the "Verify" button below\n2. You will receive the verified role automatically\n3. Enjoy chatting in the server!' }
                )
                .setFooter({ text: 'Skyfall Verification System' })
                .setTimestamp();

            components = [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_button')
                        .setLabel('✅ Verify')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🛡️')
                )
            ];
            break;

        case 'captcha':
            embed = new EmbedBuilder()
                .setColor('#ff9500')
                .setTitle('🔐 Captcha Verification Required')
                .setDescription(`Welcome to **${guildName}**!\n\nTo access the server, please complete the captcha verification below.`)
                .addFields(
                    { name: '🤖 Why Captcha?', value: 'This helps prevent bots and spam accounts from joining our server.' }
                )
                .setFooter({ text: 'Skyfall Verification System' })
                .setTimestamp();

            components = [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_captcha')
                        .setLabel('🔍 Start Captcha')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🧩')
                )
            ];
            break;

        case 'email':
            embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📧 Email Verification Required')
                .setDescription(`Welcome to **${guildName}**!\n\nTo access the server, please verify your email address.`)
                .addFields(
                    { name: '📋 Instructions', value: '1. Click "Verify Email" below\n2. Enter your email address\n3. Check your inbox for verification code\n4. Enter the code to complete verification' }
                )
                .setFooter({ text: 'Skyfall Verification System' })
                .setTimestamp();

            components = [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_email')
                        .setLabel('📧 Verify Email')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('✉️')
                )
            ];
            break;
    }

    await channel.send({ embeds: [embed], components });
}

async function disableVerification(interaction, guildId) {
    const config = await getDocument('verification', guildId);
    if (!config?.enabled) {
        return interaction.reply({
            content: '❌ Verification system is not currently enabled.',
            ephemeral: true
        });
    }

    await setDocument('verification', guildId, { ...config, enabled: false, disabledAt: Date.now() });

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Verification System Disabled')
        .setDescription('The verification system has been disabled for this server.')
        .setFooter({ text: 'Use /verification setup to re-enable' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function showVerificationStatus(interaction, guildId) {
    const config = await getDocument('verification', guildId);
    
    if (!config) {
        return interaction.reply({
            content: '❌ Verification system has not been set up yet. Use `/verification setup` to configure it.',
            ephemeral: true
        });
    }

    const channel = interaction.guild.channels.cache.get(config.channelId);
    const role = interaction.guild.roles.cache.get(config.roleId);
    
    const embed = new EmbedBuilder()
        .setColor(config.enabled ? '#00ff00' : '#ff0000')
        .setTitle('🔐 Verification System Status')
        .addFields(
            { name: '⚡ Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '📍 Channel', value: channel ? `${channel}` : '❌ Channel Deleted', inline: true },
            { name: '🎭 Role', value: role ? `${role}` : '❌ Role Deleted', inline: true },
            { name: '🔐 Type', value: config.type.charAt(0).toUpperCase() + config.type.slice(1), inline: true },
            { name: '💬 DM Welcome', value: config.dmWelcome ? '✅ Yes' : '❌ No', inline: true },
            { name: '🚮 Auto Remove', value: config.removeUnverified ? `✅ After ${config.timeoutHours}h` : '❌ No', inline: true }
        )
        .setFooter({ 
            text: `Created ${new Date(config.createdAt).toLocaleDateString()}`,
            iconURL: interaction.guild.iconURL()
        })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function configureSettings(interaction, guildId) {
    const config = await getDocument('verification', guildId);
    if (!config) {
        return interaction.reply({
            content: '❌ Please set up verification first with `/verification setup`.',
            ephemeral: true
        });
    }

    const updates = {};
    
    if (interaction.options.getBoolean('dm_welcome') !== null) {
        updates.dmWelcome = interaction.options.getBoolean('dm_welcome');
    }
    
    if (interaction.options.getString('welcome_message')) {
        updates.welcomeMessage = interaction.options.getString('welcome_message');
    }
    
    if (interaction.options.getBoolean('remove_unverified') !== null) {
        updates.removeUnverified = interaction.options.getBoolean('remove_unverified');
    }
    
    if (interaction.options.getInteger('timeout_hours')) {
        updates.timeoutHours = interaction.options.getInteger('timeout_hours');
    }

    if (Object.keys(updates).length === 0) {
        return interaction.reply({
            content: '❌ Please specify at least one setting to update.',
            ephemeral: true
        });
    }

    await setDocument('verification', guildId, { ...config, ...updates, updatedAt: Date.now() });

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('⚙️ Verification Settings Updated')
        .setDescription('The following settings have been updated:')
        .setTimestamp();

    Object.entries(updates).forEach(([key, value]) => {
        let displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        let displayValue = typeof value === 'boolean' ? (value ? '✅ Enabled' : '❌ Disabled') : value;
        embed.addFields({ name: displayName, value: String(displayValue), inline: true });
    });

    await interaction.reply({ embeds: [embed] });
}
