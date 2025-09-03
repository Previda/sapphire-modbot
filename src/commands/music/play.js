const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const spotify = require('spotify-url-info');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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
                        duration: module.exports.formatDuration(parseInt(info.videoDetails.lengthSeconds)),
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

            // Join voice channel undeafened so bot can hear users
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,  // Bot can hear users
                selfMute: false   // Bot can speak/play music
            });

            console.log('Voice channel joined successfully');
            
            // Create player and audio resource
            const player = createAudioPlayer();
            let resource; // Declare resource variable
            let audioCreated = false; // Track if audio was successfully created
            
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

            // Handle player events
            player.on('stateChange', (oldState, newState) => {
                console.log(`🎵 Player state: ${oldState.status} -> ${newState.status}`);
                
                if (newState.status === 'idle') {
                    console.log('🎵 Playback finished');
                    // Don't destroy connection here - let it stay for next song
                }
            });
            
            player.on('error', (error) => {
                console.error('❌ Audio player error:', error.message);
                
                // Try to restart with a different method
                console.log('🔄 Attempting recovery with different audio method...');
                
                // Try basic ytdl as recovery
                try {
                    const recoveryStream = ytdl(songUrl, {
                        filter: 'audioonly',
                        quality: 'lowestaudio',
                        highWaterMark: 1 << 25,
                        requestOptions: {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Raspbian Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36'
                            }
                        }
                    });
                    
                    const recoveryResource = createAudioResource(recoveryStream, {
                        inlineVolume: true,
                        inputType: 'arbitrary'
                    });
                    
                    player.play(recoveryResource);
                    console.log('🔄 Recovery attempt started - silent mode');
                    
                } catch (recoveryError) {
                    console.error('❌ Recovery failed:', recoveryError);
                    // Removed spam message - recovery handled silently
                }
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

            // Raspberry Pi multi-method audio extraction
            console.log('🔄 Starting Pi-optimized audio extraction...');
            
            // Method 1: Try yt-dlp command line (more reliable on Pi)
            
            try {
                console.log('🔄 Method 1: Trying yt-dlp extraction...');
                
                const tempDir = path.join(__dirname, '../../../temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                const audioFile = path.join(tempDir, `audio_${Date.now()}.webm`);
                
                await new Promise((resolve, reject) => {
                    const ytDlpCommand = `yt-dlp -f "bestaudio[ext=webm]" --no-playlist -o "${audioFile}" "${songUrl}"`;
                    
                    exec(ytDlpCommand, { timeout: 30000 }, (error, stdout, stderr) => {
                        if (error) {
                            console.log('yt-dlp failed:', error.message, error);
                            reject(error);
                        } else {
                            console.log('✅ yt-dlp extraction successful');
                            resolve();
                        }
                    });
                });
                
                if (fs.existsSync(audioFile)) {
                    resource = createAudioResource(audioFile, {
                        inlineVolume: true
                    });
                    
                    player.play(resource);
                    connection.subscribe(player);
                    
                    console.log('🎵 yt-dlp playback started successfully');
                    audioCreated = true;
                    
                    // Clean up file after playback
                    player.once(AudioPlayerStatus.Idle, () => {
                        try {
                            fs.unlinkSync(audioFile);
                            console.log('Temp audio file cleaned up');
                        } catch (cleanupError) {
                            console.log('Could not cleanup temp file:', cleanupError.message);
                        }
                    });
                }
                
            } catch (ytDlpError) {
                console.log('Method 1 (yt-dlp) full error:', ytDlpError);
                console.log('Method 1 (yt-dlp) failed:', ytDlpError.message);
            }
            
            // Method 2: ytdl-core SIMPLE approach (if yt-dlp failed)
            if (!audioCreated) {
                try {
                    console.log('🔄 Method 2: Trying SIMPLE ytdl-core...');
                    
                    const stream = ytdl(songUrl, {
                        filter: 'audioonly',
                        quality: 'highestaudio'
                    });
                    
                    resource = createAudioResource(stream, {
                        inlineVolume: true
                    });
                    
                    player.play(resource);
                    connection.subscribe(player);
                    
                    console.log('🎵 Simple ytdl-core playback started');
                    audioCreated = true;
                    
                } catch (ytdlError) {
                    console.log('Method 2 (ytdl-core) full error:', ytdlError);

                    console.log('Method 2 (ytdl-core) failed:', ytdlError.message, ytdlError);
                }
            }
            
            // Method 3: IMMEDIATE simple stream (skip file extraction)
            if (!audioCreated) {
                try {
                    console.log('🔄 Method 3: IMMEDIATE stream...');
                    
                    // Get stream immediately and play
                    const stream = ytdl(songUrl, {
                        filter: 'audioonly',
                        quality: 'lowestaudio'
                    });
                    
                    resource = createAudioResource(stream, {
                        inlineVolume: true
                    });
                    
                    player.play(resource);
                    connection.subscribe(player);
                    
                    console.log('🎵 IMMEDIATE stream playback started');
                    audioCreated = true;
                    
                } catch (basicError) {
                    console.log('Method 3 (immediate stream) full error:', basicError);
                    console.error('❌ All methods failed:', basicError.message);
                }
            }
            
            // If all methods failed
            if (!audioCreated) {
                console.error('❌ All audio extraction methods failed on Pi');
                safeDestroy();
                
                await interaction.followUp({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('❌ Pi Audio Extraction Failed')
                        .setDescription(`All audio extraction methods failed on Raspberry Pi.\n\n**Solutions:**\n• Install yt-dlp: \`sudo apt install yt-dlp\`\n• Try very popular songs\n• Use official music videos\n• Avoid region-locked content\n\n**Test command:** \`/play rick roll\``)]
                });
                return;
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
