const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const webhookLogger = require('../../utils/webhookLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logging')
        .setDescription('Configure webhook and channel logging')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup webhook logging')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of logging to setup')
                        .setRequired(true)
                        .addChoices(
                            { name: '🛡️ Moderation Log', value: 'modLog' },
                            { name: '👥 Join/Leave Log', value: 'joinLeave' },
                            { name: '💬 Message Log', value: 'messageLog' },
                            { name: '🔊 Voice Log', value: 'voiceLog' }
                        ))
                .addStringOption(option =>
                    option.setName('webhook')
                        .setDescription('Webhook URL for logging')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Setup channel-based logging')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of logging')
                        .setRequired(true)
                        .addChoices(
                            { name: '🛡️ Moderation Log', value: 'modLog' },
                            { name: '👥 Join/Leave Log', value: 'joinLeave' },
                            { name: '💬 Message Log', value: 'messageLog' },
                            { name: '🔊 Voice Log', value: 'voiceLog' }
                        ))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel for logging')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable logging system'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable logging system'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('View current logging configuration'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Test webhook configuration')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of webhook to test')
                        .setRequired(true)
                        .addChoices(
                            { name: '🛡️ Moderation Log', value: 'modLog' },
                            { name: '👥 Join/Leave Log', value: 'joinLeave' },
                            { name: '💬 Message Log', value: 'messageLog' },
                            { name: '🔊 Voice Log', value: 'voiceLog' }
                        ))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        switch (subcommand) {
            case 'setup':
                const type = interaction.options.getString('type');
                const webhookUrl = interaction.options.getString('webhook');
                
                // Validate webhook URL
                if (!webhookUrl.includes('discord.com/api/webhooks/')) {
                    return interaction.editReply({
                        content: '❌ Invalid webhook URL. Please provide a Discord webhook URL.',
                        ephemeral: true
                    });
                }

                // Test webhook first
                const testResult = await webhookLogger.testWebhook(webhookUrl);
                if (!testResult) {
                    return interaction.editReply({
                        content: '❌ Webhook test failed. Please check the URL and permissions.',
                        ephemeral: true
                    });
                }

                // Update configuration
                const config = await webhookLogger.getWebhookConfig(guildId);
                config[type] = webhookUrl;
                config.enabled = true;
                await webhookLogger.setWebhookConfig(guildId, config);

                const setupEmbed = new EmbedBuilder()
                    .setTitle('✅ Webhook Logging Configured')
                    .setColor(0x00ff00)
                    .addFields(
                        { name: 'Type', value: this.getTypeName(type), inline: true },
                        { name: 'Status', value: '✅ Active', inline: true },
                        { name: 'Test', value: '✅ Passed', inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [setupEmbed] });
                break;

            case 'channel':
                const channelType = interaction.options.getString('type');
                const channel = interaction.options.getChannel('channel');

                // Create webhook for channel
                try {
                    const webhook = await channel.createWebhook({
                        name: `Sapphire ${this.getTypeName(channelType)}`,
                        reason: 'Logging setup'
                    });

                    const channelConfig = await webhookLogger.getWebhookConfig(guildId);
                    channelConfig[channelType] = webhook.url;
                    channelConfig.enabled = true;
                    await webhookLogger.setWebhookConfig(guildId, channelConfig);

                    const channelEmbed = new EmbedBuilder()
                        .setTitle('✅ Channel Logging Configured')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: 'Type', value: this.getTypeName(channelType), inline: true },
                            { name: 'Channel', value: channel.toString(), inline: true },
                            { name: 'Status', value: '✅ Active', inline: true }
                        )
                        .setTimestamp();

                    await interaction.editReply({ embeds: [channelEmbed] });
                } catch (error) {
                    await interaction.editReply({
                        content: '❌ Failed to create webhook. Check bot permissions in the target channel.',
                        ephemeral: true
                    });
                }
                break;

            case 'enable':
                const enableConfig = await webhookLogger.getWebhookConfig(guildId);
                enableConfig.enabled = true;
                await webhookLogger.setWebhookConfig(guildId, enableConfig);

                await interaction.editReply({
                    content: '✅ Logging system enabled!',
                    ephemeral: true
                });
                break;

            case 'disable':
                const disableConfig = await webhookLogger.getWebhookConfig(guildId);
                disableConfig.enabled = false;
                await webhookLogger.setWebhookConfig(guildId, disableConfig);

                await interaction.editReply({
                    content: '❌ Logging system disabled!',
                    ephemeral: true
                });
                break;

            case 'status':
                const statusConfig = await webhookLogger.getWebhookConfig(guildId);
                
                const statusEmbed = new EmbedBuilder()
                    .setTitle('📊 Logging Configuration')
                    .setColor(statusConfig.enabled ? 0x00ff00 : 0xff0000)
                    .addFields(
                        { name: 'System Status', value: statusConfig.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                        { name: '🛡️ Moderation Log', value: statusConfig.modLog ? '✅ Configured' : '❌ Not Set', inline: true },
                        { name: '👥 Join/Leave Log', value: statusConfig.joinLeave ? '✅ Configured' : '❌ Not Set', inline: true },
                        { name: '💬 Message Log', value: statusConfig.messageLog ? '✅ Configured' : '❌ Not Set', inline: true },
                        { name: '🔊 Voice Log', value: statusConfig.voiceLog ? '✅ Configured' : '❌ Not Set', inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [statusEmbed] });
                break;

            case 'test':
                const testType = interaction.options.getString('type');
                const testConfig = await webhookLogger.getWebhookConfig(guildId);
                
                if (!testConfig[testType]) {
                    return interaction.editReply({
                        content: `❌ ${this.getTypeName(testType)} webhook not configured.`,
                        ephemeral: true
                    });
                }

                const webhookTestResult = await webhookLogger.testWebhook(testConfig[testType]);
                
                await interaction.editReply({
                    content: webhookTestResult ? 
                        `✅ ${this.getTypeName(testType)} webhook test successful!` : 
                        `❌ ${this.getTypeName(testType)} webhook test failed!`,
                    ephemeral: true
                });
                break;
        }
    },

    getTypeName(type) {
        const names = {
            modLog: '🛡️ Moderation Log',
            joinLeave: '👥 Join/Leave Log',
            messageLog: '💬 Message Log',
            voiceLog: '🔊 Voice Log'
        };
        return names[type] || type;
    }
};
