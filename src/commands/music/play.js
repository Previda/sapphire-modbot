const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const spotify = require('spotify-url-info');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube, Spotify, or direct URL')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name, URL, or Spotify link')
                .setRequired(true)),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Check music permissions
            const setupCommand = require('./setup-music.js');
            const permissionCheck = await setupCommand.checkMusicPermission(interaction);
            
            if (!permissionCheck.allowed) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('🚫 Access Denied')
                        .setDescription(permissionCheck.reason)]
                });
            }

            const query = interaction.options.getString('query');
            const voiceChannel = interaction.member.voice.channel;

            // Check if user is in a voice channel
            if (!voiceChannel) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('❌ Not in Voice Channel')
                        .setDescription('You need to be in a voice channel to play music!')]
                });
            }

            // Check bot permissions
            const permissions = voiceChannel.permissionsFor(interaction.client.user);
            if (!permissions.has('Connect') || !permissions.has('Speak')) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('❌ Missing Permissions')
                        .setDescription('I need permissions to join and speak in the voice channel!')]
                });
            }

            let songInfo;
            let songUrl;
            
            // Handle different input types
            if (query.includes('spotify.com')) {
                // Spotify URL
                try {
                    const spotifyInfo = await spotify.getPreview(query);
                    const searchQuery = `${spotifyInfo.artist} ${spotifyInfo.title}`;
                    const searchResults = await ytSearch(searchQuery);
                    
                    if (searchResults.videos.length === 0) {
                        throw new Error('No YouTube equivalent found');
                    }
                    
                    songUrl = searchResults.videos[0].url;
                    songInfo = {
                        title: spotifyInfo.title,
                        artist: spotifyInfo.artist,
                        duration: spotifyInfo.duration || 'Unknown',
                        thumbnail: spotifyInfo.image,
                        url: songUrl,
                        source: 'Spotify → YouTube'
                    };
                } catch (error) {
                    console.error('Spotify processing error:', error);
                    
                    // Fallback: extract track info from Spotify URL and search manually
                    try {
                        const urlParts = query.split('/');
                        const trackId = urlParts[urlParts.length - 1].split('?')[0];
                        
                        // Try generic search as fallback
                        return interaction.editReply({
                            embeds: [new EmbedBuilder()
                                .setColor(0xffa500)
                                .setTitle('🔄 Spotify Processing Failed')
                                .setDescription('Spotify link processing failed. Please copy the song name and use `/play <song name>` instead.\n\nOr try using a YouTube link directly.')]
                        });
                    } catch (fallbackError) {
                        return interaction.editReply({
                            embeds: [new EmbedBuilder()
                                .setColor(0xff0000)
                                .setTitle('❌ Spotify Error')
                                .setDescription('Could not process Spotify link. Please use YouTube links or search by song name instead.')]
                        });
                    }
                }
            } else if (ytdl.validateURL(query)) {
                // Direct YouTube URL
                try {
                    songUrl = query;
                    const info = await ytdl.getInfo(query);
                    songInfo = {
                        title: info.videoDetails.title,
                        artist: info.videoDetails.author.name,
                        duration: this.formatDuration(info.videoDetails.lengthSeconds),
                        thumbnail: info.videoDetails.thumbnails[0]?.url,
                        url: songUrl,
                        source: 'YouTube'
                    };
                } catch (error) {
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('❌ Invalid URL')
                            .setDescription('Could not process the YouTube URL. Please check the link.')]
                    });
                }
            } else {
                // Search query
                try {
                    const searchResults = await ytSearch(query);
                    
                    if (searchResults.videos.length === 0) {
                        return interaction.editReply({
                            embeds: [new EmbedBuilder()
                                .setColor(0xff0000)
                                .setTitle('❌ No Results')
                                .setDescription(`No songs found for: **${query}**`)]
                        });
                    }

                    const video = searchResults.videos[0];
                    songUrl = video.url;
                    songInfo = {
                        title: video.title,
                        artist: video.author.name,
                        duration: video.duration.timestamp,
                        thumbnail: video.thumbnail,
                        url: songUrl,
                        source: 'YouTube Search'
                    };
                } catch (error) {
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('❌ Search Error')
                            .setDescription('Failed to search for the song. Please try again.')]
                    });
                }
            }

            // Join voice channel
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            // Try multiple extraction methods for better reliability
            let stream;
            let resource;
            let player;
            
            try {
                // First attempt with basic options
                stream = ytdl(songUrl, { 
                    filter: 'audioonly',
                    quality: 'lowestaudio',
                    highWaterMark: 1 << 25
                });
                
                resource = createAudioResource(stream);
                player = createAudioPlayer();
                
            } catch (error1) {
                console.log('First stream attempt failed, trying alternative...');
                try {
                    // Second attempt with different options
                    stream = ytdl(songUrl, {
                        filter: 'audio',
                        quality: 'lowest',
                        requestOptions: {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                            }
                        }
                    });
                    
                    resource = createAudioResource(stream);
                    player = createAudioPlayer();
                    
                } catch (error2) {
                    console.log('All stream attempts failed, cleaning up connection...');
                    
                    // Clean up voice connection before showing error
                    try {
                        connection.destroy();
                    } catch (cleanupError) {
                        console.log('Connection cleanup error:', cleanupError.message);
                    }
                    
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('❌ Playback Error')
                            .setDescription('YouTube playback failed. Try:\n• A different song\n• Using `/play <song name>` instead of URLs\n• Songs that aren\'t age-restricted or region-locked')
                        ]
                    });
                }
            }

            // Play audio
            player.play(resource);
            connection.subscribe(player);

            // Success embed
            const playEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🎵 Now Playing')
                .setDescription(`**${songInfo.title}**`)
                .addFields(
                    { name: '👤 Artist', value: songInfo.artist, inline: true },
                    { name: '⏱️ Duration', value: songInfo.duration, inline: true },
                    { name: '🔗 Source', value: songInfo.source, inline: true }
                )
                .setThumbnail(songInfo.thumbnail)
                .setFooter({ text: `Requested by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [playEmbed] });

            // Handle player events with better error handling
            let isDestroyed = false;
            
            const safeDestroy = () => {
                if (!isDestroyed) {
                    try {
                        isDestroyed = true;
                        connection.destroy();
                    } catch (error) {
                        console.error('Connection already destroyed:', error.message);
                    }
                }
            };

            player.on(AudioPlayerStatus.Playing, () => {
                console.log(`🎵 Now playing: ${songInfo.title}`);
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log('🎵 Playback finished');
                safeDestroy();
            });

            player.on('error', (error) => {
                console.error('❌ Audio player error:', error.message);
                safeDestroy();
                
                // Try to send follow-up if interaction still exists
                try {
                    interaction.followUp({
                        embeds: [new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('❌ Playback Error')
                            .setDescription('YouTube playback failed. Try:\n• A different song\n• Using `/play <song name>` instead of URLs\n• Songs that aren\'t age-restricted or region-locked')]
                    }).catch(() => {
                        console.log('Could not send error follow-up - interaction expired');
                    });
                } catch (followUpError) {
                    console.error('Follow-up error:', followUpError.message);
                }
            });

            connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log('🎵 Disconnected from voice channel');
                safeDestroy();
            });

            // Timeout to prevent hanging connections
            setTimeout(() => {
                if (!isDestroyed) {
                    console.log('🎵 Connection timeout - cleaning up');
                    safeDestroy();
                }
            }, 600000); // 10 minutes timeout

        } catch (error) {
            console.error('❌ Play command error:', error);
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Error')
                    .setDescription('An unexpected error occurred while trying to play music.')]
            });
        }
    },

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};
