const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setDocument, getDocument } = require('../../models/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antiraid')
        .setDescription('Configure anti-raid protection settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable anti-raid protection'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable anti-raid protection'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('View current anti-raid settings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configure anti-raid settings')
                .addIntegerOption(option =>
                    option.setName('joins')
                        .setDescription('Max joins per minute (1-50)')
                        .setMinValue(1)
                        .setMaxValue(50))
                .addIntegerOption(option =>
                    option.setName('age')
                        .setDescription('Min account age in days (1-365)')
                        .setMinValue(1)
                        .setMaxValue(365))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        // Defer the reply for database operations
        await interaction.deferReply();

        // Get current settings
        let settings = await getDocument('antiraid', guildId) || {
            enabled: false,
            maxJoinsPerMinute: 10,
            minAccountAge: 7,
            actionTaken: 'kick',
            recentJoins: []
        };

        switch (subcommand) {
            case 'enable':
                settings.enabled = true;
                await setDocument('antiraid', guildId, settings);
                
                const enableEmbed = new EmbedBuilder()
                    .setTitle('🛡️ Anti-Raid Protection Enabled')
                    .setColor(0x00ff00)
                    .addFields(
                        { name: 'Max Joins/Minute', value: settings.maxJoinsPerMinute.toString(), inline: true },
                        { name: 'Min Account Age', value: `${settings.minAccountAge} days`, inline: true },
                        { name: 'Action', value: settings.actionTaken, inline: true }
                    )
                    .setDescription('Anti-raid protection is now active!')
                    .setTimestamp();

                await interaction.editReply({ embeds: [enableEmbed] });
                break;

            case 'disable':
                settings.enabled = false;
                await setDocument('antiraid', guildId, settings);
                
                await interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setTitle('🚫 Anti-Raid Protection Disabled')
                        .setColor(0xff0000)
                        .setDescription('Anti-raid protection has been turned off')
                        .setTimestamp()]
                });
                break;

            case 'settings':
                const settingsEmbed = new EmbedBuilder()
                    .setTitle('⚙️ Anti-Raid Settings')
                    .setColor(settings.enabled ? 0x00ff00 : 0xff0000)
                    .addFields(
                        { name: 'Status', value: settings.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                        { name: 'Max Joins/Minute', value: settings.maxJoinsPerMinute.toString(), inline: true },
                        { name: 'Min Account Age', value: `${settings.minAccountAge} days`, inline: true },
                        { name: 'Action Taken', value: settings.actionTaken, inline: true },
                        { name: 'Recent Joins', value: settings.recentJoins.length.toString(), inline: true }
                    )
                    .setDescription('Current anti-raid configuration')
                    .setTimestamp();

                await interaction.editReply({ embeds: [settingsEmbed] });
                break;

            case 'config':
                const joins = interaction.options.getInteger('joins');
                const age = interaction.options.getInteger('age');
                
                if (joins) settings.maxJoinsPerMinute = joins;
                if (age) settings.minAccountAge = age;
                
                await setDocument('antiraid', guildId, settings);
                
                const configEmbed = new EmbedBuilder()
                    .setTitle('⚙️ Anti-Raid Configuration Updated')
                    .setColor(0x0099ff)
                    .addFields(
                        { name: 'Max Joins/Minute', value: settings.maxJoinsPerMinute.toString(), inline: true },
                        { name: 'Min Account Age', value: `${settings.minAccountAge} days`, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [configEmbed] });
                break;
        }
    }
};
