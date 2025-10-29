const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const ytsr = require('ytsr');
const { EmbedBuilder } = require('discord.js');

class YtdlMusicSystem {
    constructor(client) {
        this.client = client;
        this.queues = new Map();
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
            let url;
            try {
                console.log('[Music] Searching for:', query);
                
                // Check if it's already a URL
                if (query.includes('youtube.com') || query.includes('youtu.be')) {
                    url = query;
                } else {
                    // Search YouTube
                    const searchResults = await ytsr(query, { limit: 1 });
                    if (!searchResults || !searchResults.items || searchResults.items.length === 0) {
                        throw new Error('No results found');
                    }
                    
                    const video = searchResults.items.find(item => item.type === 'video');
                    if (!video) {
                        throw new Error('No video results found');
                    }
                    
                    url = video.url;
                }
                
                console.log('[Music] Found URL:', url);
            } catch (error) {
                console.error('[Music] Search error:', error.message);
                return { error: `Failed to find song: ${error.message}` };
            }

            // Get video info
            let videoInfo;
            try {
                videoInfo = await ytdl.getInfo(url);
            } catch (error) {
                console.error('[Music] Failed to get video info:', error.message);
                return { error: 'Failed to get video information' };
            }

            const song = {
                title: videoInfo.videoDetails.title,
                url: videoInfo.videoDetails.video_url,
                duration: this.formatDuration(parseInt(videoInfo.videoDetails.lengthSeconds)),
                thumbnail: videoInfo.videoDetails.thumbnails[0]?.url,
                requestedBy: interaction.user
            };

            let queue = this.queues.get(interaction.guild.id);

            if (!queue) {
                // Create new queue
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false
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
                    console.log('[Music] Player went idle');
                    queue.songs.shift();
                    if (queue.songs.length > 0) {
                        this.playSong(interaction.guild.id, queue.songs[0]).catch(console.error);
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
                        }, 60000);
                    }
                });

                player.on(AudioPlayerStatus.Playing, () => {
                    console.log('[Music] Player status: Playing');
                });

                player.on('error', error => {
                    console.error('[Music] Player error:', error);
                    queue.textChannel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(0xED4245)
                            .setTitle('❌ Playback Error')
                            .setDescription(`An error occurred: ${error.message}`)
                            .setTimestamp()
                        ]
                    });
                });

                this.playSong(interaction.guild.id, song).catch(console.error);
                return { nowPlaying: song };
            } else {
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
        if (!queue) {
            console.error('[Music] Queue not found');
            return;
        }

        try {
            console.log('[Music] Streaming:', song.url);

            const stream = ytdl(song.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            });

            const resource = createAudioResource(stream, {
                inlineVolume: true
            });

            if (resource.volume) {
                resource.volume.setVolume(queue.volume / 100);
            }

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

            queue.textChannel.send({ embeds: [embed] }).catch(console.error);
            console.log('[Music] Playback started');
        } catch (error) {
            console.error('[Music] Playback error:', error);
            queue.textChannel.send({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Playback Error')
                    .setDescription(`Failed to play: ${error.message}`)
                    .setTimestamp()
                ]
            });
        }
    }

    skip(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue) return false;
        
        queue.player.stop();
        return true;
    }

    stop(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue) return false;
        
        queue.songs = [];
        queue.player.stop();
        
        try {
            if (queue.connection.state.status !== 'destroyed') {
                queue.connection.destroy();
            }
        } catch (e) {
            console.error('Stop error:', e.message);
        }
        
        this.queues.delete(guildId);
        return true;
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

module.exports = YtdlMusicSystem;
