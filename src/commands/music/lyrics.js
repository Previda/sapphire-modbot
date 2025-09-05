const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Get lyrics for the current song or search for lyrics')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Song to search lyrics for (leave empty for current song)')
                .setRequired(false)),

    async execute(interaction) {
        try {
            // Check if music bot is enabled for this server
            if (!checkMusicPermissions(interaction)) {
                return;
            }

            await interaction.deferReply();

            const songQuery = interaction.options.getString('song');
            const guildId = interaction.guild.id;
            
            let searchTitle = '';
            let searchArtist = '';

            if (!songQuery) {
                // Get current playing song
                const musicState = getMusicState(guildId);
                if (!musicState || !musicState.currentTrack) {
                    const embed = new EmbedBuilder()
                        .setColor('#ed4245')
                        .setTitle('🎵 No Song Playing')
                        .setDescription('No song is currently playing. Please specify a song to search for lyrics.')
                        .addFields({
                            name: '💡 Usage',
                            value: '`/lyrics song:Song Name - Artist Name`',
                            inline: false
                        })
                        .setTimestamp()
                        .setFooter({ text: 'Skyfall Music Bot' });

                    return await interaction.editReply({ embeds: [embed] });
                }

                searchTitle = musicState.currentTrack.title;
                searchArtist = musicState.currentTrack.author;
            } else {
                // Parse manual search
                if (songQuery.includes(' - ')) {
                    const parts = songQuery.split(' - ');
                    searchTitle = parts[0].trim();
                    searchArtist = parts[1].trim();
                } else {
                    searchTitle = songQuery.trim();
                    searchArtist = '';
                }
            }

            // Mock lyrics search (in production, use a lyrics API like Genius or Musixmatch)
            const lyrics = await searchLyrics(searchTitle, searchArtist);

            if (!lyrics.found) {
                const embed = new EmbedBuilder()
                    .setColor('#ffa500')
                    .setTitle('📝 Lyrics Not Found')
                    .setDescription(`Could not find lyrics for **${searchTitle}**${searchArtist ? ` by ${searchArtist}` : ''}`)
                    .addFields({
                        name: '💡 Tips',
                        value: '• Make sure the song title is spelled correctly\n• Try including the artist name: `/lyrics Song - Artist`\n• Some songs may not have lyrics available',
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({ text: 'Sapphire Music Bot' });

                return await interaction.editReply({ embeds: [embed] });
            }

            // Create lyrics embed
            const embed = new EmbedBuilder()
                .setColor('#5865f2')
                .setTitle('📝 Lyrics')
                .setDescription(`**${lyrics.title}**${lyrics.artist ? `\n*by ${lyrics.artist}*` : ''}`)
                .setTimestamp()
                .setFooter({ text: 'Sapphire Music Bot • Lyrics may be incomplete' });

            // Split lyrics into chunks if too long
            if (lyrics.content.length > 4000) {
                const chunks = splitLyrics(lyrics.content, 4000);
                embed.addFields({
                    name: '🎤 Lyrics (Part 1)',
                    value: chunks[0],
                    inline: false
                });

                await interaction.editReply({ embeds: [embed] });

                // Send additional parts as follow-ups
                for (let i = 1; i < chunks.length && i < 3; i++) {
                    const followUpEmbed = new EmbedBuilder()
                        .setColor('#5865f2')
                        .addFields({
                            name: `🎤 Lyrics (Part ${i + 1})`,
                            value: chunks[i],
                            inline: false
                        })
                        .setTimestamp()
                        .setFooter({ text: 'Skyfall Music Bot' });

                    await interaction.followUp({ embeds: [followUpEmbed] });
                }
            } else {
                embed.addFields({
                    name: '🎤 Lyrics',
                    value: lyrics.content,
                    inline: false
                });

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Lyrics command error:', error);
            await interaction.editReply({
                content: '❌ An error occurred while searching for lyrics.'
            });
        }
    }
};

function checkMusicPermissions(interaction) {
    const settingsPath = path.join(__dirname, '../../data/music-settings.json');
    
    if (!fs.existsSync(settingsPath)) {
        interaction.reply({
            content: '❌ Music bot is not configured for this server. Use `/setup-music` first.',
            ephemeral: true
        });
        return false;
    }

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const guildSettings = settings[interaction.guild.id];

    if (!guildSettings || !guildSettings.enabled) {
        interaction.reply({
            content: '❌ Music bot is disabled for this server. Ask an admin to enable it with `/setup-music`.',
            ephemeral: true
        });
        return false;
    }

    if (guildSettings.requiredRole) {
        const hasRole = interaction.member.roles.cache.has(guildSettings.requiredRole);
        if (!hasRole && !interaction.member.permissions.has('ADMINISTRATOR')) {
            const role = interaction.guild.roles.cache.get(guildSettings.requiredRole);
            interaction.reply({
                content: `❌ You need the **${role ? role.name : 'required'}** role to use music commands.`,
                ephemeral: true
            });
            return false;
        }
    }

    return true;
}

function getMusicState(guildId) {
    const statePath = path.join(__dirname, '../../data/music-state.json');
    
    if (!fs.existsSync(statePath)) {
        return null;
    }

    const states = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    return states[guildId] || null;
}

async function searchLyrics(title, artist) {
    // Mock lyrics search - in production, integrate with Genius API, Musixmatch, or similar
    // This is a placeholder that returns sample lyrics
    
    const mockLyrics = {
        "never gonna give you up": {
            title: "Never Gonna Give You Up",
            artist: "Rick Astley",
            content: `We're no strangers to love
You know the rules and so do I
A full commitment's what I'm thinking of
You wouldn't get this from any other guy

I just wanna tell you how I'm feeling
Gotta make you understand

Never gonna give you up
Never gonna let you down
Never gonna run around and desert you
Never gonna make you cry
Never gonna say goodbye
Never gonna tell a lie and hurt you`
        }
    };

    const searchKey = title.toLowerCase();
    
    if (mockLyrics[searchKey]) {
        return {
            found: true,
            title: mockLyrics[searchKey].title,
            artist: mockLyrics[searchKey].artist,
            content: mockLyrics[searchKey].content
        };
    }

    // Return sample lyrics for demonstration
    return {
        found: true,
        title: title,
        artist: artist,
        content: `[Verse 1]
Sample lyrics for demonstration
This would contain the actual song lyrics
Retrieved from a lyrics API service

[Chorus]
The actual implementation would use
Services like Genius, Musixmatch, or LyricFind
To fetch real lyrics for any song

[Verse 2]
For now, this shows the format
And layout of how lyrics would appear
In the Discord embed message

[Note: This is a placeholder. Real lyrics would be fetched from an API.]`
    };
}

function splitLyrics(lyrics, maxLength) {
    const chunks = [];
    const lines = lyrics.split('\n');
    let currentChunk = '';

    for (const line of lines) {
        if ((currentChunk + line + '\n').length > maxLength) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
        }
        currentChunk += line + '\n';
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}
