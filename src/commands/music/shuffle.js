const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the current music queue'),

    async execute(interaction) {
        try {
            // Check if music bot is enabled for this server
            if (!checkMusicPermissions(interaction)) {
                return;
            }

            const guildId = interaction.guild.id;
            
            // Get current music state
            let musicState = getMusicState(guildId);
            if (!musicState || !musicState.queue || musicState.queue.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ed4245')
                    .setTitle('🔀 Cannot Shuffle')
                    .setDescription('There are no songs in the queue to shuffle!')
                    .setTimestamp()
                    .setFooter({ text: 'Skyfall Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            if (musicState.queue.length < 2) {
                const embed = new EmbedBuilder()
                    .setColor('#ffa500')
                    .setTitle('🔀 Queue Too Small')
                    .setDescription('Need at least 2 songs in queue to shuffle!')
                    .setTimestamp()
                    .setFooter({ text: 'Skyfall Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            // Shuffle the queue using Fisher-Yates algorithm
            const originalLength = musicState.queue.length;
            for (let i = musicState.queue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [musicState.queue[i], musicState.queue[j]] = [musicState.queue[j], musicState.queue[i]];
            }

            // Save the shuffled state
            saveMusicState(guildId, musicState);

            // Create success embed
            const embed = new EmbedBuilder()
                .setColor('#57f287')
                .setTitle('🔀 Queue Shuffled')
                .setDescription(`Successfully shuffled **${originalLength}** songs in the queue!`)
                .addFields({
                    name: '🎵 Next Up',
                    value: musicState.queue.slice(0, 5).map((song, index) => 
                        `${index + 1}. **${song.title}** *by ${song.author}*`
                    ).join('\n') + (musicState.queue.length > 5 ? `\n*...and ${musicState.queue.length - 5} more*` : ''),
                    inline: false
                })
                .setTimestamp()
                .setFooter({ text: 'Sapphire Music Bot' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Shuffle command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while shuffling the queue.',
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
