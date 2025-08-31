const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Simple queue system (in production, use a database)
const musicQueues = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),

    async execute(interaction) {
        try {
            // Check music permissions
            const setupCommand = require('./setup-music.js');
            const permissionCheck = await setupCommand.checkMusicPermission(interaction);
            
            if (!permissionCheck.allowed) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('🚫 Access Denied')
                        .setDescription(permissionCheck.reason)],
                    ephemeral: true
                });
            }

            const guildQueue = musicQueues.get(interaction.guild.id);
            
            if (!guildQueue || guildQueue.length === 0) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('📋 Queue Empty')
                        .setDescription('The music queue is currently empty!')],
                    ephemeral: true
                });
            }

            const queueList = guildQueue.map((song, index) => 
                `${index + 1}. **${song.title}** - ${song.artist} [${song.duration}]`
            ).slice(0, 10); // Show max 10 songs

            const queueEmbed = new EmbedBuilder()
                .setColor(0x5865f2)
                .setTitle('📋 Music Queue')
                .setDescription(queueList.join('\n'))
                .setFooter({ 
                    text: `${guildQueue.length} song(s) in queue • Requested by ${interaction.user.tag}` 
                })
                .setTimestamp();

            if (guildQueue.length > 10) {
                queueEmbed.addFields({
                    name: '➕ More Songs',
                    value: `...and ${guildQueue.length - 10} more songs`,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [queueEmbed] });

        } catch (error) {
            console.error('❌ Queue command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Error')
                    .setDescription('Failed to display queue.')],
                ephemeral: true
            });
        }
    },

    // Helper functions for queue management
    addToQueue(guildId, song) {
        if (!musicQueues.has(guildId)) {
            musicQueues.set(guildId, []);
        }
        musicQueues.get(guildId).push(song);
    },

    getQueue(guildId) {
        return musicQueues.get(guildId) || [];
    },

    removeFromQueue(guildId) {
        const queue = musicQueues.get(guildId);
        if (queue && queue.length > 0) {
            return queue.shift();
        }
        return null;
    },

    clearQueue(guildId) {
        musicQueues.delete(guildId);
    }
};
