const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create an interactive poll')
        .addStringOption(opt =>
            opt.setName('question')
                .setDescription('Poll question')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('options')
                .setDescription('Poll options (separate with |)')
                .setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('duration')
                .setDescription('Duration in minutes (default: 60)')
                .setMinValue(1)
                .setMaxValue(1440)),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const optionsStr = interaction.options.getString('options');
        const duration = interaction.options.getInteger('duration') || 60;

        const options = optionsStr.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);

        if (options.length < 2) {
            return interaction.reply({
                content: '❌ You need at least 2 options! Separate them with |',
                ephemeral: true
            });
        }

        if (options.length > 10) {
            return interaction.reply({
                content: '❌ Maximum 10 options allowed!',
                ephemeral: true
            });
        }

        const sdk = interaction.client.discordSDK;

        if (!sdk) {
            return interaction.reply({
                content: '❌ Discord SDK system is not initialized!',
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `✅ Creating poll that will run for ${duration} minutes...`,
            ephemeral: true
        });

        await sdk.createPoll(interaction.channel, question, options, duration);
    }
};
