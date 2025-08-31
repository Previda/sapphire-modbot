const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear the music queue')
        .addBooleanOption(option =>
            option.setName('confirm')
                .setDescription('Confirm that you want to clear the entire queue')
                .setRequired(false)),

    async execute(interaction) {
        try {
            // Check if music bot is enabled for this server
            if (!checkMusicPermissions(interaction)) {
                return;
            }

            const confirm = interaction.options.getBoolean('confirm') ?? false;
            const guildId = interaction.guild.id;
            
            // Get current music state
            let musicState = getMusicState(guildId);
            if (!musicState || !musicState.queue || musicState.queue.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ffa500')
                    .setTitle('🗑️ Queue Already Empty')
                    .setDescription('There are no songs in the queue to clear!')
                    .setTimestamp()
                    .setFooter({ text: 'Sapphire Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            if (!confirm) {
                const embed = new EmbedBuilder()
                    .setColor('#ffa500')
                    .setTitle('⚠️ Confirm Queue Clear')
                    .setDescription(`This will remove **${musicState.queue.length}** songs from the queue.\n\nUse \`/clear confirm:True\` to confirm.`)
                    .addFields({
                        name: '🎵 Songs to be removed',
                        value: musicState.queue.slice(0, 5).map((song, index) => 
                            `${index + 1}. **${song.title}** *by ${song.author}*`
                        ).join('\n') + (musicState.queue.length > 5 ? `\n*...and ${musicState.queue.length - 5} more*` : ''),
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({ text: 'Sapphire Music Bot' });

                return await interaction.reply({ embeds: [embed] });
            }

            // Clear the queue
            const clearedCount = musicState.queue.length;
            musicState.queue = [];
            saveMusicState(guildId, musicState);

            // Create success embed
            const embed = new EmbedBuilder()
                .setColor('#57f287')
                .setTitle('🗑️ Queue Cleared')
                .setDescription(`Successfully cleared **${clearedCount}** songs from the queue!`)
                .addFields({
                    name: '📊 Queue Status',
                    value: '**0** songs remaining\nThe current song will continue playing.',
                    inline: false
                })
                .setTimestamp()
                .setFooter({ text: 'Sapphire Music Bot' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Clear command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while clearing the queue.',
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
