const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a specific song from the queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Position of the song in queue to remove (1, 2, 3, etc.)')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        try {
            // Check if music bot is enabled for this server
            if (!checkMusicPermissions(interaction)) {
                return;
            }

            const position = interaction.options.getInteger('position');
            const guildId = interaction.guild.id;
            
            // Get current music state
            let musicState = getMusicState(guildId);
            if (!musicState || !musicState.queue || musicState.queue.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ed4245')
                    .setTitle('❌ Queue Empty')
                    .setDescription('There are no songs in the queue to remove!')
                    .setTimestamp()
                    .setFooter({ text: 'Skyfall Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            // Check if position is valid
            if (position > musicState.queue.length) {
                const embed = new EmbedBuilder()
                    .setColor('#ed4245')
                    .setTitle('❌ Invalid Position')
                    .setDescription(`Position **${position}** is invalid. Queue only has **${musicState.queue.length}** songs.`)
                    .addFields({
                        name: '💡 Tip',
                        value: `Use \`/queue\` to see all songs and their positions.`,
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({ text: 'Skyfall Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            // Remove the song (convert to 0-based index)
            const removedSong = musicState.queue.splice(position - 1, 1)[0];
            saveMusicState(guildId, musicState);

            // Create success embed
            const embed = new EmbedBuilder()
                .setColor('#57f287')
                .setTitle('🗑️ Song Removed')
                .setDescription(`**[${removedSong.title}](${removedSong.url})**\n*by ${removedSong.author}*`)
                .addFields(
                    {
                        name: '📍 Removed Position',
                        value: `**${position}** of ${musicState.queue.length + 1}`,
                        inline: true
                    },
                    {
                        name: '🎵 Remaining in Queue',
                        value: `**${musicState.queue.length}** songs`,
                        inline: true
                    }
                )
                .setThumbnail(removedSong.thumbnail || null)
                .setTimestamp()
                .setFooter({ text: 'Sapphire Music Bot' });

            // Show next few songs if queue isn't empty
            if (musicState.queue.length > 0) {
                const nextSongs = musicState.queue.slice(0, 5).map((song, index) => 
                    `${index + 1}. **${song.title}** *by ${song.author}*`
                ).join('\n');
                
                embed.addFields({
                    name: '🎶 Updated Queue',
                    value: nextSongs + (musicState.queue.length > 5 ? `\n*...and ${musicState.queue.length - 5} more*` : ''),
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Remove command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while removing the song.',
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
