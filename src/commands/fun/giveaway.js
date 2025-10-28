const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Create a giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(opt =>
            opt.setName('prize')
                .setDescription('Giveaway prize')
                .setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10080)) // Max 1 week
        .addIntegerOption(opt =>
            opt.setName('winners')
                .setDescription('Number of winners (default: 1)')
                .setMinValue(1)
                .setMaxValue(20)),

    async execute(interaction) {
        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getInteger('duration');
        const winnerCount = interaction.options.getInteger('winners') || 1;

        const sdk = interaction.client.discordSDK;

        if (!sdk) {
            return interaction.reply({
                content: '❌ Discord SDK system is not initialized!',
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `✅ Creating giveaway for **${prize}** (${duration} minutes, ${winnerCount} ${winnerCount === 1 ? 'winner' : 'winners'})...`,
            ephemeral: true
        });

        await sdk.createGiveaway(interaction.channel, prize, duration, winnerCount);
    }
};
