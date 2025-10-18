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
        const caseData = await getCaseById(interaction.guild.id, caseId);
        
        if (!caseData) {
            return interaction.editReply({
                content: `❌ Case **${caseId}** not found.\n\nUse \`/case list @user\` to see all cases for a user.`
            });
        }
        
        // Fetch user and moderator
        let user, moderator;
        try {
            user = await interaction.client.users.fetch(caseData.userId);
        } catch (e) {
            user = { tag: 'Unknown User', id: caseData.userId };
        }
        
        try {
            moderator = await interaction.client.users.fetch(caseData.moderatorId);
        } catch (e) {
            moderator = { tag: 'Unknown Moderator', id: caseData.moderatorId };
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`📋 Case Details: ${caseId}`)
            .setColor(caseData.status === 'active' ? 0xff0000 : 0x808080)
            .addFields(
                { name: '👤 User', value: `${user.tag}\n\`${user.id}\``, inline: true },
                { name: '👮 Moderator', value: `${moderator.tag}\n\`${moderator.id}\``, inline: true },
                { name: '📋 Type', value: caseData.type.toUpperCase(), inline: true },
                { name: '🔄 Status', value: caseData.status === 'active' ? '🟢 Active' : '🔴 Closed', inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(new Date(caseData.timestamp).getTime() / 1000)}:F>`, inline: true },
                { name: '📝 Reason', value: caseData.reason || 'No reason provided', inline: false }
            )
            .setTimestamp();
        
        if (caseData.duration) {
            embed.addFields({ name: '⏱️ Duration', value: `${caseData.duration} minutes`, inline: true });
        }
        
        if (caseData.appealable) {
            embed.addFields({ name: '📋 Appealable', value: '✅ Yes', inline: true });
        }

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error viewing case:', error);
        await interaction.editReply({ content: `❌ Failed to view case: ${error.message}` });
    }
}

async function handleListCases(interaction) {
    const user = interaction.options.getUser('user');

    try {
        const cases = await getUserCases(interaction.guild.id, user.id);
        
        const embed = new EmbedBuilder()
            .setTitle(`📋 Cases for ${user.tag}`)
            .setColor(0x3498db)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        
        if (!cases || cases.length === 0) {
            embed.setDescription('✅ No cases found for this user.');
            return interaction.editReply({ embeds: [embed] });
        }
        
        // Group cases by type
        const casesByType = {};
        cases.forEach(c => {
            if (!casesByType[c.type]) casesByType[c.type] = [];
            casesByType[c.type].push(c);
        });
        
        // Add summary
        embed.setDescription(`**Total Cases:** ${cases.length}\n**Active:** ${cases.filter(c => c.status === 'active').length}`);
        
        // Add cases by type
        for (const [type, typeCases] of Object.entries(casesByType)) {
            const caseList = typeCases.slice(0, 5).map(c => {
                const status = c.status === 'active' ? '🟢' : '🔴';
                const date = new Date(c.timestamp).toLocaleDateString();
                return `${status} \`${c.caseId}\` - ${c.reason.substring(0, 50)}... (${date})`;
            }).join('\n');
            
            const fieldName = `${type.toUpperCase()} (${typeCases.length})`;
            embed.addFields({ name: fieldName, value: caseList || 'None', inline: false });
        }
        
        if (cases.length > 15) {
            embed.setFooter({ text: `Showing first 15 of ${cases.length} cases` });
        }

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error listing cases:', error);
        await interaction.editReply({ content: `❌ Failed to list cases: ${error.message}` });
    }
}

async function handleCaseStats(interaction) {
    try {
        const stats = await getCaseStats(interaction.guild.id);
        
        const embed = new EmbedBuilder()
            .setTitle('📊 Server Case Statistics')
            .setColor(0x9b59b6)
            .setDescription(`Statistics for **${interaction.guild.name}**`)
            .addFields(
                { name: '📋 Total Cases', value: stats.total?.toString() || '0', inline: true },
                { name: '🟢 Active', value: stats.active?.toString() || '0', inline: true },
                { name: '🔴 Closed', value: stats.closed?.toString() || '0', inline: true }
            )
            .setTimestamp();
        
        // Add breakdown by type
        if (stats.byType && Object.keys(stats.byType).length > 0) {
            const typeBreakdown = Object.entries(stats.byType)
                .map(([type, count]) => `**${type.toUpperCase()}:** ${count}`)
                .join('\n');
            embed.addFields({ name: '📊 By Type', value: typeBreakdown, inline: false });
        }

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error getting case stats:', error);
        await interaction.editReply({ content: `❌ Failed to get case statistics: ${error.message}` });
    }
}
