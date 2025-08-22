const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('🪙 Flip a coin - heads or tails'),

    async execute(interaction) {
        const isHeads = Math.random() < 0.5;
        const result = isHeads ? 'Heads' : 'Tails';
        const emoji = isHeads ? '🟡' : '🔘';

        const embed = new EmbedBuilder()
            .setTitle('🪙 Coin Flip')
            .setColor(isHeads ? 0xffd700 : 0x708090)
            .addFields(
                { name: '🎯 Result', value: `${emoji} **${result}**`, inline: false }
            )
            .setFooter({ text: `Flipped by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
