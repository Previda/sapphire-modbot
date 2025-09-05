const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seek to a specific time in the current song')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time to seek to (format: mm:ss or seconds)')
                .setRequired(true)),

    async execute(interaction) {
        try {
            // Check if music bot is enabled for this server
            if (!checkMusicPermissions(interaction)) {
                return;
            }

            const timeInput = interaction.options.getString('time');
            const guildId = interaction.guild.id;
            
            // Get current music state
            let musicState = getMusicState(guildId);
            if (!musicState || !musicState.currentTrack) {
                const embed = new EmbedBuilder()
                    .setColor('#ed4245')
                    .setTitle('⏯️ No Song Playing')
                    .setDescription('There\'s no song currently playing to seek in!')
                    .setTimestamp()
                    .setFooter({ text: 'Skyfall Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            // Parse time input
            const seekTime = parseTimeInput(timeInput);
            if (seekTime === null) {
                const embed = new EmbedBuilder()
                    .setColor('#ed4245')
                    .setTitle('❌ Invalid Time Format')
                    .setDescription('Please use format: `mm:ss` (e.g., 1:30) or seconds (e.g., 90)')
                    .addFields({
                        name: 'Examples',
                        value: '• `/seek 1:30` - Seek to 1 minute 30 seconds\n• `/seek 90` - Seek to 90 seconds\n• `/seek 0:45` - Seek to 45 seconds',
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({ text: 'Skyfall Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            const track = musicState.currentTrack;
            
            // Check if seek time is valid
            if (seekTime > track.duration) {
                const embed = new EmbedBuilder()
                    .setColor('#ffa500')
                    .setTitle('⚠️ Seek Time Too Long')
                    .setDescription(`Cannot seek to ${formatTime(seekTime)} - song is only ${formatTime(track.duration)} long!`)
                    .setTimestamp()
                    .setFooter({ text: 'Skyfall Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            // Update track start time to simulate seeking
            track.startTime = Date.now() - (seekTime * 1000);
            musicState.currentTrack = track;
            saveMusicState(guildId, musicState);

            // Create success embed
            const embed = new EmbedBuilder()
                .setColor('#57f287')
                .setTitle('⏯️ Seeked Successfully')
                .setDescription(`**[${track.title}](${track.url})**\n*by ${track.author}*`)
                .addFields(
                    {
                        name: '🎯 Seeked To',
                        value: formatTime(seekTime),
                        inline: true
                    },
                    {
                        name: '⏱️ Song Duration',
                        value: formatTime(track.duration),
                        inline: true
                    },
                    {
                        name: '📊 Progress',
                        value: createProgressBar(seekTime, track.duration),
                        inline: false
                    }
                )
                .setThumbnail(track.thumbnail || null)
                .setTimestamp()
                .setFooter({ text: 'Sapphire Music Bot' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Seek command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while seeking in the track.',
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

function parseTimeInput(input) {
    // Try parsing as mm:ss format
    if (input.includes(':')) {
        const parts = input.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0]);
            const seconds = parseInt(parts[1]);
            
            if (!isNaN(minutes) && !isNaN(seconds) && seconds < 60) {
                return (minutes * 60) + seconds;
            }
        }
    } else {
        // Try parsing as seconds
        const seconds = parseInt(input);
        if (!isNaN(seconds) && seconds >= 0) {
            return seconds;
        }
    }
    
    return null;
}

function formatTime(seconds) {
    if (!seconds || seconds === 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function createProgressBar(current, total, length = 20) {
    if (!total || total === 0) return '▬'.repeat(length);
    
    const progress = Math.min(current / total, 1);
    const filledLength = Math.floor(progress * length);
    const emptyLength = length - filledLength;
    
    return '▬'.repeat(filledLength) + '🔘' + '▬'.repeat(Math.max(0, emptyLength - 1));
}
