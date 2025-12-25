/**
 * Clean Music System - Optimized for Raspberry Pi
 * Uses ytdl-core for YouTube playback
 * Handles all edge cases and errors gracefully
 */

const { 
    createAudioPlayer, 
    createAudioResource, 
    joinVoiceChannel, 
    AudioPlayerStatus, 
    VoiceConnectionStatus, 
    entersState 
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const { EmbedBuilder } = require('discord.js');
const { URL } = require('url');

class CleanMusicSystem {
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

            // Only accept YouTube URLs (search is broken due to YouTube API changes)
            let url;
            console.log('[Music] Processing:', query);

            if (query.includes('youtube.com') || query.includes('youtu.be')) {
                // Normalize common YouTube URL variants (playlists, radio, etc.)
                try {
                    const raw = query.startsWith('http') ? query : `https://${query}`;
                    const parsed = new URL(raw);

                    // Canonical watch URL with ?v=VIDEO_ID when available
                    if (parsed.hostname.includes('youtube.com')) {
                        const videoId = parsed.searchParams.get('v');
                        if (videoId) {
                            url = `https://www.youtube.com/watch?v=${videoId}`;
                        } else {
                            url = parsed.toString();
                        }
                    } else {
                        // youtu.be or other YouTube host
                        url = parsed.toString();
                    }
                } catch (e) {
                    // Fallback to raw query if parsing fails
                    console.warn('[Music] Failed to normalize URL, using raw query:', e.message);
                    url = query;
                }

                console.log('[Music] Using URL:', url);
            } else {
                return { 
                    error: '⚠️ **Music search is currently unavailable**\n\n' +
                           'YouTube has changed their API, breaking all search functionality.\n\n' +
                           '**Please use direct YouTube URLs:**\n' +
                           '1. Go to YouTube\n' +
                           '2. Find your song\n' +
                           '3. Copy the URL\n' +
                           '4. Use `/play <url>`\n\n' +
                           '**Example:**\n' +
                           '`/play https://www.youtube.com/watch?v=dQw4w9WgXcQ`'
                };
            }

            // Get video info and validate
            let videoInfo;
            try {
                console.log('[Music] Getting video info...');
                videoInfo = await ytdl.getBasicInfo(url);
                console.log('[Music] Video info retrieved:', videoInfo.videoDetails.title);
                
                // Check if video is playable
                if (videoInfo.videoDetails.isPrivate) {
                    return { error: '❌ **Video is Private**\n\nThis video cannot be played.' };
                }
                
                if (videoInfo.videoDetails.age_restricted) {
                    return { 
                        error: '❌ **Age-Restricted Video**\n\n' +
                               'This video requires age verification and cannot be played by the bot.\n\n' +
                               '**Try:**\n' +
                               '• A non-age-restricted version\n' +
                               '• A different video\n' +
                               '• Official uploads (usually not restricted)'
                    };
                }
                
                // Check if video has audio
                const hasAudio = videoInfo.formats.some(f => f.hasAudio);
                if (!hasAudio) {
                    return { error: '❌ **No Audio Available**\n\nThis video has no audio stream.' };
                }
                
                console.log('[Music] Video validation passed');
            } catch (error) {
                console.error('[Music] Failed to get video info:', error.message);
                return { 
                    error: '❌ **Failed to load video**\n\n' +
                           'Possible reasons:\n' +
                           '• Invalid URL\n' +
                           '• Private or deleted video\n' +
                           '• Age-restricted content\n' +
                           '• Region-locked video\n' +
                           '• Video unavailable\n\n' +
                           '**Try a different video!**'
                };
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

                // Handle disconnection
                connection.on(VoiceConnectionStatus.Disconnected, async () => {
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                        ]);
                    } catch (error) {
                        console.error('[Music] Connection lost:', error);
                        connection.destroy();
                        this.queues.delete(interaction.guild.id);
                    }
                });

                connection.on('error', error => {
                    console.error('[Music] Voice connection error:', error);
                });

                connection.subscribe(player);

                // Handle player events
                player.on(AudioPlayerStatus.Idle, () => {
                    console.log('[Music] Player idle, checking queue...');
                    queue.songs.shift();
                    if (queue.songs.length > 0) {
                        console.log('[Music] Playing next song...');
                        this.playSong(interaction.guild.id, queue.songs[0]).catch(console.error);
                    } else {
                        console.log('[Music] Queue empty, disconnecting in 60s...');
                        setTimeout(() => {
                            const currentQueue = this.queues.get(interaction.guild.id);
                            if (currentQueue && currentQueue.songs.length === 0) {
                                try {
                                    if (currentQueue.connection.state.status !== 'destroyed') {
                                        currentQueue.connection.destroy();
                                    }
                                } catch (e) {
                                    console.error('[Music] Cleanup error:', e.message);
                                }
                                this.queues.delete(interaction.guild.id);
                                console.log('[Music] Disconnected due to inactivity');
                            }
                        }, 60000);
                    }
                });

                player.on(AudioPlayerStatus.Playing, () => {
                    console.log('[Music] Player status: Playing');
                });

                player.on('error', error => {
                    console.error('[Music] Player error:', error);
                    console.error('[Music] Error details:', error.resource?.metadata);
                    
                    let errorMessage = 'An error occurred during playback.';
                    
                    // Check for specific errors
                    if (error.message.includes('403') || error.message.includes('Forbidden')) {
                        errorMessage = '**YouTube Access Blocked (403)**\n\n' +
                            'This video is restricted and cannot be played.\n\n' +
                            '**Try:**\n' +
                            '• A different video\n' +
                            '• Non-age-restricted content\n' +
                            '• Official uploads';
                    } else if (error.message.includes('Status code: 410')) {
                        errorMessage = '**Video Expired (410)**\n\nThe video link has expired. Try playing it again.';
                    } else if (error.message.includes('ECONNRESET') || error.message.includes('ETIMEDOUT')) {
                        errorMessage = '**Connection Error**\n\nNetwork issue while streaming. Check your internet connection.';
                    }
                    
                    queue.textChannel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(0xED4245)
                            .setTitle('❌ Playback Error')
                            .setDescription(errorMessage)
                            .setFooter({ text: error.message })
                            .setTimestamp()
                        ]
                    }).catch(console.error);
                    
                    // Skip to next song
                    if (queue.songs.length > 1) {
                        console.log('[Music] Auto-skipping due to player error...');
                        queue.songs.shift();
                        setTimeout(() => {
                            this.playSong(interaction.guild.id, queue.songs[0]).catch(console.error);
                        }, 2000);
                    }
                });

                this.playSong(interaction.guild.id, song).catch(console.error);
                return { nowPlaying: song };
            } else {
                // Add to queue
                queue.songs.push(song);
                return { addedToQueue: song, position: queue.songs.length };
            }
        } catch (error) {
            console.error('[Music] Play error:', error);
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

            // Add better options to avoid 403 errors
            const stream = ytdl(song.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25,
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9',
                    }
                }
            });

            // Handle stream errors
            stream.on('error', (error) => {
                console.error('[Music] Stream error:', error);
                if (error.statusCode === 403) {
                    queue.textChannel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(0xED4245)
                            .setTitle('❌ YouTube Access Blocked')
                            .setDescription(
                                '**YouTube is blocking this video (403 error)**\n\n' +
                                '**Possible reasons:**\n' +
                                '• Age-restricted video\n' +
                                '• Region-locked content\n' +
                                '• YouTube rate limiting\n' +
                                '• Video requires sign-in\n\n' +
                                '**Try:**\n' +
                                '• A different video\n' +
                                '• Wait a few minutes and try again\n' +
                                '• Use a non-restricted video'
                            )
                            .setTimestamp()
                        ]
                    }).catch(console.error);
                }
            });

            const resource = createAudioResource(stream, {
                inlineVolume: true
            });

            if (resource.volume) {
                resource.volume.setVolume(queue.volume / 100);
            }

            queue.player.play(resource);
            queue.playing = true;

            // Wait a moment to ensure stream is stable before announcing
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if player is still playing (not errored immediately)
            if (queue.player.state.status === AudioPlayerStatus.Playing || 
                queue.player.state.status === AudioPlayerStatus.Buffering) {
                
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
                console.log('[Music] Playback started successfully');
            } else {
                console.log('[Music] Playback failed immediately, not sending Now Playing message');
            }
        } catch (error) {
            console.error('[Music] Playback error:', error);
            
            let errorMessage = `Failed to play: ${error.message}`;
            
            // Specific error messages
            if (error.statusCode === 403 || error.message.includes('403')) {
                errorMessage = '**YouTube Access Blocked (403)**\n\n' +
                    'This video cannot be played due to YouTube restrictions.\n\n' +
                    '**Common causes:**\n' +
                    '• Age-restricted content\n' +
                    '• Region-locked video\n' +
                    '• Requires YouTube sign-in\n' +
                    '• Too many requests (rate limit)\n\n' +
                    '**Solution:** Try a different video or wait a few minutes.';
            } else if (error.message.includes('Video unavailable')) {
                errorMessage = '**Video Unavailable**\n\nThis video is private, deleted, or doesn\'t exist.';
            }
            
            queue.textChannel.send({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Playback Error')
                    .setDescription(errorMessage)
                    .setTimestamp()
                ]
            }).catch(console.error);
            
            // Skip to next song if available
            if (queue.songs.length > 1) {
                console.log('[Music] Skipping to next song due to error...');
                queue.songs.shift();
                setTimeout(() => {
                    this.playSong(guildId, queue.songs[0]).catch(console.error);
                }, 2000);
            }
        }
    }

    skip(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue) return { error: 'Nothing is playing!' };
        
        queue.player.stop();
        return { success: true };
    }

    stop(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue) return { error: 'Nothing is playing!' };
        
        queue.songs = [];
        queue.player.stop();
        
        try {
            if (queue.connection.state.status !== 'destroyed') {
                queue.connection.destroy();
            }
        } catch (e) {
            console.error('[Music] Stop error:', e.message);
        }
        
        this.queues.delete(guildId);
        return { success: true };
    }

    setVolume(guildId, volume) {
        const queue = this.queues.get(guildId);
        if (!queue) return { error: 'Nothing is playing!' };
        
        queue.volume = volume;
        return { success: true, volume };
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

module.exports = CleanMusicSystem;
