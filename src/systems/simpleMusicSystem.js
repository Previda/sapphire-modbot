const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
const { EmbedBuilder } = require('discord.js');

class SimpleMusicSystem {
    constructor(client) {
        this.client = client;
        this.queues = new Map(); // guildId -> { songs: [], player: AudioPlayer, connection: VoiceConnection, textChannel, volume }
    }

    getQueue(guildId) {
        return this.queues.get(guildId);
    }

    async play(interaction, query) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) {
                return { error: 'You need to be in a voice channel!' };
            }

            // Search for song
            let songInfo;
            try {
                console.log('[Music] Searching for:', query);
                
                // Check if it's a URL
                if (play.yt_validate(query) === 'video') {
                    songInfo = await play.video_info(query);
                } else {
                    // Search YouTube
                    const searched = await play.search(query, { limit: 1 });
                    if (!searched || searched.length === 0) {
                        throw new Error('No results found');
                    }
                    songInfo = searched[0];
                }
                
                console.log('[Music] Found:', songInfo?.video_details?.title || songInfo?.title || 'Unknown');
            } catch (error) {
                console.error('[Music] Search error:', error.message);
                return { error: `Failed to find song: ${error.message}` };
            }

            // Handle different response formats
            let song;
            if (songInfo.video_details) {
                // play-dl video_info format
                song = {
                    title: songInfo.video_details.title || 'Unknown Title',
                    url: songInfo.video_details.url || query,
                    duration: this.formatDuration(songInfo.video_details.durationInSec || 0),
                    thumbnail: songInfo.video_details.thumbnails?.[0]?.url || null,
                    requestedBy: interaction.user
                };
            } else {
                // play-dl search format
                song = {
                    title: songInfo.title || 'Unknown Title',
                    url: songInfo.url || query,
                    duration: this.formatDuration(songInfo.durationInSec || 0),
                    thumbnail: songInfo.thumbnails?.[0]?.url || null,
                    requestedBy: interaction.user
                };
            }

            if (!song.title || song.title === 'Unknown Title') {
                console.error('[Music] Invalid song data:', songInfo);
                return { error: 'Failed to retrieve song information' };
            }

        let queue = this.queues.get(interaction.guild.id);

        if (!queue) {
            // Create new queue
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();

            queue = {
                songs: [song],
                player: player,
                connection: connection,
                textChannel: interaction.channel,
                volume: 100,
                playing: false
            };

            this.queues.set(interaction.guild.id, queue);

            // Handle connection errors
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                    ]);
                } catch (error) {
                    console.error('Connection lost:', error);
                    connection.destroy();
                    this.queues.delete(interaction.guild.id);
                }
            });

            connection.on('error', error => {
                console.error('Voice connection error:', error);
            });

            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                queue.songs.shift();
                if (queue.songs.length > 0) {
                    this.playSong(interaction.guild.id, queue.songs[0]).catch(err => {
                        console.error('Auto-play error:', err);
                    });
                } else {
                    setTimeout(() => {
                        const currentQueue = this.queues.get(interaction.guild.id);
                        if (currentQueue && currentQueue.songs.length === 0) {
                            try {
                                if (currentQueue.connection.state.status !== 'destroyed') {
                                    currentQueue.connection.destroy();
                                }
                            } catch (e) {
                                console.error('Connection cleanup error:', e.message);
                            }
                            this.queues.delete(interaction.guild.id);
                        }
                    }, 60000); // Leave after 60 seconds if no songs
                }
            });

            player.on('error', error => {
                console.error('Player error:', error);
                queue.textChannel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Playback Error')
                        .setDescription('An error occurred during playback')
                        .setTimestamp()
                    ]
                });
            });

            this.playSong(interaction.guild.id, song).catch(err => {
                console.error('Play song error:', err);
            });
            return { nowPlaying: song };
        } else {
            // Add to queue
            queue.songs.push(song);
            return { addedToQueue: song, position: queue.songs.length };
        }
        } catch (error) {
            console.error('Play command error:', error);
            return { error: 'An unexpected error occurred!' };
        }
    }

    async playSong(guildId, song) {
        const queue = this.queues.get(guildId);
        if (!queue) return;

        try {
            const stream = await play.stream(song.url);

            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
                inlineVolume: true
            });
            queue.player.play(resource);
            queue.playing = true;

            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('🎵 Now Playing')
                .setDescription(`**[${song.title}](${song.url})**`)
                .addFields(
                    { name: '⏱️ Duration', value: song.duration, inline: true },
                    { name: '👤 Requested by', value: song.requestedBy.toString(), inline: true },
                    { name: '🔊 Volume', value: `${queue.volume}%`, inline: true }
                )
                .setThumbnail(song.thumbnail)
                .setTimestamp();

            queue.textChannel.send({ embeds: [embed] }).catch(err => console.error('Send embed error:', err));
        } catch (error) {
            console.error('Play error:', error);
            try {
                queue.textChannel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Playback Error')
                        .setDescription('Failed to play song')
                        .setTimestamp()
                    ]
                }).catch(err => console.error('Error sending error message:', err));
            } catch (e) {
                console.error('Critical error in playSong:', e);
            }
        }
    }

    skip(guildId) {
        try {
            const queue = this.queues.get(guildId);
            if (!queue) return { error: 'Nothing playing!' };
            
            queue.player.stop();
            return { success: true };
        } catch (error) {
            console.error('Skip error:', error);
            return { error: 'Failed to skip song!' };
        }
    }

    stop(guildId) {
        try {
            const queue = this.queues.get(guildId);
            if (!queue) return { error: 'Nothing playing!' };
            
            queue.songs = [];
            queue.player.stop();
            
            try {
                if (queue.connection.state.status !== 'destroyed') {
                    queue.connection.destroy();
                }
            } catch (e) {
                console.error('Connection destroy error:', e.message);
            }
            
            this.queues.delete(guildId);
            return { success: true };
        } catch (error) {
            console.error('Stop error:', error);
            // Try to clean up anyway
            this.queues.delete(guildId);
            return { error: 'Stopped with errors' };
        }
    }

    setVolume(guildId, volume) {
        try {
            const queue = this.queues.get(guildId);
            if (!queue) return { error: 'Nothing playing!' };
            
            queue.volume = volume;
            return { success: true, volume };
        } catch (error) {
            console.error('Volume error:', error);
            return { error: 'Failed to set volume!' };
        }
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

module.exports = SimpleMusicSystem;
