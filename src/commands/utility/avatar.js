const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display a user\'s avatar')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to get avatar from')
                .setRequired(false)),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            
            const embed = new EmbedBuilder()
                .setTitle(`${user.username}'s Avatar`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setColor(0x00ff00)
                .addFields(
                    { name: '👤 User', value: `${user.tag}`, inline: true },
                    { name: '🆔 ID', value: `${user.id}`, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Avatar command error:', error);
            
            const errorMessage = {
                content: '❌ Failed to get user avatar.',
                ephemeral: true
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
};