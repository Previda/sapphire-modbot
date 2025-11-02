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
                    flags: 64
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
                    flags: 64
                });
            }

            const result = interaction.client.musicSystem.skip(interaction.guild.id);
            
            if (!result || result.error) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Nothing Playing')
                        .setDescription(result?.error || 'No music is currently playing!')
                        .setTimestamp()
                    ],
                    flags: 64
                });
            }

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
            const reply = {
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Error')
                    .setDescription(`Failed to skip song: ${error.message}`)
                    .setTimestamp()
                ],
                flags: 64
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }
};
