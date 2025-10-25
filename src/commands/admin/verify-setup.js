const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { loadGuildConfig, saveGuildConfig } = require('../../utils/configManager');
const advancedVerification = require('../../systems/advancedVerification');

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
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('method')
                        .setDescription('Verification method')
                        .addChoices(
                            { name: '✅ Simple Button', value: 'button' },
                            { name: '🔢 Code Verification', value: 'code' },
                            { name: '🧮 Math Challenge', value: 'math' }
                        ))
                .addChannelOption(option =>
                    option
                        .setName('log_channel')
                        .setDescription('Channel to log verifications')))
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

        // Check if verification system already exists
        const existingChannel = guild.channels.cache.find(c => c.name === '🔐-verify' || c.name === 'verify');
        if (existingChannel) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0xFEE75C)
                    .setTitle('⚠️ Verification Already Exists')
                    .setDescription(`A verification channel already exists: ${existingChannel}\n\nUse \`/verify-setup panel\` to send a new panel to that channel instead.`)
                    .setTimestamp()
                ]
            });
        }

        // Create verified role if it doesn't exist
        let verifiedRole = guild.roles.cache.find(r => r.name === '✅ Verified' || r.name === 'Verified');
        if (!verifiedRole) {
            verifiedRole = await guild.roles.create({
                name: 'Verified',
                color: 0x57F287,
                reason: 'Verification system setup',
                position: 1 // Create at low position
            });
            console.log(`✅ Created verified role: ${verifiedRole.name}`);
        } else {
            console.log(`✅ Using existing verified role: ${verifiedRole.name}`);
        }

        // Check bot role hierarchy
        const botMember = guild.members.cache.get(interaction.client.user.id);
        const botHighestRole = botMember.roles.highest;
        
        if (botHighestRole.position <= verifiedRole.position) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Role Hierarchy Issue')
                    .setDescription(
                        `My role is not high enough to manage the Verified role!\n\n` +
                        `**How to fix:**\n` +
                        `1. Go to **Server Settings** → **Roles**\n` +
                        `2. Drag my role **above** the "${verifiedRole.name}" role\n` +
                        `3. Run this command again\n\n` +
                        `💡 **Current positions:**\n` +
                        `• My role: **${botHighestRole.name}** (position ${botHighestRole.position})\n` +
                        `• Verified role: **${verifiedRole.name}** (position ${verifiedRole.position})`
                    )
                    .setFooter({ text: 'My role must be higher than roles I manage' })
                    .setTimestamp()
                ]
            });
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
    const channel = interaction.options.getChannel('channel');
    
    // setupPanel handles its own reply
    await advancedVerification.setupPanel({ ...interaction, channel: channel || interaction.channel });
}

async function handleConfig(interaction) {
    await interaction.deferReply({ flags: 64 });

    const verifiedRole = interaction.options.getRole('verified_role');
    const enabled = interaction.options.getBoolean('enabled');
    const method = interaction.options.getString('method') || 'button';
    const logChannel = interaction.options.getChannel('log_channel');

    const config = await loadGuildConfig(interaction.guild.id);
    config.verificationEnabled = enabled;
    config.verifiedRole = verifiedRole.id;
    config.verificationMethod = method;
    if (logChannel) {
        config.verificationLogChannel = logChannel.id;
    }
    await saveGuildConfig(interaction.guild.id, config);

    const methodNames = {
        'button': '✅ Simple Button',
        'code': '🔢 Code Verification',
        'math': '🧮 Math Challenge'
    };

    const embed = new EmbedBuilder()
        .setTitle('✅ Verification Configuration Updated')
        .setColor(enabled ? '#00ff00' : '#ff0000')
        .addFields(
            { name: '📊 Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '✅ Verified Role', value: `${verifiedRole}`, inline: true },
            { name: '🔐 Method', value: methodNames[method], inline: true }
        )
        .setTimestamp();

    if (logChannel) {
        embed.addFields({ name: '📝 Log Channel', value: `${logChannel}`, inline: true });
    }

    await interaction.editReply({ embeds: [embed] });
}
