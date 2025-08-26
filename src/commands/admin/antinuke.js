const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setDocument, getDocument } = require('../../models/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antinuke')
        .setDescription('Configure anti-nuke protection settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable anti-nuke protection'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable anti-nuke protection'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('View current anti-nuke settings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('whitelist')
                .setDescription('Add user to anti-nuke whitelist')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to whitelist')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        // Get current settings
        let settings = await getDocument('antinuke', guildId) || {
            enabled: false,
            whitelist: [],
            maxChannelDeletes: 3,
            maxRoleDeletes: 2,
            maxKicks: 5,
            maxBans: 3
        };

        switch (subcommand) {
            case 'enable':
                settings.enabled = true;
                await setDocument('antinuke', guildId, settings);
                
                const enableEmbed = new EmbedBuilder()
                    .setTitle('🛡️ Anti-Nuke Protection Enabled')
                    .setColor(0x00ff00)
                    .addFields(
                        { name: 'Max Channel Deletes', value: settings.maxChannelDeletes.toString(), inline: true },
                        { name: 'Max Role Deletes', value: settings.maxRoleDeletes.toString(), inline: true },
                        { name: 'Max Kicks', value: settings.maxKicks.toString(), inline: true },
                        { name: 'Max Bans', value: settings.maxBans.toString(), inline: true },
                        { name: 'Whitelisted Users', value: settings.whitelist.length.toString(), inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [enableEmbed] });
                break;

            case 'disable':
                settings.enabled = false;
                await setDocument('antinuke', guildId, settings);
                
                await interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setTitle('🚫 Anti-Nuke Protection Disabled')
                        .setColor(0xff0000)
                        .setDescription('Anti-nuke protection has been turned off')
                        .setTimestamp()]
                });
                break;

            case 'settings':
                const settingsEmbed = new EmbedBuilder()
                    .setTitle('⚙️ Anti-Nuke Settings')
                    .setColor(settings.enabled ? 0x00ff00 : 0xff0000)
                    .addFields(
                        { name: 'Status', value: settings.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                        { name: 'Max Channel Deletes', value: settings.maxChannelDeletes.toString(), inline: true },
                        { name: 'Max Role Deletes', value: settings.maxRoleDeletes.toString(), inline: true },
                        { name: 'Max Kicks', value: settings.maxKicks.toString(), inline: true },
                        { name: 'Max Bans', value: settings.maxBans.toString(), inline: true },
                        { name: 'Whitelisted Users', value: settings.whitelist.length.toString(), inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [settingsEmbed] });
                break;

            case 'whitelist':
                const user = interaction.options.getUser('user');
                
                if (settings.whitelist.includes(user.id)) {
                    // Remove from whitelist
                    settings.whitelist = settings.whitelist.filter(id => id !== user.id);
                    await setDocument('antinuke', guildId, settings);
                    
                    await interaction.editReply({
                        content: `🚫 Removed ${user.tag} from anti-nuke whitelist`
                    });
                } else {
                    // Add to whitelist
                    settings.whitelist.push(user.id);
                    await setDocument('antinuke', guildId, settings);
                    
                    await interaction.editReply({
                        content: `✅ Added ${user.tag} to anti-nuke whitelist`
                    });
                }
                break;
        }
    }
};
