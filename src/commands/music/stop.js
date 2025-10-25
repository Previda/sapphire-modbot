const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and clear the queue'),

    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            
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

            if (!interaction.client.distube) {
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

            const queue = interaction.client.distube.getQueue(interaction.guild.id);
            
            if (!queue) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Not Playing')
                        .setDescription('I\'m not currently playing any music!')
                        .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

            await interaction.client.distube.stop(interaction.guild.id);

            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle('⏹️ Music Stopped')
                    .setDescription('Stopped playback and cleared the queue!')
                    .setFooter({ text: `Stopped by ${interaction.user.tag}` })
                    .setTimestamp()
                ]
            });

        } catch (error) {
            console.error('Stop command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Error')
                    .setDescription(`Failed to stop music: ${error.message}`)
                    .setTimestamp()
                ],
                ephemeral: true
            });
        }
    }
};
