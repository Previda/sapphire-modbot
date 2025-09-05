const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set loop mode for music playback')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode to set')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' }
                )),

    async execute(interaction) {
        try {
            // Check if music bot is enabled for this server
            if (!checkMusicPermissions(interaction)) {
                return;
            }

            const mode = interaction.options.getString('mode');
            const guildId = interaction.guild.id;
            
            // Get current music state
            let musicState = getMusicState(guildId);
            if (!musicState) {
                musicState = {
                    loop: 'off',
                    queue: [],
                    currentTrack: null,
                    volume: 50
                };
            }

            // Update loop mode
            musicState.loop = mode;
            saveMusicState(guildId, musicState);

            // Create response embed
            const embed = new EmbedBuilder()
                .setColor('#5865f2')
                .setTitle('🔄 Loop Mode Updated')
                .setDescription(getLoopDescription(mode))
                .addFields({
                    name: 'Current Mode',
                    value: getLoopEmoji(mode) + ' ' + mode.toUpperCase(),
                    inline: true
                })
                .setTimestamp()
                .setFooter({ text: 'Skyfall Music Bot' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Loop command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while setting loop mode.',
                ephemeral: true
            });
        }
    }
};

function checkMusicPermissions(interaction) {
    const settingsPath = path.join(__dirname, '../../data/music-settings.json');
    
    if (!fs.existsSync(settingsPath)) {
        interaction.reply({
            content: '❌ Music bot is not configured for this server. Use `/setup-music` first.',
            ephemeral: true
        });
        return false;
    }

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const guildSettings = settings[interaction.guild.id];

    if (!guildSettings || !guildSettings.enabled) {
        interaction.reply({
            content: '❌ Music bot is disabled for this server. Ask an admin to enable it with `/setup-music`.',
            ephemeral: true
        });
        return false;
    }

    if (guildSettings.requiredRole) {
        const hasRole = interaction.member.roles.cache.has(guildSettings.requiredRole);
        if (!hasRole && !interaction.member.permissions.has('ADMINISTRATOR')) {
            const role = interaction.guild.roles.cache.get(guildSettings.requiredRole);
            interaction.reply({
                content: `❌ You need the **${role ? role.name : 'required'}** role to use music commands.`,
                ephemeral: true
            });
            return false;
        }
    }

    return true;
}

function getMusicState(guildId) {
    const statePath = path.join(__dirname, '../../data/music-state.json');
    
    if (!fs.existsSync(statePath)) {
        return null;
    }

    const states = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    return states[guildId] || null;
}

function saveMusicState(guildId, state) {
    const statePath = path.join(__dirname, '../../data/music-state.json');
    const dir = path.dirname(statePath);
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let states = {};
    if (fs.existsSync(statePath)) {
        states = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    }

    states[guildId] = state;
    fs.writeFileSync(statePath, JSON.stringify(states, null, 2));
}

function getLoopDescription(mode) {
    switch (mode) {
        case 'off':
            return 'Loop is now **disabled**. Songs will play once and move to the next track.';
        case 'track':
            return 'Now looping the **current track**. The same song will repeat until you change the mode.';
        case 'queue':
            return 'Now looping the **entire queue**. All songs will repeat in order when the queue ends.';
        default:
            return 'Loop mode updated.';
    }
}

function getLoopEmoji(mode) {
    switch (mode) {
        case 'off':
            return '⏭️';
        case 'track':
            return '🔂';
        case 'queue':
            return '🔁';
        default:
            return '🔄';
    }
}
