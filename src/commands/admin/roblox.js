const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const ROBLOX_CONFIG_FILE = path.join(__dirname, '../../../data/roblox-config.json');
const ROBLOX_VERIFIED_FILE = path.join(__dirname, '../../../data/roblox-verified.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roblox')
        .setDescription('🎮 Roblox verification system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup Roblox verification system'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('panel')
                .setDescription('Send Roblox verification panel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to send panel')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configure Roblox verification')
                .addRoleOption(option =>
                    option
                        .setName('verified_role')
                        .setDescription('Role to give verified users'))
                .addIntegerOption(option =>
                    option
                        .setName('min_account_age')
                        .setDescription('Minimum Roblox account age in days')
                        .setMinValue(0)
                        .setMaxValue(3650))
                .addBooleanOption(option =>
                    option
                        .setName('require_group')
                        .setDescription('Require user to be in a specific group'))
                .addStringOption(option =>
                    option
                        .setName('group_id')
                        .setDescription('Roblox group ID to check')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check a user\'s Roblox verification')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to check')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlink')
                .setDescription('Unlink a user\'s Roblox account')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to unlink')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View Roblox verification statistics'))
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
            case 'config':
                await handleConfig(interaction);
                break;
            case 'check':
                await handleCheck(interaction);
                break;
            case 'unlink':
                await handleUnlink(interaction);
                break;
            case 'stats':
                await handleStats(interaction);
                break;
        }
    }
};

async function loadConfig(guildId) {
    try {
        const data = await fs.readFile(ROBLOX_CONFIG_FILE, 'utf8');
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
            const data = await fs.readFile(ROBLOX_CONFIG_FILE, 'utf8');
            allConfigs = JSON.parse(data);
        } catch (error) {
            // File doesn't exist
        }
        allConfigs[guildId] = config;
        
        await fs.mkdir(path.dirname(ROBLOX_CONFIG_FILE), { recursive: true });
        await fs.writeFile(ROBLOX_CONFIG_FILE, JSON.stringify(allConfigs, null, 2));
    } catch (error) {
        console.error('Error saving Roblox config:', error);
    }
}

function getDefaultConfig() {
    return {
        enabled: false,
        verifiedRole: null,
        minAccountAge: 30,
        requireGroup: false,
        groupId: null,
        verificationChannel: null
    };
}

async function loadVerified() {
    try {
        const data = await fs.readFile(ROBLOX_VERIFIED_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function saveVerified(data) {
    try {
        await fs.mkdir(path.dirname(ROBLOX_VERIFIED_FILE), { recursive: true });
        await fs.writeFile(ROBLOX_VERIFIED_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving verified data:', error);
    }
}

async function handleSetup(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
        const guild = interaction.guild;
        const config = await loadConfig(guild.id);

        // Create verified role
        let verifiedRole = guild.roles.cache.find(r => r.name === 'Roblox Verified');
        if (!verifiedRole) {
            verifiedRole = await guild.roles.create({
                name: 'Roblox Verified',
                color: 0xE74C3C,
                reason: 'Roblox verification system',
                position: 1
            });
        }

        config.enabled = true;
        config.verifiedRole = verifiedRole.id;
        await saveConfig(guild.id, config);

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Roblox Verification Setup Complete!')
                .setDescription('The Roblox verification system is now active!')
                .addFields(
                    { name: '✅ Verified Role', value: verifiedRole.toString(), inline: true },
                    { name: '📅 Min Account Age', value: `${config.minAccountAge} days`, inline: true }
                )
                .addFields({
                    name: '📝 Next Steps',
                    value: 
                        '• Use `/roblox panel` to send verification panel\n' +
                        '• Use `/roblox config` to customize settings\n' +
                        '• Users can now verify their Roblox accounts!'
                })
                .setTimestamp()
            ]
        });

    } catch (error) {
        console.error('Roblox setup error:', error);
        await interaction.editReply({
            content: `❌ Setup failed: ${error.message}`
        });
    }
}

async function handlePanel(interaction) {
    await interaction.deferReply({ flags: 64 });

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const config = await loadConfig(interaction.guild.id);

    if (!config.enabled) {
        return interaction.editReply({
            content: '❌ Roblox verification not set up! Use `/roblox setup` first.'
        });
    }

    const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('🎮 Roblox Verification')
        .setDescription(
            '**Link your Roblox account to Discord!**\n\n' +
            'Click the button below to verify your Roblox account.\n\n' +
            '**Benefits:**\n' +
            '• Get the Roblox Verified role\n' +
            '• Access exclusive channels\n' +
            '• Show your Roblox username\n\n' +
            '**How it works:**\n' +
            '1. Click "Verify Roblox Account"\n' +
            '2. Enter your Roblox username\n' +
            '3. Add a specific code to your Roblox profile description\n' +
            '4. Confirm and get verified!'
        )
        .setFooter({ text: 'Powered by Roblox API' })
        .setTimestamp();

    const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('roblox_verify_start')
                .setLabel('Verify Roblox Account')
                .setEmoji('🎮')
                .setStyle(ButtonStyle.Primary)
        );

    await channel.send({ embeds: [embed], components: [button] });

    await interaction.editReply({
        content: `✅ Roblox verification panel sent to ${channel}!`
    });
}

async function handleConfig(interaction) {
    await interaction.deferReply({ flags: 64 });

    const config = await loadConfig(interaction.guild.id);
    
    const verifiedRole = interaction.options.getRole('verified_role');
    const minAccountAge = interaction.options.getInteger('min_account_age');
    const requireGroup = interaction.options.getBoolean('require_group');
    const groupId = interaction.options.getString('group_id');

    if (verifiedRole) config.verifiedRole = verifiedRole.id;
    if (minAccountAge !== null) config.minAccountAge = minAccountAge;
    if (requireGroup !== null) config.requireGroup = requireGroup;
    if (groupId) config.groupId = groupId;

    await saveConfig(interaction.guild.id, config);

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ Configuration Updated')
            .setDescription('Roblox verification settings have been updated!')
            .addFields(
                { name: '✅ Verified Role', value: verifiedRole ? verifiedRole.toString() : `<@&${config.verifiedRole}>`, inline: true },
                { name: '📅 Min Account Age', value: `${config.minAccountAge} days`, inline: true },
                { name: '👥 Require Group', value: config.requireGroup ? '✅ Yes' : '❌ No', inline: true },
                { name: '🏢 Group ID', value: config.groupId || 'Not set', inline: true }
            )
            .setTimestamp()
        ]
    });
}

async function handleCheck(interaction) {
    await interaction.deferReply({ flags: 64 });

    const user = interaction.options.getUser('user');
    const verified = await loadVerified();
    const userData = verified[interaction.guild.id]?.[user.id];

    if (!userData) {
        return interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('❌ Not Verified')
                .setDescription(`${user} has not verified their Roblox account.`)
                .setTimestamp()
            ]
        });
    }

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ Roblox Account Verified')
            .setDescription(`${user} is verified!`)
            .addFields(
                { name: '🎮 Roblox Username', value: userData.robloxUsername, inline: true },
                { name: '🆔 Roblox ID', value: userData.robloxId.toString(), inline: true },
                { name: '📅 Verified At', value: `<t:${Math.floor(new Date(userData.verifiedAt).getTime() / 1000)}:F>`, inline: false }
            )
            .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${userData.robloxId}&width=150&height=150&format=png`)
            .setTimestamp()
        ]
    });
}

async function handleUnlink(interaction) {
    await interaction.deferReply({ flags: 64 });

    const user = interaction.options.getUser('user');
    const verified = await loadVerified();

    if (!verified[interaction.guild.id]?.[user.id]) {
        return interaction.editReply({
            content: `❌ ${user} is not verified!`
        });
    }

    delete verified[interaction.guild.id][user.id];
    await saveVerified(verified);

    // Remove role
    const config = await loadConfig(interaction.guild.id);
    const member = interaction.guild.members.cache.get(user.id);
    if (member && config.verifiedRole) {
        await member.roles.remove(config.verifiedRole);
    }

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ Account Unlinked')
            .setDescription(`${user}'s Roblox account has been unlinked.`)
            .setTimestamp()
        ]
    });
}

async function handleStats(interaction) {
    await interaction.deferReply({ flags: 64 });

    const verified = await loadVerified();
    const guildData = verified[interaction.guild.id] || {};
    const totalVerified = Object.keys(guildData).length;

    await interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📊 Roblox Verification Statistics')
            .addFields(
                { name: '👥 Total Verified', value: totalVerified.toString(), inline: true },
                { name: '📈 Server Members', value: interaction.guild.memberCount.toString(), inline: true },
                { name: '📊 Verification Rate', value: `${((totalVerified / interaction.guild.memberCount) * 100).toFixed(1)}%`, inline: true }
            )
            .setTimestamp()
        ]
    });
}
