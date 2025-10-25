const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube or Spotify')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name, YouTube URL, or Spotify URL')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect),

    async execute(interaction) {
        try {
            const query = interaction.options.getString('query');
            const voiceChannel = interaction.member.voice.channel;

            // Check if user is in a voice channel
            if (!voiceChannel) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Not in Voice Channel')
                        .setDescription('You need to be in a voice channel to play music!')
                        .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

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

            await interaction.deferReply();

            const result = await interaction.client.musicSystem.play(interaction, query);

            if (result.error) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Error')
                        .setDescription(result.error)
                        .setTimestamp()
                    ]
                });
            }

            if (result.nowPlaying) {
                const song = result.nowPlaying;
                await interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(0x57F287)
                        .setTitle('🎵 Now Playing')
                        .setDescription(`**[${song.title}](${song.url})**`)
                        .addFields(
                            { name: '⏱️ Duration', value: song.duration, inline: true },
                            { name: '👤 Requested by', value: song.requestedBy.toString(), inline: true }
                        )
                        .setThumbnail(song.thumbnail)
                        .setTimestamp()
                    ]
                });
            } else if (result.addedToQueue) {
                const song = result.addedToQueue;
                await interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(0x5865F2)
                        .setTitle('➕ Added to Queue')
                        .setDescription(`**[${song.title}](${song.url})**`)
                        .addFields(
                            { name: '⏱️ Duration', value: song.duration, inline: true },
                            { name: '👤 Requested by', value: song.requestedBy.toString(), inline: true },
                            { name: '📍 Position', value: `#${result.position}`, inline: true }
                        )
                        .setThumbnail(song.thumbnail)
                        .setTimestamp()
                    ]
                });
            }

        } catch (error) {
            console.error('Play command error:', error);
            const reply = {
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Error')
                    .setDescription(`An error occurred: ${error.message}`)
                    .setTimestamp()
                ],
                ephemeral: true
            };

            if (interaction.deferred) {
                await interaction.editReply(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }
};