const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

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
                        .setTitle('❌ Nothing Playing')
                        .setDescription('There\'s no music currently playing!')],
                    ephemeral: true
                });
            }

            // Stop current player (this will trigger the 'idle' event)
            const player = connection.state.subscription?.player;
            if (player) {
                player.stop();
            }

            const skipEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('⏭️ Song Skipped')
                .setDescription('Skipped to the next song')
                .setFooter({ text: `Skipped by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [skipEmbed] });

        } catch (error) {
            console.error('❌ Skip command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Error')
                    .setDescription('Failed to skip song.')],
                ephemeral: true
            });
        }
    }
};
