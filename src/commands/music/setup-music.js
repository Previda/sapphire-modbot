const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const MUSIC_CONFIG_FILE = path.join(__dirname, '../../../data/music-config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-music')
        .setDescription('🎵 Setup music system configuration')
        .addRoleOption(option =>
            option
                .setName('dj_role')
                .setDescription('Role that can control music (optional)'))
        .addIntegerOption(option =>
            option
                .setName('max_queue')
                .setDescription('Maximum songs in queue (default: unlimited)')
                .setMinValue(1)
                .setMaxValue(100))
        .addIntegerOption(option =>
            option
                .setName('default_volume')
                .setDescription('Default volume (0-200, default: 100)')
                .setMinValue(0)
                .setMaxValue(200))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const djRole = interaction.options.getRole('dj_role');
            const maxQueue = interaction.options.getInteger('max_queue');
            const defaultVolume = interaction.options.getInteger('default_volume');

            // Load existing config
            let allConfigs = {};
            try {
                const data = await fs.readFile(MUSIC_CONFIG_FILE, 'utf8');
                allConfigs = JSON.parse(data);
            } catch (error) {
                // File doesn't exist yet
            }

            // Update config
            if (!allConfigs[interaction.guild.id]) {
                allConfigs[interaction.guild.id] = {
                    enabled: true,
                    djRole: null,
                    maxQueue: null,
                    defaultVolume: 100
                };
            }

            const config = allConfigs[interaction.guild.id];
            if (djRole) config.djRole = djRole.id;
            if (maxQueue !== null) config.maxQueue = maxQueue;
            if (defaultVolume !== null) config.defaultVolume = defaultVolume;

            // Save config
            await fs.mkdir(path.dirname(MUSIC_CONFIG_FILE), { recursive: true });
            await fs.writeFile(MUSIC_CONFIG_FILE, JSON.stringify(allConfigs, null, 2));

            // Check if music system is available
            const musicAvailable = !!interaction.client.musicSystem;

            const embed = new EmbedBuilder()
                .setTitle('🎵 Music System Setup')
                .setDescription(
                    musicAvailable 
                        ? '✅ Music system is configured and ready to use!' 
                        : '⚠️ Music system is not initialized. Run `npm install` and restart the bot.'
                )
                .setColor(musicAvailable ? 0x57F287 : 0xFEE75C)
                .addFields(
                    { 
                        name: '🎧 DJ Role', 
                        value: djRole ? djRole.toString() : config.djRole ? `<@&${config.djRole}>` : 'Not set (anyone can use)', 
                        inline: true 
                    },
                    { 
                        name: '📊 Max Queue Size', 
                        value: config.maxQueue ? `${config.maxQueue} songs` : 'Unlimited', 
                        inline: true 
                    },
                    { 
                        name: '🔊 Default Volume', 
                        value: `${config.defaultVolume}%`, 
                        inline: true 
                    }
                )
                .addFields({
                    name: '🎯 Available Commands',
                    value: 
                        '• `/play` - Play music from YouTube or Spotify\n' +
                        '• `/skip` - Skip current song\n' +
                        '• `/stop` - Stop music and clear queue\n' +
                        '• `/queue` - View current queue\n' +
                        '• `/volume` - Adjust volume (0-200%)',
                    inline: false
                })
                .setFooter({ text: 'Music system powered by play-dl' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Setup music command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('❌ Setup Error')
                .setDescription(`Failed to setup music system: ${error.message}`)
                .setTimestamp();
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};