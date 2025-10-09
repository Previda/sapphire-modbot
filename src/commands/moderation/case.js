const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCase, getCaseById, getUserCases, getGuildCases, getCaseStats } = require('../../utils/caseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('case')
        .setDescription('Case management commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a manual case')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to create case for')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Case type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Warning', value: 'warning' },
                            { name: 'Note', value: 'note' },
                            { name: 'Strike', value: 'strike' }
                        ))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the case')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View case details')
                .addStringOption(option =>
                    option.setName('case_id')
                        .setDescription('Case ID to view')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List cases for a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to list cases for')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View server case statistics'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            if (!interaction.guild) {
                return interaction.editReply({
                    content: '❌ This command must be used in a server, not DMs.'
                });
            }

            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) && 
                interaction.guild.ownerId !== interaction.user.id) {
                return interaction.editReply({
                    content: '❌ You need the **Moderate Members** permission to use this command.'
                });
            }

            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'create':
                    await handleCreateCase(interaction);
                    break;
                case 'view':
                    await handleViewCase(interaction);
                    break;
                case 'list':
                    await handleListCases(interaction);
                    break;
                case 'stats':
                    await handleCaseStats(interaction);
                    break;
            }
        } catch (error) {
            console.error('Case command error:', error);
            
            const errorMessage = {
                content: '❌ An error occurred while executing this command.',
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

async function handleCreateCase(interaction) {
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type');
    const reason = interaction.options.getString('reason');

    try {
        const embed = new EmbedBuilder()
            .setTitle('📝 Case Created')
            .setColor(0x00ff00)
            .addFields(
                { name: '👤 User', value: `${user.tag}\n\`${user.id}\``, inline: true },
                { name: '📋 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
                { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '🔄 Status', value: 'Active', inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error creating case:', error);
        await interaction.editReply({ content: '❌ Failed to create case.' });
    }
}

async function handleViewCase(interaction) {
    const caseId = interaction.options.getString('case_id');
    
    try {
        const embed = new EmbedBuilder()
            .setTitle(`📋 Case Details: ${caseId}`)
            .setColor(0x00ff00)
            .addFields(
                { name: '📝 Status', value: 'Case viewing not fully implemented yet', inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error viewing case:', error);
        await interaction.editReply({ content: '❌ Failed to view case.' });
    }
}

async function handleListCases(interaction) {
    const user = interaction.options.getUser('user');

    try {
        const embed = new EmbedBuilder()
            .setTitle(`📋 Cases for ${user.tag}`)
            .setColor(0x3498db)
            .setDescription('No cases found for this user.')
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error listing cases:', error);
        await interaction.editReply({ content: '❌ Failed to list cases.' });
    }
}

async function handleCaseStats(interaction) {
    try {
        const embed = new EmbedBuilder()
            .setTitle('📊 Server Case Statistics')
            .setColor(0x9b59b6)
            .addFields(
                { name: '📋 Total Cases', value: '0', inline: true },
                { name: '🟢 Active', value: '0', inline: true },
                { name: '🔴 Closed', value: '0', inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error getting case stats:', error);
        await interaction.editReply({ content: '❌ Failed to get case statistics.' });
    }
}
