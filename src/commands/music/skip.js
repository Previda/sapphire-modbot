const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

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
                        .setTitle('❌ Nothing Playing')
                        .setDescription('There\'s no music currently playing!')
                        .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

            await interaction.client.distube.skip(interaction.guild.id);

            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle('⏭️ Song Skipped')
                    .setDescription('Skipped to the next song!')
                    .setFooter({ text: `Skipped by ${interaction.user.tag}` })
                    .setTimestamp()
                ]
            });

        } catch (error) {
            console.error('Skip command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Error')
                    .setDescription(`Failed to skip song: ${error.message}`)
                    .setTimestamp()
                ],
                ephemeral: true
            });
        }
    }
};
