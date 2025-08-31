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
                    
                    // Enhanced fallback: try to extract song info from URL patterns
                    try {
                        // Extract track info from Spotify URL structure
                        let fallbackQuery = query;
                        if (query.includes('track/')) {
                            const trackPart = query.split('track/')[1];
                            const trackId = trackPart.split('?')[0];
                            fallbackQuery = `spotify ${trackId}`;  // Basic fallback search
                        }
                        
                        // Try searching with fallback query
                        const fallbackResults = await ytSearch(fallbackQuery);
                        if (fallbackResults.videos.length > 0) {
                            const video = fallbackResults.videos[0];
                            songUrl = video.url;
                            songInfo = {
                                title: video.title,
                                artist: video.author.name,
                                duration: video.duration.timestamp,
                                thumbnail: video.thumbnail,
                                url: songUrl,
                                source: 'Spotify → YouTube (Fallback)'
                            };
                        } else {
                            throw new Error('No fallback results found');
                        }
                    } catch (fallbackError) {
                        return interaction.editReply({
                            embeds: [new EmbedBuilder()
                                .setColor(0xffa500)
                                .setTitle('🔄 Spotify Link Processing')
                                .setDescription('Spotify link processing failed. Please:\n• Copy the song name manually and search with `/play <song name>`\n• Use a YouTube link instead\n• Make sure the Spotify link is public and accessible')]
                        });
                    }
                }
            } else if (ytdl.validateURL(query) || query.includes('youtube.com') || query.includes('youtu.be')) {
                // Direct YouTube URL
                try {
                    songUrl = query;
                    const info = await ytdl.getInfo(query);
                    songInfo = {
                        title: info.videoDetails.title,
                        artist: info.videoDetails.author.name,
                        duration: this.formatDuration(parseInt(info.videoDetails.lengthSeconds)),
                        thumbnail: info.videoDetails.thumbnails[0]?.url,
                        url: songUrl,
                        source: 'YouTube'
                    };
                } catch (error) {
                    console.error('YouTube URL processing error:', error);
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('❌ YouTube URL Error')
                            .setDescription('Could not process the YouTube URL. Please check if:\n• The video exists and is public\n• The video is not age-restricted\n• The video is available in your region')]
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

            console.log('🔄 Joining voice channel...');

            // Join voice channel with server mute
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: true,  // Server mute - bot can't hear users but can still play
                selfMute: false  // Bot can speak/play music
            });

            console.log('Voice channel joined successfully');
            
            // Create player and audio resource
            const player = createAudioPlayer();
            
            // Connection cleanup handler
            let isDestroyed = false;
            const safeDestroy = () => {
                if (!isDestroyed) {
                    try {
                        isDestroyed = true;
                        connection.destroy();
                        console.log('Connection safely destroyed');
                    } catch (error) {
                        console.log('Connection cleanup error:', error.message);
                    }
                }
            };

            // Set up player event handlers
            player.on(AudioPlayerStatus.Playing, () => {
                console.log(`🎵 Now playing: ${songInfo.title}`);
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log('🎵 Playbook finished');
                safeDestroy();
            });

            player.on('error', (error) => {
                console.error('❌ Audio player error:', error.message);
                safeDestroy();
                
                interaction.followUp({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('❌ Playback Error')
                        .setDescription('Audio playback failed during stream. Try a different song.')]
                }).catch(() => console.log('Could not send error follow-up'));
            });

            // Connection event handlers
            connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log('🎵 Voice connection disconnected');
                safeDestroy();
            });

            // Show "Now Playing" embed immediately
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

            // Raspberry Pi optimized stream creation
            console.log('🔄 Creating audio stream for Raspberry Pi...');
            
            try {
                // Use simple, Pi-friendly ytdl options
                const stream = ytdl(songUrl, {
                    filter: 'audioonly',
                    quality: 'lowestaudio',
                    highWaterMark: 1 << 20, // Smaller buffer for Pi
                    dlChunkSize: 0, // Let ytdl handle chunk size
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36'
                        }
                    }
                });
                
                // Create resource with Pi-friendly options
                resource = createAudioResource(stream, {
                    inlineVolume: true,
                    inputType: 'arbitrary'
                });
                
                console.log('✅ Audio resource created for Pi');
                
                // Start playback
                player.play(resource);
                connection.subscribe(player);
                
                console.log('🎵 Playback started on Raspberry Pi');
                
            } catch (error) {
                console.error('❌ Pi stream creation failed:', error);
                
                // Try alternative approach for Pi
                try {
                    console.log('🔄 Trying alternative Pi stream method...');
                    
                    // Very basic stream for Pi compatibility
                    const stream = ytdl(songUrl, {
                        filter: 'audio',
                        quality: 'lowest'
                    });
                    
                    resource = createAudioResource(stream);
                    player.play(resource);
                    connection.subscribe(player);
                    
                    console.log('✅ Alternative Pi stream working');
                    
                } catch (altError) {
                    console.error('❌ All Pi stream methods failed:', altError);
                    safeDestroy();
                    
                    await interaction.followUp({
                        embeds: [new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('❌ Raspberry Pi Stream Failed')
                            .setDescription(`YouTube extraction failed on Pi.\n\n**Error:** ${altError.message}\n\n**Solutions:**\n• Try popular songs from major artists\n• Use song names instead of URLs\n• Avoid region-locked content\n• Try \`/play never gonna give you up\` as a test`)]
                    });
                    return;
                }
            }

            // Timeout to prevent hanging connections (10 minutes)
            setTimeout(() => {
                if (!isDestroyed) {
                    console.log('🎵 Connection timeout - cleaning up after 10 minutes');
                    safeDestroy();
                }
            }, 600000);

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
