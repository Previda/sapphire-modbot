const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and disconnect from voice channel'),

    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            
            if (!voiceChannel) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('❌ Not in Voice Channel')
                        .setDescription('You need to be in a voice channel to use this command!')],
                    ephemeral: true
                });
            }

            const connection = getVoiceConnection(interaction.guild.id);
            
            if (!connection) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('❌ Not Playing')
                        .setDescription('I\'m not currently playing any music!')],
                    ephemeral: true
                });
            }

            connection.destroy();

            const stopEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('⏹️ Music Stopped')
                .setDescription('Disconnected from voice channel')
                .setFooter({ text: `Stopped by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [stopEmbed] });

        } catch (error) {
            console.error('❌ Stop command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Error')
                    .setDescription('Failed to stop music.')],
                ephemeral: true
            });
        }
    }
};
