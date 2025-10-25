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

            // Check bot permissions
            const permissions = voiceChannel.permissionsFor(interaction.client.user);
            if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Missing Permissions')
                        .setDescription('I need permissions to join and speak in your voice channel!')
                        .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

            // Check if music system is available
            if (!interaction.client.distube) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Music System Unavailable')
                        .setDescription('The music system is not initialized. Please contact an administrator.')
                        .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            // Play the song
            await interaction.client.distube.play(voiceChannel, query, {
                member: interaction.member,
                textChannel: interaction.channel,
                interaction
            });

            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('🔍 Searching...')
                    .setDescription(`Searching for: **${query}**`)
                    .setTimestamp()
                ]
            });

        } catch (error) {
            console.error('Play command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('❌ Error Playing Music')
                .setDescription(`An error occurred: ${error.message}`)
                .setTimestamp();
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};