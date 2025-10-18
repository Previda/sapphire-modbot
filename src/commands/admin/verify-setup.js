const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { loadGuildConfig, saveGuildConfig } = require('../../utils/configManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify-setup')
        .setDescription('🔐 Setup verification system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create verification channel and panel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('panel')
                .setDescription('Send verification panel to current channel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configure verification settings')
                .addRoleOption(option =>
                    option
                        .setName('verified_role')
                        .setDescription('Role to give after verification')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable verification?')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'create':
                await handleCreate(interaction);
                break;
            case 'panel':
                await handlePanel(interaction);
                break;
            case 'config':
                await handleConfig(interaction);
                break;
        }
    }
};

async function handleCreate(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
        const guild = interaction.guild;

        // Create verified role if it doesn't exist
        let verifiedRole = guild.roles.cache.find(r => r.name === '✅ Verified');
        if (!verifiedRole) {
            verifiedRole = await guild.roles.create({
                name: '✅ Verified',
                color: '#00ff00',
                reason: 'Verification system setup'
            });
            console.log(`✅ Created verified role: ${verifiedRole.name}`);
        }

        // Create verification channel
        const verifyChannel = await guild.channels.create({
            name: '🔐-verify',
            type: ChannelType.GuildText,
            topic: 'Click the button below to verify and access the server',
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                    deny: [PermissionFlagsBits.SendMessages]
                },
                {
                    id: verifiedRole.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: guild.members.me.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
                }
            ]
        });

        // Update config
        const config = await loadGuildConfig(guild.id);
        config.verificationEnabled = true;
        config.verificationChannel = verifyChannel.id;
        config.verifiedRole = verifiedRole.id;
        await saveGuildConfig(guild.id, config);

        // Send verification panel
        const embed = new EmbedBuilder()
            .setTitle('🔐 Server Verification')
            .setDescription(
                '**Welcome to the server!**\n\n' +
                'To access all channels, please verify yourself by clicking the button below.\n\n' +
                '**Why verify?**\n' +
                '• Protects against bots and spam\n' +
                '• Ensures you\'re a real person\n' +
                '• Keeps our community safe\n\n' +
                '**Click the button below to get started!**'
            )
            .setColor('#00ff00')
            .setFooter({ text: 'This is a one-time verification' })
            .setTimestamp();

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_button')
                    .setLabel('Verify')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
            );

        await verifyChannel.send({ embeds: [embed], components: [button] });

        // Send success message
        const successEmbed = new EmbedBuilder()
            .setTitle('✅ Verification System Created!')
            .setDescription('The verification system has been set up successfully.')
            .addFields(
                { name: '🔐 Verify Channel', value: `${verifyChannel}`, inline: true },
                { name: '✅ Verified Role', value: `${verifiedRole}`, inline: true },
                { name: '📊 Status', value: '✅ Enabled', inline: true }
            )
            .setColor('#00ff00')
            .addFields({
                name: '📝 Next Steps',
                value: '1. Lock all other channels from @everyone\n2. Allow only verified role to see channels\n3. New members will need to verify first!',
                inline: false
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });

    } catch (error) {
        console.error('Error creating verification:', error);
        await interaction.editReply({
            content: `❌ Failed to create verification system: ${error.message}`
        });
    }
}

async function handlePanel(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
        const config = await loadGuildConfig(interaction.guild.id);

        if (!config.verificationEnabled) {
            return interaction.editReply({
                content: '❌ Verification is not enabled! Use `/verify-setup create` first.'
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🔐 Server Verification')
            .setDescription(
                '**Welcome to the server!**\n\n' +
                'To access all channels, please verify yourself by clicking the button below.\n\n' +
                '**Why verify?**\n' +
                '• Protects against bots and spam\n' +
                '• Ensures you\'re a real person\n' +
                '• Keeps our community safe\n\n' +
                '**Click the button below to get started!**'
            )
            .setColor('#00ff00')
            .setFooter({ text: 'This is a one-time verification' })
            .setTimestamp();

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_button')
                    .setLabel('Verify')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.channel.send({ embeds: [embed], components: [button] });
        await interaction.editReply({ content: '✅ Verification panel sent!' });

    } catch (error) {
        console.error('Error sending panel:', error);
        await interaction.editReply({
            content: `❌ Failed to send panel: ${error.message}`
        });
    }
}

async function handleConfig(interaction) {
    await interaction.deferReply({ flags: 64 });

    const verifiedRole = interaction.options.getRole('verified_role');
    const enabled = interaction.options.getBoolean('enabled');

    const config = await loadGuildConfig(interaction.guild.id);
    config.verificationEnabled = enabled;
    config.verifiedRole = verifiedRole.id;
    await saveGuildConfig(interaction.guild.id, config);

    const embed = new EmbedBuilder()
        .setTitle('✅ Verification Configuration Updated')
        .setColor(enabled ? '#00ff00' : '#ff0000')
        .addFields(
            { name: '📊 Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '✅ Verified Role', value: `${verifiedRole}`, inline: true }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}
