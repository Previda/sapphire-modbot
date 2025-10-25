const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Set the music volume (0-200)')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-200, default is 100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(200)),

    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            const volume = interaction.options.getInteger('level');
            
            if (!voiceChannel) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Not in Voice Channel')
                        .setDescription('You need to be in a voice channel to use this command!')
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

            const result = interaction.client.musicSystem.setVolume(interaction.guild.id, volume);
            
            if (result.error) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Nothing Playing')
                        .setDescription(result.error)
                        .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

            const volumeEmbed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('🔊 Volume Adjusted')
                .setDescription(`Volume set to **${volume}%**`)
                .setFooter({ text: `Adjusted by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [volumeEmbed] });

        } catch (error) {
            console.error('Volume command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Error')
                    .setDescription(`Failed to adjust volume: ${error.message}`)
                    .setTimestamp()
                ],
                ephemeral: true
            });
        }
    }
};
