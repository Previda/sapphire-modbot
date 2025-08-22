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
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) && 
            interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({
                content: '❌ You need Moderate Members permission to use this command.',
                ephemeral: true
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
    }
};

async function handleCreateCase(interaction) {
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type');
    const reason = interaction.options.getString('reason');

    try {
        const newCase = await createCase({
            type: type,
            userId: user.id,
            moderatorId: interaction.user.id,
            guildId: interaction.guild.id,
            reason: reason,
            status: 'active',
            appealable: true
        });

        const embed = new EmbedBuilder()
            .setTitle('📝 Case Created')
            .setColor(0x00ff00)
            .addFields(
                { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                { name: '👤 User', value: `${user.tag}\n\`${user.id}\``, inline: true },
                { name: '📋 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
                { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '🔄 Status', value: 'Active', inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Send DM to user
        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle(`📝 ${type.charAt(0).toUpperCase() + type.slice(1)} Received`)
                .setColor(0xff9900)
                .addFields(
                    { name: '🏢 Server', value: interaction.guild.name, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '📋 Appeal', value: `Use \`/appeal submit case_id:${newCase.caseId}\` if you believe this is unfair`, inline: false }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log(`Could not DM user ${user.tag}: ${error.message}`);
        }

    } catch (error) {
        console.error('Error creating case:', error);
        await interaction.reply({
            content: '❌ Failed to create case.',
            ephemeral: true
        });
    }
}

async function handleViewCase(interaction) {
    const caseId = interaction.options.getString('case_id').toUpperCase();

    try {
        const caseData = await getCaseById(caseId, interaction.guild.id);

        if (!caseData) {
            return interaction.reply({
                content: `❌ Case \`${caseId}\` not found.`,
                ephemeral: true
            });
        }

        const user = await interaction.client.users.fetch(caseData.userId).catch(() => null);
        const moderator = await interaction.client.users.fetch(caseData.moderatorId).catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle(`📋 Case Details: ${caseId}`)
            .setColor(caseData.status === 'active' ? 0x00ff00 : 0x808080)
            .addFields(
                { name: '👤 User', value: user ? `${user.tag}\n\`${user.id}\`` : `\`${caseData.userId}\``, inline: true },
                { name: '👮 Moderator', value: moderator ? moderator.tag : `\`${caseData.moderatorId}\``, inline: true },
                { name: '📋 Type', value: caseData.type.charAt(0).toUpperCase() + caseData.type.slice(1), inline: true },
                { name: '🔄 Status', value: caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1), inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(new Date(caseData.createdAt).getTime() / 1000)}:F>`, inline: true },
                { name: '📊 Appealable', value: caseData.appealable ? '✅ Yes' : '❌ No', inline: true },
                { name: '📝 Reason', value: caseData.reason, inline: false }
            )
            .setTimestamp();

        if (caseData.appealed) {
            embed.addFields(
                { name: '📋 Appeal Status', value: '✅ Appealed', inline: true },
                { name: '📅 Appeal Date', value: `<t:${Math.floor(new Date(caseData.appealedAt).getTime() / 1000)}:F>`, inline: true },
                { name: '📝 Appeal Reason', value: caseData.appealReason || 'No reason provided', inline: false }
            );
        }

        if (caseData.notes && caseData.notes.length > 0) {
            const notes = caseData.notes.slice(-3).map(note => 
                `**${note.author}** (<t:${Math.floor(new Date(note.timestamp).getTime() / 1000)}:R>): ${note.content}`
            ).join('\n');
            embed.addFields({ name: '📝 Recent Notes', value: notes, inline: false });
        }

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error viewing case:', error);
        await interaction.reply({
            content: '❌ Failed to view case.',
            ephemeral: true
        });
    }
}

async function handleListCases(interaction) {
    const user = interaction.options.getUser('user');

    try {
        const cases = await getUserCases(user.id, interaction.guild.id);

        if (cases.length === 0) {
            return interaction.reply({
                content: `📋 No cases found for ${user.tag}.`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📋 Cases for ${user.tag}`)
            .setColor(0x3498db)
            .setDescription(`Found ${cases.length} case(s)`)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        // Show up to 10 most recent cases
        const recentCases = cases.slice(-10).reverse();
        
        for (const caseData of recentCases) {
            const statusEmoji = caseData.status === 'active' ? '🟢' : '🔴';
            const appealEmoji = caseData.appealed ? '📋' : '';
            
            embed.addFields({
                name: `${statusEmoji} ${caseData.caseId} ${appealEmoji}`,
                value: `**${caseData.type.charAt(0).toUpperCase() + caseData.type.slice(1)}** - ${caseData.reason}\n<t:${Math.floor(new Date(caseData.createdAt).getTime() / 1000)}:R>`,
                inline: true
            });
        }

        if (cases.length > 10) {
            embed.setFooter({ text: `Showing 10 most recent cases of ${cases.length} total` });
        }

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error listing cases:', error);
        await interaction.reply({
            content: '❌ Failed to list cases.',
            ephemeral: true
        });
    }
}

async function handleCaseStats(interaction) {
    try {
        const stats = await getCaseStats(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setTitle('📊 Server Case Statistics')
            .setColor(0x9b59b6)
            .addFields(
                { name: '📋 Total Cases', value: stats.total.toString(), inline: true },
                { name: '🟢 Active', value: stats.active.toString(), inline: true },
                { name: '🔴 Closed', value: stats.closed.toString(), inline: true },
                { name: '📋 Appealed', value: stats.appealed.toString(), inline: true }
            )
            .setTimestamp();

        // Add case types breakdown
        if (Object.keys(stats.types).length > 0) {
            const typesText = Object.entries(stats.types)
                .map(([type, count]) => `**${type.charAt(0).toUpperCase() + type.slice(1)}**: ${count}`)
                .join('\n');
            
            embed.addFields({ name: '📋 Case Types', value: typesText, inline: false });
        }

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error getting case stats:', error);
        await interaction.reply({
            content: '❌ Failed to get case statistics.',
            ephemeral: true
        });
    }
}
