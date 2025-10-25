const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),

    async execute(interaction) {
        try {
            if (!interaction.client.musicSystem) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Music System Unavailable')
                        .setDescription('The music system is not initialized.')
                        .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

            const queue = interaction.client.musicSystem.getQueue(interaction.guild.id);
            
            if (!queue || queue.songs.length === 0) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('📋 Queue Empty')
                        .setDescription('The music queue is currently empty!')
                        .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

            const currentSong = queue.songs[0];
            const upNext = queue.songs.slice(1, 11).map((song, index) => 
                `${index + 1}. **[${song.title}](${song.url})**\n   ⏱️ ${song.duration} | 👤 ${song.requestedBy}`
            );

            const queueEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('📋 Music Queue')
                .addFields(
                    { 
                        name: '🎵 Now Playing', 
                        value: `**[${currentSong.title}](${currentSong.url})**\n⏱️ ${currentSong.duration} | 👤 ${currentSong.requestedBy}`,
                        inline: false
                    }
                )
                .setThumbnail(currentSong.thumbnail)
                .setFooter({ 
                    text: `${queue.songs.length} song(s) in queue | Volume: ${queue.volume}%` 
                })
                .setTimestamp();

            if (upNext.length > 0) {
                queueEmbed.addFields({
                    name: '⏭️ Up Next',
                    value: upNext.join('\n\n'),
                    inline: false
                });
            }

            if (queue.songs.length > 11) {
                queueEmbed.addFields({
                    name: '➕ More Songs',
                    value: `...and ${queue.songs.length - 11} more song(s)`,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [queueEmbed] });

        } catch (error) {
            console.error('Queue command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Error')
                    .setDescription(`Failed to display queue: ${error.message}`)
                    .setTimestamp()
                ],
                ephemeral: true
            });
        }
    }
};
