const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsr = require('youtube-sr').default;
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
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return { error: 'You need to be in a voice channel!' };
        }

        // Search for song
        let songInfo;
        try {
            if (ytdl.validateURL(query)) {
                songInfo = await ytdl.getInfo(query);
            } else {
                const results = await ytsr.search(query, { limit: 1 });
                if (!results || results.length === 0) {
                    return { error: 'No results found!' };
                }
                songInfo = await ytdl.getInfo(results[0].url);
            }
        } catch (error) {
            console.error('Search error:', error);
            return { error: 'Failed to find song!' };
        }

        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
            duration: this.formatDuration(parseInt(songInfo.videoDetails.lengthSeconds)),
            thumbnail: songInfo.videoDetails.thumbnails[0]?.url,
            requestedBy: interaction.user
        };

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

            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                queue.songs.shift();
                if (queue.songs.length > 0) {
                    this.playSong(interaction.guild.id, queue.songs[0]);
                } else {
                    setTimeout(() => {
                        if (queue.songs.length === 0) {
                            connection.destroy();
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

            this.playSong(interaction.guild.id, song);
            return { nowPlaying: song };
        } else {
            // Add to queue
            queue.songs.push(song);
            return { addedToQueue: song, position: queue.songs.length };
        }
    }

    async playSong(guildId, song) {
        const queue = this.queues.get(guildId);
        if (!queue) return;

        try {
            const stream = ytdl(song.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            });

            const resource = createAudioResource(stream);
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

            queue.textChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Play error:', error);
            queue.textChannel.send({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Playback Error')
                    .setDescription('Failed to play song')
                    .setTimestamp()
                ]
            });
        }
    }

    skip(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue) return { error: 'Nothing playing!' };
        
        queue.player.stop();
        return { success: true };
    }

    stop(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue) return { error: 'Nothing playing!' };
        
        queue.songs = [];
        queue.player.stop();
        queue.connection.destroy();
        this.queues.delete(guildId);
        return { success: true };
    }

    setVolume(guildId, volume) {
        const queue = this.queues.get(guildId);
        if (!queue) return { error: 'Nothing playing!' };
        
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

module.exports = SimpleMusicSystem;
