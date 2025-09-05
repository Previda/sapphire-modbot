const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the currently playing song')
        .addBooleanOption(option =>
            option.setName('detailed')
                .setDescription('Show detailed information including lyrics preview')
                .setRequired(false)),

    async execute(interaction) {
        try {
            // Check if music bot is enabled for this server
            if (!checkMusicPermissions(interaction)) {
                return;
            }

            const detailed = interaction.options.getBoolean('detailed') ?? false;
            const guildId = interaction.guild.id;
            
            // Get current music state
            const musicState = getMusicState(guildId);
            if (!musicState || !musicState.currentTrack) {
                const embed = new EmbedBuilder()
                    .setColor('#ed4245')
                    .setTitle('🎵 Nothing Playing')
                    .setDescription('No music is currently playing. Use `/play` to start playing music!')
                    .setTimestamp()
                    .setFooter({ text: 'Skyfall Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            const track = musicState.currentTrack;
            const progress = getTrackProgress(track);
            
            // Create main embed
            const embed = new EmbedBuilder()
                .setColor('#5865f2')
                .setTitle('🎵 Now Playing')
                .setDescription(`**[${track.title}](${track.url})**\n*by ${track.author}*`)
                .addFields(
                    { 
                        name: '⏱️ Duration', 
                        value: formatTime(track.duration), 
                        inline: true 
                    },
                    { 
                        name: '🔊 Volume', 
                        value: `${musicState.volume}%`, 
                        inline: true 
                    },
                    { 
                        name: '🔄 Loop', 
                        value: getLoopStatus(musicState.loop), 
                        inline: true 
                    },
                    { 
                        name: '📊 Progress', 
                        value: createProgressBar(progress.current, progress.total), 
                        inline: false 
                    }
                )
                .setThumbnail(track.thumbnail || null)
                .setTimestamp()
                .setFooter({ 
                    text: `Requested by ${track.requester} • Skyfall Music Bot`,
                    iconURL: track.requesterAvatar 
                });

            if (detailed && track.description) {
                embed.addFields({
                    name: '📝 Description',
                    value: track.description.length > 200 ? 
                        track.description.substring(0, 200) + '...' : 
                        track.description,
                    inline: false
                });
            }

            // Add queue info if there are upcoming songs
            if (musicState.queue && musicState.queue.length > 0) {
                const nextSongs = musicState.queue.slice(0, 3).map((song, index) => 
                    `${index + 1}. **${song.title}** *by ${song.author}*`
                ).join('\n');
                
                embed.addFields({
                    name: `🎶 Up Next (${musicState.queue.length} in queue)`,
                    value: nextSongs + (musicState.queue.length > 3 ? `\n*...and ${musicState.queue.length - 3} more*` : ''),
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Now playing command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while fetching current track information.',
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

function getTrackProgress(track) {
    const startTime = track.startTime || Date.now();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const total = track.duration || 0;
    
    return {
        current: Math.min(elapsed, total),
        total: total
    };
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

function getLoopStatus(loop) {
    switch (loop) {
        case 'track':
            return '🔂 Track';
        case 'queue':
            return '🔁 Queue';
        default:
            return '⏭️ Off';
    }
}

function createProgressBar(current, total, length = 20) {
    if (!total || total === 0) return '▬'.repeat(length) + ` 0:00 / 0:00`;
    
    const progress = Math.min(current / total, 1);
    const filledLength = Math.floor(progress * length);
    const emptyLength = length - filledLength;
    
    const bar = '▬'.repeat(filledLength) + '🔘' + '▬'.repeat(Math.max(0, emptyLength - 1));
    const currentTime = formatTime(current);
    const totalTime = formatTime(total);
    
    return `${bar} ${currentTime} / ${totalTime}`;
}
