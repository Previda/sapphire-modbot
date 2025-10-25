const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
const { EmbedBuilder } = require('discord.js');

class MusicSystem {
    constructor(client) {
        this.client = client;
        this.queues = new Map(); // guildId -> { songs: [], player: AudioPlayer, connection: VoiceConnection }
        
        console.log('🎵 Music system initialized (play-dl)');
    }

    setupEvents() {
        this.distube
            .on('playSong', (queue, song) => {
                const embed = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle('🎵 Now Playing')
                    .setDescription(`**[${song.name}](${song.url})**`)
                    .addFields(
                        { name: '⏱️ Duration', value: song.formattedDuration, inline: true },
                        { name: '👤 Requested by', value: song.user.toString(), inline: true },
                        { name: '📊 Queue', value: `${queue.songs.length} song(s)`, inline: true }
                    )
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: `Volume: ${queue.volume}%` })
                    .setTimestamp();

                queue.textChannel.send({ embeds: [embed] });
            })
            .on('addSong', (queue, song) => {
                const embed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('➕ Added to Queue')
                    .setDescription(`**[${song.name}](${song.url})**`)
                    .addFields(
                        { name: '⏱️ Duration', value: song.formattedDuration, inline: true },
                        { name: '👤 Requested by', value: song.user.toString(), inline: true },
                        { name: '📍 Position', value: `#${queue.songs.length}`, inline: true }
                    )
                    .setThumbnail(song.thumbnail)
                    .setTimestamp();

                queue.textChannel.send({ embeds: [embed] });
            })
            .on('addList', (queue, playlist) => {
                const embed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('📃 Playlist Added')
                    .setDescription(`**${playlist.name}**`)
                    .addFields(
                        { name: '🎵 Songs', value: `${playlist.songs.length}`, inline: true },
                        { name: '👤 Requested by', value: playlist.user.toString(), inline: true }
                    )
                    .setTimestamp();

                queue.textChannel.send({ embeds: [embed] });
            })
            .on('error', (channel, error) => {
                console.error('DisTube error:', error);
                if (channel) {
                    channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(0xED4245)
                            .setTitle('❌ Music Error')
                            .setDescription(`An error occurred: ${error.message}`)
                            .setTimestamp()
                        ]
                    });
                }
            })
            .on('empty', (queue) => {
                queue.textChannel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(0xFEE75C)
                        .setTitle('👋 Leaving Voice Channel')
                        .setDescription('Voice channel is empty. Leaving in 60 seconds...')
                        .setTimestamp()
                    ]
                });
            })
            .on('finish', (queue) => {
                queue.textChannel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(0x57F287)
                        .setTitle('✅ Queue Finished')
                        .setDescription('All songs have been played!')
                        .setTimestamp()
                    ]
                });
            })
            .on('disconnect', (queue) => {
                queue.textChannel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('👋 Disconnected')
                        .setDescription('Bot has been disconnected from the voice channel.')
                        .setTimestamp()
                    ]
                });
            });
    }

    getDistube() {
        return this.distube;
    }
}

module.exports = MusicSystem;
