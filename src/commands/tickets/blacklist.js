const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadGuildConfig, saveGuildConfig } = require('../../utils/configManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Manage ticket blacklist - block/unblock users from creating tickets')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Block a user from creating tickets')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to blacklist from tickets')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for blacklisting')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Unblock a user from creating tickets')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to remove from blacklist')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('View all blacklisted users'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check if a user is blacklisted')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to check blacklist status')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply();

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild) && 
            interaction.guild.ownerId !== interaction.user.id) {
            return interaction.editReply({
                content: '❌ You need the **Manage Server** permission to manage ticket blacklist.'
            });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await handleBlacklistAdd(interaction);
                break;
            case 'remove':
                await handleBlacklistRemove(interaction);
                break;
            case 'list':
                await handleBlacklistList(interaction);
                break;
            case 'check':
                await handleBlacklistCheck(interaction);
                break;
        }
    }
};

async function handleBlacklistAdd(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
        const config = await loadGuildConfig(interaction.guild.id);
        config.tickets = config.tickets || {};
        config.tickets.blacklist = config.tickets.blacklist || [];

        // Check if user is already blacklisted
        const existingEntry = config.tickets.blacklist.find(entry => entry.userId === user.id);
        if (existingEntry) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0xffa500)
                    .setTitle('⚠️ Already Blacklisted')
                    .setDescription(`${user.tag} is already blacklisted from creating tickets.`)
                    .addFields(
                        { name: '📝 Current Reason', value: existingEntry.reason, inline: false },
                        { name: '📅 Blacklisted On', value: `<t:${Math.floor(new Date(existingEntry.timestamp).getTime() / 1000)}:F>`, inline: true },
                        { name: '👮 Blacklisted By', value: `<@${existingEntry.moderatorId}>`, inline: true }
                    )]
            });
        }

        // Add user to blacklist
        const blacklistEntry = {
            userId: user.id,
            username: user.tag,
            reason: reason,
            moderatorId: interaction.user.id,
            moderatorName: interaction.user.tag,
            timestamp: new Date().toISOString()
        };

        config.tickets.blacklist.push(blacklistEntry);
        await saveGuildConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🚫 User Blacklisted from Tickets')
            .setDescription(`${user.tag} has been blacklisted from creating tickets.`)
            .addFields(
                { name: '👤 User', value: `${user.tag}\n\`${user.id}\``, inline: true },
                { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Try to DM the user
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('🚫 Ticket Access Restricted')
                .setDescription(`You have been restricted from creating tickets in **${interaction.guild.name}**.`)
                .addFields(
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '📞 Contact', value: 'Contact server moderators if you believe this is a mistake.', inline: false }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log(`Could not DM blacklisted user ${user.tag}: ${error.message}`);
        }

    } catch (error) {
        console.error('Error adding user to blacklist:', error);
        await interaction.editReply({
            content: '❌ Failed to add user to blacklist.',
            ephemeral: true
        });
    }
}

async function handleBlacklistRemove(interaction) {
    const user = interaction.options.getUser('user');

    try {
        const config = await loadGuildConfig(interaction.guild.id);
        config.tickets = config.tickets || {};
        config.tickets.blacklist = config.tickets.blacklist || [];

        // Find and remove user from blacklist
        const userIndex = config.tickets.blacklist.findIndex(entry => entry.userId === user.id);
        if (userIndex === -1) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0xffa500)
                    .setTitle('⚠️ User Not Blacklisted')
                    .setDescription(`${user.tag} is not currently blacklisted from creating tickets.`)]
            });
        }

        const removedEntry = config.tickets.blacklist[userIndex];
        config.tickets.blacklist.splice(userIndex, 1);
        await saveGuildConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('✅ User Removed from Blacklist')
            .setDescription(`${user.tag} can now create tickets again.`)
            .addFields(
                { name: '👤 User', value: `${user.tag}\n\`${user.id}\``, inline: true },
                { name: '👮 Removed By', value: interaction.user.tag, inline: true },
                { name: '📅 Removed On', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📝 Original Reason', value: removedEntry.reason, inline: false }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Try to DM the user
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Ticket Access Restored')
                .setDescription(`Your ticket access has been restored in **${interaction.guild.name}**.`)
                .addFields(
                    { name: '📞 Create Tickets', value: 'You can now create tickets again using the ticket system.', inline: false }
                )
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log(`Could not DM unblacklisted user ${user.tag}: ${error.message}`);
        }

    } catch (error) {
        console.error('Error removing user from blacklist:', error);
        await interaction.editReply({
            content: '❌ Failed to remove user from blacklist.',
            ephemeral: true
        });
    }
}

async function handleBlacklistList(interaction) {
    try {
        const config = await loadGuildConfig(interaction.guild.id);
        const blacklist = config.tickets?.blacklist || [];

        if (blacklist.length === 0) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('📋 Ticket Blacklist')
                    .setDescription('No users are currently blacklisted from creating tickets.')]
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('📋 Ticket Blacklist')
            .setDescription(`${blacklist.length} user(s) currently blacklisted`)
            .setTimestamp();

        // Show up to 10 most recent blacklisted users
        const recentBlacklist = blacklist.slice(-10).reverse();
        
        for (const entry of recentBlacklist) {
            const user = await interaction.client.users.fetch(entry.userId).catch(() => null);
            const userName = user ? user.tag : entry.username;
            
            embed.addFields({
                name: `🚫 ${userName}`,
                value: `**ID:** \`${entry.userId}\`\n**Reason:** ${entry.reason}\n**By:** ${entry.moderatorName}\n**Date:** <t:${Math.floor(new Date(entry.timestamp).getTime() / 1000)}:R>`,
                inline: true
            });
        }

        if (blacklist.length > 10) {
            embed.setFooter({ text: `Showing 10 most recent of ${blacklist.length} total blacklisted users` });
        }

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error listing blacklist:', error);
        await interaction.editReply({
            content: '❌ Failed to retrieve blacklist.',
            ephemeral: true
        });
    }
}

async function handleBlacklistCheck(interaction) {
    const user = interaction.options.getUser('user');

    try {
        const config = await loadGuildConfig(interaction.guild.id);
        const blacklist = config.tickets?.blacklist || [];
        const entry = blacklist.find(entry => entry.userId === user.id);

        if (!entry) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('✅ User Status: Not Blacklisted')
                    .setDescription(`${user.tag} is **not** blacklisted and can create tickets.`)
                    .setThumbnail(user.displayAvatarURL())]
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🚫 User Status: Blacklisted')
            .setDescription(`${user.tag} is **blacklisted** from creating tickets.`)
            .addFields(
                { name: '👤 User', value: `${user.tag}\n\`${user.id}\``, inline: true },
                { name: '👮 Blacklisted By', value: entry.moderatorName, inline: true },
                { name: '📅 Date', value: `<t:${Math.floor(new Date(entry.timestamp).getTime() / 1000)}:F>`, inline: true },
                { name: '📝 Reason', value: entry.reason, inline: false }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error checking blacklist status:', error);
        await interaction.editReply({
            content: '❌ Failed to check blacklist status.',
            ephemeral: true
        });
    }
}

// Helper function to check if user is blacklisted (exported for other commands to use)
async function isUserBlacklisted(guildId, userId) {
    try {
        const config = await loadGuildConfig(guildId);
        const blacklist = config.tickets?.blacklist || [];
        return blacklist.some(entry => entry.userId === userId);
    } catch (error) {
        console.error('Error checking blacklist status:', error);
        return false;
    }
}

module.exports.isUserBlacklisted = isUserBlacklisted;
