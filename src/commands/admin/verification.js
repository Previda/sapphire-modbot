const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { loadGuildConfig, saveGuildConfig } = require('../../utils/configManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription('🔐 Manage server verification system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable verification (locks server until verified)')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable or disable verification')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('lockdown')
                .setDescription('Lock ALL channels from @everyone (verification required)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlock')
                .setDescription('Unlock all channels (allow @everyone to see)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('View verification system status'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'enable':
                await handleEnable(interaction);
                break;
            case 'lockdown':
                await handleLockdown(interaction);
                break;
            case 'unlock':
                await handleUnlock(interaction);
                break;
            case 'status':
                await handleStatus(interaction);
                break;
        }
    }
};

async function handleEnable(interaction) {
    await interaction.deferReply({ flags: 64 });

    const enabled = interaction.options.getBoolean('enabled');
    const config = await loadGuildConfig(interaction.guild.id);

    config.verificationEnabled = enabled;
    await saveGuildConfig(interaction.guild.id, config);

    const embed = new EmbedBuilder()
        .setTitle(`🔐 Verification ${enabled ? 'Enabled' : 'Disabled'}`)
        .setColor(enabled ? '#00ff00' : '#ff0000')
        .setDescription(enabled ? 
            '✅ Verification is now **ENABLED**\n\nNew members will only see the verification channel until they verify.' :
            '❌ Verification is now **DISABLED**\n\nNew members will have full access to the server.'
        )
        .setTimestamp();

    if (enabled && !config.verifiedRole) {
        embed.addFields({
            name: '⚠️ Setup Required',
            value: 'Run `/setup` to create verification channel and role!',
            inline: false
        });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleLockdown(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
        const guild = interaction.guild;
        const config = await loadGuildConfig(guild.id);

        if (!config.verifiedRole) {
            return interaction.editReply({
                content: '❌ No verified role found! Run `/setup` first to create the verification system.'
            });
        }

        const verifiedRole = guild.roles.cache.get(config.verifiedRole);
        if (!verifiedRole) {
            return interaction.editReply({
                content: '❌ Verified role no longer exists! Run `/setup` again.'
            });
        }

        const verifyChannel = guild.channels.cache.get(config.verificationChannel);
        let lockedCount = 0;
        let skippedCount = 0;

        const statusEmbed = new EmbedBuilder()
            .setTitle('🔒 Locking Down Server...')
            .setDescription('Please wait while I lock all channels...')
            .setColor('#ff9900')
            .setTimestamp();

        await interaction.editReply({ embeds: [statusEmbed] });

        // Lock all channels except verification channel
        for (const [channelId, channel] of guild.channels.cache) {
            // Skip categories, voice channels we don't want to lock, and the verify channel
            if (channel.id === verifyChannel?.id) {
                continue;
            }

            try {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    ViewChannel: false
                });

                await channel.permissionOverwrites.edit(verifiedRole, {
                    ViewChannel: true
                });

                lockedCount++;
            } catch (error) {
                console.log(`Could not lock ${channel.name}:`, error.message);
                skippedCount++;
            }
        }

        const successEmbed = new EmbedBuilder()
            .setTitle('🔒 Server Lockdown Complete!')
            .setDescription('All channels are now locked. Only verified members can access them.')
            .addFields(
                { name: '✅ Channels Locked', value: lockedCount.toString(), inline: true },
                { name: '⚠️ Skipped', value: skippedCount.toString(), inline: true },
                { name: '🔐 Verify Channel', value: verifyChannel ? verifyChannel.toString() : 'Not set', inline: true }
            )
            .setColor('#00ff00')
            .setFooter({ text: 'New members must verify to see channels' })
            .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });

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
        let unlockedCount = 0;

        const statusEmbed = new EmbedBuilder()
            .setTitle('🔓 Unlocking Server...')
            .setDescription('Please wait while I unlock all channels...')
            .setColor('#ff9900')
            .setTimestamp();

        await interaction.editReply({ embeds: [statusEmbed] });

        // Unlock all channels
        for (const [channelId, channel] of guild.channels.cache) {
            try {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    ViewChannel: null // Reset to default
                });

                unlockedCount++;
            } catch (error) {
                console.log(`Could not unlock ${channel.name}:`, error.message);
            }
        }

        const successEmbed = new EmbedBuilder()
            .setTitle('🔓 Server Unlocked!')
            .setDescription('All channels are now accessible to @everyone.')
            .addFields(
                { name: '✅ Channels Unlocked', value: unlockedCount.toString(), inline: true }
            )
            .setColor('#00ff00')
            .setFooter({ text: 'Everyone can now see all channels' })
            .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });

    } catch (error) {
        console.error('Unlock error:', error);
        await interaction.editReply({
            content: `❌ Unlock failed: ${error.message}`
        });
    }
}

async function handleStatus(interaction) {
    await interaction.deferReply({ flags: 64 });

    const config = await loadGuildConfig(interaction.guild.id);
    const guild = interaction.guild;

    const verifyChannel = config.verificationChannel ? guild.channels.cache.get(config.verificationChannel) : null;
    const verifiedRole = config.verifiedRole ? guild.roles.cache.get(config.verifiedRole) : null;

    const embed = new EmbedBuilder()
        .setTitle('🔐 Verification System Status')
        .setColor(config.verificationEnabled ? '#00ff00' : '#ff0000')
        .addFields(
            { name: '📊 Status', value: config.verificationEnabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '🔐 Verify Channel', value: verifyChannel ? verifyChannel.toString() : '❌ Not set', inline: true },
            { name: '✅ Verified Role', value: verifiedRole ? verifiedRole.toString() : '❌ Not set', inline: true }
        )
        .setTimestamp();

    if (verifiedRole) {
        const verifiedCount = guild.members.cache.filter(m => m.roles.cache.has(verifiedRole.id)).size;
        const totalMembers = guild.memberCount;
        const unverifiedCount = totalMembers - verifiedCount;

        embed.addFields(
            { name: '👥 Total Members', value: totalMembers.toString(), inline: true },
            { name: '✅ Verified', value: verifiedCount.toString(), inline: true },
            { name: '⏳ Unverified', value: unverifiedCount.toString(), inline: true }
        );
    }

    if (!config.verificationEnabled || !verifyChannel || !verifiedRole) {
        embed.addFields({
            name: '⚠️ Setup Required',
            value: 'Run `/setup` to create the verification system!\nThen run `/verification lockdown` to lock all channels.',
            inline: false
        });
    }

    await interaction.editReply({ embeds: [embed] });
}
