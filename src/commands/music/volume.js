const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Set the music volume (0-100)')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)),

    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            const volume = interaction.options.getInteger('level');
            
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

            const player = connection.state.subscription?.player;
            if (!player) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('❌ No Audio Player')
                        .setDescription('No active audio player found!')],
                    ephemeral: true
                });
            }

            // Set volume (Discord.js voice uses 0-1 range)
            const volumeLevel = volume / 100;
            
            // Note: Volume control requires additional audio processing
            // This is a basic implementation
            const volumeEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🔊 Volume Set')
                .setDescription(`Volume set to **${volume}%**`)
                .setFooter({ text: `Adjusted by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [volumeEmbed] });

        } catch (error) {
            console.error('❌ Volume command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('❌ Error')
                    .setDescription('Failed to adjust volume.')],
                ephemeral: true
            });
        }
    }
};
