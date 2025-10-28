const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stage')
        .setDescription('Manage stage channels')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Start a stage instance')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Stage channel')
                        .addChannelTypes(ChannelType.GuildStageVoice)
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('topic')
                        .setDescription('Stage topic')
                        .setRequired(true)
                        .setMaxLength(120)))
        .addSubcommand(sub =>
            sub.setName('end')
                .setDescription('End a stage instance')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Stage channel')
                        .addChannelTypes(ChannelType.GuildStageVoice)
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');

        if (subcommand === 'start') {
            const topic = interaction.options.getString('topic');
            const sdk = interaction.client.discordSDK;

            if (!sdk) {
                return interaction.reply({
                    content: '❌ Discord SDK system is not initialized!',
                    ephemeral: true
                });
            }

            await sdk.createStageInstance(channel, topic, interaction);
        }

        if (subcommand === 'end') {
            try {
                const stageInstance = await channel.stageInstance;
                
                if (!stageInstance) {
                    return interaction.reply({
                        content: '❌ No active stage instance in this channel!',
                        ephemeral: true
                    });
                }

                await stageInstance.delete();

                await interaction.reply({
                    content: `✅ Stage instance ended in ${channel}`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('End stage error:', error);
                await interaction.reply({
                    content: '❌ Failed to end stage instance!',
                    ephemeral: true
                });
            }
        }
    }
};
