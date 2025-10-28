const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod-config')
        .setDescription('Configure advanced auto-moderation (Wick-level)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View current automod configuration'))
        .addSubcommand(sub =>
            sub.setName('enable')
                .setDescription('Enable automod features')
                .addStringOption(opt =>
                    opt.setName('feature')
                        .setDescription('Feature to enable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Anti-Spam', value: 'antiSpam' },
                            { name: 'Anti-Invite', value: 'antiInvite' },
                            { name: 'Anti-Link', value: 'antiLink' },
                            { name: 'Caps Flood', value: 'capsFlood' },
                            { name: 'Emoji Flood', value: 'emojiFlood' },
                            { name: 'Mention Spam', value: 'mentionSpam' },
                            { name: 'Anti-NSFW', value: 'antiNSFW' },
                            { name: 'Anti-Zalgo', value: 'antiZalgo' },
                            { name: 'Anti-Raid', value: 'antiRaid' },
                            { name: 'Anti-Nuke', value: 'antiNuke' },
                            { name: 'All Features', value: 'all' }
                        )))
        .addSubcommand(sub =>
            sub.setName('disable')
                .setDescription('Disable automod features')
                .addStringOption(opt =>
                    opt.setName('feature')
                        .setDescription('Feature to disable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Anti-Spam', value: 'antiSpam' },
                            { name: 'Anti-Invite', value: 'antiInvite' },
                            { name: 'Anti-Link', value: 'antiLink' },
                            { name: 'Caps Flood', value: 'capsFlood' },
                            { name: 'Emoji Flood', value: 'emojiFlood' },
                            { name: 'Mention Spam', value: 'mentionSpam' },
                            { name: 'Anti-NSFW', value: 'antiNSFW' },
                            { name: 'Anti-Zalgo', value: 'antiZalgo' },
                            { name: 'Anti-Raid', value: 'antiRaid' },
                            { name: 'Anti-Nuke', value: 'antiNuke' },
                            { name: 'All Features', value: 'all' }
                        )))
        .addSubcommand(sub =>
            sub.setName('thresholds')
                .setDescription('Set punishment thresholds')
                .addIntegerOption(opt =>
                    opt.setName('warn')
                        .setDescription('Violations before warn (default: 2)')
                        .setMinValue(1)
                        .setMaxValue(10))
                .addIntegerOption(opt =>
                    opt.setName('mute')
                        .setDescription('Violations before mute (default: 4)')
                        .setMinValue(1)
                        .setMaxValue(15))
                .addIntegerOption(opt =>
                    opt.setName('kick')
                        .setDescription('Violations before kick (default: 6)')
                        .setMinValue(1)
                        .setMaxValue(20))
                .addIntegerOption(opt =>
                    opt.setName('ban')
                        .setDescription('Violations before ban (default: 8)')
                        .setMinValue(1)
                        .setMaxValue(25)))
        .addSubcommand(sub =>
            sub.setName('whitelist')
                .setDescription('Whitelist a role or channel')
                .addStringOption(opt =>
                    opt.setName('type')
                        .setDescription('What to whitelist')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Role', value: 'role' },
                            { name: 'Channel', value: 'channel' }
                        ))
                .addStringOption(opt =>
                    opt.setName('id')
                        .setDescription('Role or Channel ID')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('log-channel')
                .setDescription('Set the automod log channel')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Channel for automod logs')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('preset')
                .setDescription('Load a preset configuration')
                .addStringOption(opt =>
                    opt.setName('level')
                        .setDescription('Preset level')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Low (Relaxed)', value: 'low' },
                            { name: 'Medium (Balanced)', value: 'medium' },
                            { name: 'High (Strict)', value: 'high' },
                            { name: 'Wick (Maximum Protection)', value: 'wick' }
                        ))),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            // Get current config (would be from database in production)
            let config = await this.getConfig(guildId);

            switch (subcommand) {
                case 'view':
                    await this.handleView(interaction, config);
                    break;

                case 'enable':
                    await this.handleEnable(interaction, config);
                    break;

                case 'disable':
                    await this.handleDisable(interaction, config);
                    break;

                case 'thresholds':
                    await this.handleThresholds(interaction, config);
                    break;

                case 'whitelist':
                    await this.handleWhitelist(interaction, config);
                    break;

                case 'log-channel':
                    await this.handleLogChannel(interaction, config);
                    break;

                case 'preset':
                    await this.handlePreset(interaction, config);
                    break;
            }

        } catch (error) {
            console.error('Automod config error:', error);
            await interaction.editReply({
                content: '❌ Failed to update automod configuration.',
                ephemeral: true
            });
        }
    },

    async handleView(interaction, config) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Advanced Auto-Moderation Configuration')
            .setDescription('Current automod settings for this server')
            .setColor(0x0099ff)
            .addFields(
                { 
                    name: '📊 Status', 
                    value: config.enabled ? '✅ Enabled' : '❌ Disabled', 
                    inline: true 
                },
                { 
                    name: '📝 Log Channel', 
                    value: config.logChannelId ? `<#${config.logChannelId}>` : '❌ Not set', 
                    inline: true 
                },
                { name: '\u200b', value: '\u200b', inline: true },
                {
                    name: '🚫 Content Filters',
                    value: [
                        `${config.antiSpam ? '✅' : '❌'} Anti-Spam`,
                        `${config.antiInvite ? '✅' : '❌'} Anti-Invite`,
                        `${config.antiLink ? '✅' : '❌'} Anti-Link`,
                        `${config.antiNSFW ? '✅' : '❌'} Anti-NSFW`,
                        `${config.antiZalgo ? '✅' : '❌'} Anti-Zalgo`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '💬 Flood Protection',
                    value: [
                        `${config.capsFlood ? '✅' : '❌'} Caps Flood`,
                        `${config.emojiFlood ? '✅' : '❌'} Emoji Flood`,
                        `${config.mentionSpam ? '✅' : '❌'} Mention Spam`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🛡️ Server Protection',
                    value: [
                        `${config.antiRaid ? '✅' : '❌'} Anti-Raid`,
                        `${config.antiNuke ? '✅' : '❌'} Anti-Nuke`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⚖️ Punishment Thresholds',
                    value: [
                        `⚠️ Warn: ${config.warnThreshold} violations`,
                        `🔇 Mute: ${config.muteThreshold} violations (${config.muteDuration}s)`,
                        `👢 Kick: ${config.kickThreshold} violations`,
                        `🔨 Ban: ${config.banThreshold} violations`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🎭 Raid Protection',
                    value: `Action: ${config.raidAction || 'lockdown'}`,
                    inline: true
                },
                {
                    name: '💣 Nuke Protection',
                    value: `Action: ${config.nukeAction || 'remove_perms'}`,
                    inline: true
                }
            )
            .setFooter({ text: 'Use /automod-config preset to load presets' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async handleEnable(interaction, config) {
        const feature = interaction.options.getString('feature');

        if (feature === 'all') {
            config.antiSpam = true;
            config.antiInvite = true;
            config.antiLink = true;
            config.capsFlood = true;
            config.emojiFlood = true;
            config.mentionSpam = true;
            config.antiNSFW = true;
            config.antiZalgo = true;
            config.antiRaid = true;
            config.antiNuke = true;
        } else {
            config[feature] = true;
        }

        await this.saveConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('✅ Feature Enabled')
            .setDescription(`**${this.getFeatureName(feature)}** has been enabled`)
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async handleDisable(interaction, config) {
        const feature = interaction.options.getString('feature');

        if (feature === 'all') {
            config.antiSpam = false;
            config.antiInvite = false;
            config.antiLink = false;
            config.capsFlood = false;
            config.emojiFlood = false;
            config.mentionSpam = false;
            config.antiNSFW = false;
            config.antiZalgo = false;
            config.antiRaid = false;
            config.antiNuke = false;
        } else {
            config[feature] = false;
        }

        await this.saveConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('❌ Feature Disabled')
            .setDescription(`**${this.getFeatureName(feature)}** has been disabled`)
            .setColor(0xff6600)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async handleThresholds(interaction, config) {
        const warn = interaction.options.getInteger('warn');
        const mute = interaction.options.getInteger('mute');
        const kick = interaction.options.getInteger('kick');
        const ban = interaction.options.getInteger('ban');

        if (warn) config.warnThreshold = warn;
        if (mute) config.muteThreshold = mute;
        if (kick) config.kickThreshold = kick;
        if (ban) config.banThreshold = ban;

        await this.saveConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('⚖️ Thresholds Updated')
            .setDescription('Punishment thresholds have been updated')
            .addFields(
                { name: 'Warn', value: `${config.warnThreshold} violations`, inline: true },
                { name: 'Mute', value: `${config.muteThreshold} violations`, inline: true },
                { name: 'Kick', value: `${config.kickThreshold} violations`, inline: true },
                { name: 'Ban', value: `${config.banThreshold} violations`, inline: true }
            )
            .setColor(0x0099ff)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async handleWhitelist(interaction, config) {
        const type = interaction.options.getString('type');
        const id = interaction.options.getString('id');

        if (!config.whitelist) {
            config.whitelist = { roles: [], channels: [] };
        }

        if (type === 'role') {
            if (!config.whitelist.roles.includes(id)) {
                config.whitelist.roles.push(id);
            }
        } else {
            if (!config.whitelist.channels.includes(id)) {
                config.whitelist.channels.push(id);
            }
        }

        await this.saveConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('✅ Whitelist Updated')
            .setDescription(`${type === 'role' ? 'Role' : 'Channel'} has been whitelisted`)
            .addFields({ name: 'ID', value: id })
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async handleLogChannel(interaction, config) {
        const channel = interaction.options.getChannel('channel');
        config.logChannelId = channel.id;

        await this.saveConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('📝 Log Channel Set')
            .setDescription(`Automod logs will be sent to ${channel}`)
            .setColor(0x0099ff)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async handlePreset(interaction, config) {
        const level = interaction.options.getString('level');
        const preset = this.getPreset(level);

        Object.assign(config, preset);
        await this.saveConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle(`🛡️ Preset Loaded: ${level.toUpperCase()}`)
            .setDescription(this.getPresetDescription(level))
            .addFields(
                { name: 'Anti-Spam', value: preset.antiSpam ? '✅' : '❌', inline: true },
                { name: 'Anti-Invite', value: preset.antiInvite ? '✅' : '❌', inline: true },
                { name: 'Anti-Raid', value: preset.antiRaid ? '✅' : '❌', inline: true },
                { name: 'Anti-Nuke', value: preset.antiNuke ? '✅' : '❌', inline: true },
                { name: 'Warn Threshold', value: `${preset.warnThreshold}`, inline: true },
                { name: 'Mute Threshold', value: `${preset.muteThreshold}`, inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    getPreset(level) {
        const presets = {
            low: {
                enabled: true,
                antiSpam: true,
                antiInvite: false,
                antiLink: false,
                capsFlood: false,
                emojiFlood: false,
                mentionSpam: true,
                antiNSFW: true,
                antiZalgo: false,
                antiRaid: false,
                antiNuke: false,
                warnThreshold: 5,
                muteThreshold: 8,
                kickThreshold: 12,
                banThreshold: 15,
                muteDuration: 300,
                raidAction: 'alert',
                nukeAction: 'alert'
            },
            medium: {
                enabled: true,
                antiSpam: true,
                antiInvite: true,
                antiLink: false,
                capsFlood: true,
                emojiFlood: true,
                mentionSpam: true,
                antiNSFW: true,
                antiZalgo: true,
                antiRaid: true,
                antiNuke: true,
                warnThreshold: 3,
                muteThreshold: 5,
                kickThreshold: 8,
                banThreshold: 10,
                muteDuration: 600,
                raidAction: 'lockdown',
                nukeAction: 'remove_perms'
            },
            high: {
                enabled: true,
                antiSpam: true,
                antiInvite: true,
                antiLink: true,
                capsFlood: true,
                emojiFlood: true,
                mentionSpam: true,
                antiNSFW: true,
                antiZalgo: true,
                antiRaid: true,
                antiNuke: true,
                warnThreshold: 2,
                muteThreshold: 3,
                kickThreshold: 5,
                banThreshold: 7,
                muteDuration: 900,
                raidAction: 'kick_new',
                nukeAction: 'ban'
            },
            wick: {
                enabled: true,
                antiSpam: true,
                antiInvite: true,
                antiLink: true,
                capsFlood: true,
                emojiFlood: true,
                mentionSpam: true,
                antiNSFW: true,
                antiZalgo: true,
                antiRaid: true,
                antiNuke: true,
                warnThreshold: 1,
                muteThreshold: 2,
                kickThreshold: 3,
                banThreshold: 4,
                muteDuration: 1800,
                raidAction: 'kick_new',
                nukeAction: 'ban'
            }
        };

        return presets[level] || presets.medium;
    },

    getPresetDescription(level) {
        const descriptions = {
            low: 'Relaxed protection - Basic spam and NSFW filtering',
            medium: 'Balanced protection - Recommended for most servers',
            high: 'Strict protection - Strong filtering and quick punishments',
            wick: 'Maximum protection - Wick-level security with zero tolerance'
        };

        return descriptions[level] || descriptions.medium;
    },

    getFeatureName(feature) {
        const names = {
            antiSpam: 'Anti-Spam',
            antiInvite: 'Anti-Invite',
            antiLink: 'Anti-Link',
            capsFlood: 'Caps Flood Protection',
            emojiFlood: 'Emoji Flood Protection',
            mentionSpam: 'Mention Spam Protection',
            antiNSFW: 'Anti-NSFW',
            antiZalgo: 'Anti-Zalgo',
            antiRaid: 'Anti-Raid',
            antiNuke: 'Anti-Nuke',
            all: 'All Features'
        };

        return names[feature] || feature;
    },

    async getConfig(guildId) {
        // In production, this would fetch from database
        // For now, return default config
        return {
            enabled: true,
            antiSpam: true,
            antiInvite: true,
            antiLink: false,
            capsFlood: true,
            emojiFlood: true,
            mentionSpam: true,
            antiNSFW: true,
            antiZalgo: true,
            antiRaid: true,
            antiNuke: true,
            warnThreshold: 2,
            muteThreshold: 4,
            kickThreshold: 6,
            banThreshold: 8,
            muteDuration: 600,
            raidAction: 'lockdown',
            nukeAction: 'remove_perms',
            logChannelId: null,
            whitelist: {
                roles: [],
                channels: []
            },
            nukeWhitelist: []
        };
    },

    async saveConfig(guildId, config) {
        // In production, this would save to database
        console.log(`Saving automod config for guild ${guildId}:`, config);
        return true;
    }
};
