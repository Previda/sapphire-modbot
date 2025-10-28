const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Create and manage scheduled events')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('Create a scheduled event')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Event name')
                        .setRequired(true)
                        .setMaxLength(100))
                .addStringOption(opt =>
                    opt.setName('description')
                        .setDescription('Event description')
                        .setRequired(true)
                        .setMaxLength(1000))
                .addStringOption(opt =>
                    opt.setName('start-time')
                        .setDescription('Start time (e.g., "2024-12-25 18:00")')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('duration')
                        .setDescription('Duration in hours')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('location')
                        .setDescription('Event location or link')
                        .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all scheduled events'))
        .addSubcommand(sub =>
            sub.setName('cancel')
                .setDescription('Cancel a scheduled event')
                .addStringOption(opt =>
                    opt.setName('event-id')
                        .setDescription('Event ID')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            const name = interaction.options.getString('name');
            const description = interaction.options.getString('description');
            const startTimeStr = interaction.options.getString('start-time');
            const durationHours = parseFloat(interaction.options.getString('duration'));
            const location = interaction.options.getString('location') || 'Discord';

            try {
                // Parse start time
                const startTime = new Date(startTimeStr);
                
                if (isNaN(startTime.getTime())) {
                    return interaction.reply({
                        content: '❌ Invalid start time format! Use: YYYY-MM-DD HH:MM',
                        ephemeral: true
                    });
                }

                if (startTime < Date.now()) {
                    return interaction.reply({
                        content: '❌ Start time must be in the future!',
                        ephemeral: true
                    });
                }

                const endTime = new Date(startTime.getTime() + (durationHours * 60 * 60 * 1000));

                const sdk = interaction.client.discordSDK;

                if (!sdk) {
                    return interaction.reply({
                        content: '❌ Discord SDK system is not initialized!',
                        ephemeral: true
                    });
                }

                await sdk.createScheduledEvent(
                    interaction.guild,
                    {
                        name,
                        description,
                        startTime,
                        endTime,
                        entityType: 3, // EXTERNAL
                        metadata: { location }
                    },
                    interaction
                );

            } catch (error) {
                console.error('Create event error:', error);
                await interaction.reply({
                    content: '❌ Failed to create event! Check your inputs.',
                    ephemeral: true
                });
            }
        }

        if (subcommand === 'list') {
            try {
                const events = await interaction.guild.scheduledEvents.fetch();

                if (events.size === 0) {
                    return interaction.reply({
                        content: '📭 No scheduled events in this server.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle('📅 Scheduled Events')
                    .setDescription(`${events.size} upcoming ${events.size === 1 ? 'event' : 'events'}`)
                    .setColor(0x5865F2)
                    .setTimestamp();

                events.forEach(event => {
                    const status = event.status === 1 ? '🟢 Scheduled' : 
                                  event.status === 2 ? '🔴 Active' : 
                                  event.status === 3 ? '⚫ Completed' : '⚪ Cancelled';

                    embed.addFields({
                        name: `${event.name} ${status}`,
                        value: `${event.description || 'No description'}\n` +
                               `Start: <t:${Math.floor(event.scheduledStartTimestamp / 1000)}:F>\n` +
                               `Interested: ${event.userCount || 0}\n` +
                               `ID: \`${event.id}\``
                    });
                });

                await interaction.reply({ embeds: [embed] });

            } catch (error) {
                console.error('List events error:', error);
                await interaction.reply({
                    content: '❌ Failed to fetch events!',
                    ephemeral: true
                });
            }
        }

        if (subcommand === 'cancel') {
            const eventId = interaction.options.getString('event-id');

            try {
                const event = await interaction.guild.scheduledEvents.fetch(eventId);

                if (!event) {
                    return interaction.reply({
                        content: '❌ Event not found!',
                        ephemeral: true
                    });
                }

                await event.delete();

                await interaction.reply({
                    content: `✅ Event "${event.name}" has been cancelled.`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Cancel event error:', error);
                await interaction.reply({
                    content: '❌ Failed to cancel event! Make sure the ID is correct.',
                    ephemeral: true
                });
            }
        }
    }
};
