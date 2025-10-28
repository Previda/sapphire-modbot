const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('activity')
        .setDescription('Start a Discord activity in voice channel')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Start an activity')
                .addStringOption(opt =>
                    opt.setName('type')
                        .setDescription('Activity type')
                        .setRequired(true)
                        .addChoices(
                            { name: '📺 YouTube Together', value: 'youtube' },
                            { name: '🃏 Poker Night', value: 'poker' },
                            { name: '🔪 Betrayal.io', value: 'betrayal' },
                            { name: '🎣 Fishington.io', value: 'fishing' },
                            { name: '♟️ Chess in the Park', value: 'chess' },
                            { name: '🎲 Checkers', value: 'checkers' },
                            { name: '🎨 Doodle Crew', value: 'doodlecrew' },
                            { name: '📝 Word Snack', value: 'wordsnack' },
                            { name: '✏️ Sketch Heads', value: 'sketchheads' },
                            { name: '🎴 Ocho', value: 'ocho' }
                        )))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all available activities'))
        .addSubcommand(sub =>
            sub.setName('active')
                .setDescription('Show active activities in this server')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'start') {
            const activityType = interaction.options.getString('type');
            const sdk = interaction.client.discordSDK;

            if (!sdk) {
                return interaction.reply({
                    content: '❌ Discord SDK system is not initialized!',
                    ephemeral: true
                });
            }

            await sdk.createActivity(interaction, activityType);
        }

        if (subcommand === 'list') {
            const embed = new EmbedBuilder()
                .setTitle('🎮 Available Discord Activities')
                .setDescription('Start any of these activities in a voice channel!')
                .addFields(
                    {
                        name: '📺 YouTube Together',
                        value: 'Watch YouTube videos together with friends',
                        inline: true
                    },
                    {
                        name: '🃏 Poker Night',
                        value: 'Play Texas Hold\'em poker',
                        inline: true
                    },
                    {
                        name: '🔪 Betrayal.io',
                        value: 'Among Us style social deduction game',
                        inline: true
                    },
                    {
                        name: '🎣 Fishington.io',
                        value: 'Relaxing fishing game',
                        inline: true
                    },
                    {
                        name: '♟️ Chess in the Park',
                        value: 'Play chess with friends',
                        inline: true
                    },
                    {
                        name: '🎲 Checkers in the Park',
                        value: 'Classic checkers game',
                        inline: true
                    },
                    {
                        name: '🎨 Doodle Crew',
                        value: 'Drawing and guessing game',
                        inline: true
                    },
                    {
                        name: '📝 Word Snack',
                        value: 'Word puzzle game',
                        inline: true
                    },
                    {
                        name: '✏️ Sketch Heads',
                        value: 'Fast-paced drawing game',
                        inline: true
                    },
                    {
                        name: '🎴 Ocho',
                        value: 'UNO-style card game',
                        inline: true
                    }
                )
                .setColor(0x5865F2)
                .setFooter({ text: 'Use /activity start <type> to begin!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'active') {
            const sdk = interaction.client.discordSDK;

            if (!sdk) {
                return interaction.reply({
                    content: '❌ Discord SDK system is not initialized!',
                    ephemeral: true
                });
            }

            const activities = sdk.getActiveActivities(interaction.guild.id);

            if (activities.length === 0) {
                return interaction.reply({
                    content: '📭 No active activities in this server.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🎮 Active Activities')
                .setDescription(`${activities.length} active ${activities.length === 1 ? 'activity' : 'activities'} in this server`)
                .setColor(0x5865F2)
                .setTimestamp();

            activities.forEach(activity => {
                const duration = Math.floor((Date.now() - activity.startedAt) / 1000 / 60);
                embed.addFields({
                    name: `${activity.name}`,
                    value: `Channel: ${activity.channelName}\nStarted by: <@${activity.startedBy}>\nDuration: ${duration} minutes\n[Join](${activity.inviteUrl})`
                });
            });

            await interaction.reply({ embeds: [embed] });
        }
    }
};
