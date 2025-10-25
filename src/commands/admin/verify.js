const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const advancedVerification = require('../../systems/advancedVerification');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('🛡️ Complete verification system management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup verification system (creates channel & role)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('panel')
                .setDescription('Send verification panel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to send panel (default: current)')
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('method')
                .setDescription('Set verification method')
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('Verification method')
                        .setRequired(true)
                        .addChoices(
                            { name: '✅ Simple Button', value: 'simple' },
                            { name: '🔤 CAPTCHA Code', value: 'captcha' },
                            { name: '🧮 Math Challenge', value: 'math' },
                            { name: '🎲 Hybrid (Random)', value: 'hybrid' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configure verification settings')
                .addIntegerOption(option =>
                    option
                        .setName('account_age')
                        .setDescription('Minimum account age in days (0 to disable)')
                        .setMinValue(0)
                        .setMaxValue(365))
                .addIntegerOption(option =>
                    option
                        .setName('rate_limit')
                        .setDescription('Cooldown between attempts in seconds')
                        .setMinValue(10)
                        .setMaxValue(300))
                .addIntegerOption(option =>
                    option
                        .setName('max_attempts')
                        .setDescription('Maximum attempts before lockout')
                        .setMinValue(1)
                        .setMaxValue(10))
                .addBooleanOption(option =>
                    option
                        .setName('suspicious_check')
                        .setDescription('Enable suspicious account detection'))
                .addChannelOption(option =>
                    option
                        .setName('log_channel')
                        .setDescription('Channel for verification logs')
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('lockdown')
                .setDescription('Lock all channels (require verification)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlock')
                .setDescription('Unlock all channels (remove verification requirement)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View verification statistics'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset verification for a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to reset')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup':
                await handleSetup(interaction);
                break;
            case 'panel':
                await handlePanel(interaction);
                break;
            case 'method':
                await handleMethod(interaction);
                break;
            case 'config':
                await handleConfig(interaction);
                break;
            case 'lockdown':
                await handleLockdown(interaction);
                break;
            case 'unlock':
                await handleUnlock(interaction);
                break;
            case 'stats':
                await handleStats(interaction);
                break;
            case 'reset':
                await handleReset(interaction);
                break;
        }
    }
};

async function handleSetup(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
        const guild = interaction.guild;

        // Check if already exists
        const existingChannel = guild.channels.cache.find(c => c.name.includes('verify'));
        if (existingChannel) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0xFEE75C)
                    .setTitle('⚠️ Verification Already Exists')
                    .setDescription(`Found existing channel: ${existingChannel}\n\nUse \`/verify panel\` to send a new panel.`)
                    .setTimestamp()
                ]
            });
        }

        // Create or find Verified role
        let verifiedRole = guild.roles.cache.find(r => r.name === 'Verified');
        if (!verifiedRole) {
            verifiedRole = await guild.roles.create({
                name: 'Verified',
                color: 0x57F287,
                reason: 'Verification system',
                position: 1
            });
        }

        // Check bot hierarchy
        const botMember = guild.members.me;
        if (botMember.roles.highest.position <= verifiedRole.position) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Role Hierarchy Issue')
                    .setDescription(
                        `My role must be **above** the Verified role!\n\n` +
                        `**Fix:**\n` +
                        `1. Server Settings → Roles\n` +
                        `2. Drag my role above "Verified"\n` +
                        `3. Run this command again`
                    )
                    .setTimestamp()
                ]
            });
        }

        // Create verification channel
        const verifyChannel = await guild.channels.create({
            name: '🔐-verify',
            type: ChannelType.GuildText,
            topic: 'Click the button to verify and access the server',
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                    deny: [PermissionFlagsBits.SendMessages]
                },
                {
                    id: verifiedRole,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: botMember,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
                }
            ]
        });

        // Send panel
        await advancedVerification.setupPanel({ ...interaction, channel: verifyChannel });

        // Success message
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Verification System Created!')
                .setDescription('The verification system is now active!')
                .addFields(
                    { name: '🔐 Channel', value: verifyChannel.toString(), inline: true },
                    { name: '✅ Role', value: verifiedRole.toString(), inline: true },
                    { name: '🛡️ Method', value: 'CAPTCHA', inline: true }
                )
                .addFields({
                    name: '📝 Next Steps',
                    value: 
                        '1. Use `/verify lockdown` to lock all channels\n' +
                        '2. Use `/verify method` to change verification type\n' +
                        '3. Use `/verify config` to customize settings'
                })
                .setTimestamp()
            ]
        });

    } catch (error) {
        console.error('Verification setup error:', error);
        await interaction.editReply({
            content: `❌ Setup failed: ${error.message}`
        });
    }
}

async function handlePanel(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    
    await advancedVerification.setupPanel({ ...interaction, channel });
    
    await interaction.reply({
        content: `✅ Verification panel sent to ${channel}!`,
        flags: 64
    });
}

async function handleMethod(interaction) {
    await interaction.deferReply({ flags: 64 });

    const method = interaction.options.getString('type');
    const config = await advancedVerification.loadConfig(interaction.guild.id);
    
    config.verificationMethod = method;
    await advancedVerification.saveConfig(interaction.guild.id, config);

    const methodNames = {
        simple: '✅ Simple Button',
        captcha: '🔤 CAPTCHA Code',
        math: '🧮 Math Challenge',
        hybrid: '🎲 Hybrid (Random)'
    };

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ Verification Method Updated')
            .setDescription(`Verification method set to: **${methodNames[method]}**`)
            .addFields({
                name: '📝 What This Means',
                value: method === 'simple' ? 'Users just click a button to verify' :
                       method === 'captcha' ? 'Users must enter a 6-character code' :
                       method === 'math' ? 'Users must solve a math equation' :
                       'Users get a random challenge (CAPTCHA or Math)'
            })
            .setTimestamp()
        ]
    });
}

async function handleConfig(interaction) {
    await interaction.deferReply({ flags: 64 });

    const config = await advancedVerification.loadConfig(interaction.guild.id);
    
    const accountAge = interaction.options.getInteger('account_age');
    const rateLimit = interaction.options.getInteger('rate_limit');
    const maxAttempts = interaction.options.getInteger('max_attempts');
    const suspiciousCheck = interaction.options.getBoolean('suspicious_check');
    const logChannel = interaction.options.getChannel('log_channel');

    if (accountAge !== null) config.minAccountAgeDays = accountAge;
    if (rateLimit !== null) config.rateLimitSeconds = rateLimit;
    if (maxAttempts !== null) config.maxAttempts = maxAttempts;
    if (suspiciousCheck !== null) config.suspiciousAccountCheck = suspiciousCheck;
    if (logChannel) config.logChannel = logChannel.id;

    await advancedVerification.saveConfig(interaction.guild.id, config);

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ Configuration Updated')
            .setDescription('Verification settings have been updated!')
            .addFields(
                { name: '📅 Min Account Age', value: `${config.minAccountAgeDays} days`, inline: true },
                { name: '⏱️ Rate Limit', value: `${config.rateLimitSeconds}s`, inline: true },
                { name: '🎯 Max Attempts', value: config.maxAttempts.toString(), inline: true },
                { name: '🤖 Suspicious Check', value: config.suspiciousAccountCheck ? '✅ Enabled' : '❌ Disabled', inline: true },
                { name: '📝 Log Channel', value: logChannel ? logChannel.toString() : 'Not set', inline: true },
                { name: '🛡️ Method', value: config.verificationMethod.toUpperCase(), inline: true }
            )
            .setTimestamp()
        ]
    });
}

async function handleLockdown(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
        const guild = interaction.guild;
        const verifiedRole = guild.roles.cache.find(r => r.name === 'Verified');
        
        if (!verifiedRole) {
            return interaction.editReply({
                content: '❌ No Verified role found! Run `/verify setup` first.'
            });
        }

        const verifyChannel = guild.channels.cache.find(c => c.name.includes('verify'));
        let locked = 0;

        for (const [, channel] of guild.channels.cache) {
            if (channel.id === verifyChannel?.id) continue;
            
            try {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    ViewChannel: false
                });
                await channel.permissionOverwrites.edit(verifiedRole, {
                    ViewChannel: true
                });
                locked++;
            } catch (err) {
                // Skip channels we can't edit
            }
        }

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('🔒 Server Locked Down')
                .setDescription('All channels now require verification!')
                .addFields(
                    { name: '✅ Channels Locked', value: locked.toString(), inline: true },
                    { name: '🔐 Verify Channel', value: verifyChannel?.toString() || 'None', inline: true }
                )
                .setFooter({ text: 'New members must verify to see channels' })
                .setTimestamp()
            ]
        });

    } catch (error) {
        console.error('Lockdown error:', error);
        await interaction.editReply({
            content: `❌ Lockdown failed: ${error.message}`
        });
    }
}

async function handleUnlock(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
        const guild = interaction.guild;
        let unlocked = 0;

        for (const [, channel] of guild.channels.cache) {
            try {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    ViewChannel: null
                });
                unlocked++;
            } catch (err) {
                // Skip
            }
        }

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('🔓 Server Unlocked')
                .setDescription('All channels are now accessible!')
                .addFields(
                    { name: '✅ Channels Unlocked', value: unlocked.toString() }
                )
                .setTimestamp()
            ]
        });

    } catch (error) {
        await interaction.editReply({
            content: `❌ Unlock failed: ${error.message}`
        });
    }
}

async function handleStats(interaction) {
    await interaction.deferReply({ flags: 64 });

    const stats = await advancedVerification.getVerificationStats(interaction.guild.id);
    const config = await advancedVerification.loadConfig(interaction.guild.id);
    const verifiedRole = interaction.guild.roles.cache.find(r => r.name === 'Verified');
    const verifyChannel = interaction.guild.channels.cache.find(c => c.name.includes('verify'));

    const methodNames = {
        simple: '✅ Simple Button',
        captcha: '🔤 CAPTCHA Code',
        math: '🧮 Math Challenge',
        hybrid: '🎲 Hybrid'
    };

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📊 Verification Statistics')
            .addFields(
                { name: '👥 Total Verified', value: stats.totalVerified.toString(), inline: true },
                { name: '🛡️ Method', value: methodNames[config.verificationMethod], inline: true },
                { name: '📅 Min Age', value: `${config.minAccountAgeDays} days`, inline: true },
                { name: '🔐 Channel', value: verifyChannel?.toString() || 'Not set', inline: true },
                { name: '✅ Role', value: verifiedRole?.toString() || 'Not set', inline: true },
                { name: '⏱️ Rate Limit', value: `${config.rateLimitSeconds}s`, inline: true }
            )
            .setTimestamp()
        ]
    });
}

async function handleReset(interaction) {
    await interaction.deferReply({ flags: 64 });

    const user = interaction.options.getUser('user');
    await advancedVerification.resetUser(interaction.guild.id, user.id);

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ User Reset')
            .setDescription(`${user} can now verify again.`)
            .setTimestamp()
        ]
    });
}
