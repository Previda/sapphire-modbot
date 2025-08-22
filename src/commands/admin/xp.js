const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isConnected } = require('../../models/database');
const fs = require('fs').promises;
const path = require('path');

// Local storage for XP data
const XP_FILE = path.join(process.cwd(), 'data', 'xp.json');

// Load XP data from local storage
async function loadXPData() {
    try {
        const data = await fs.readFile(XP_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Save XP data to local storage
async function saveXPData(xpData) {
    try {
        const dataDir = path.dirname(XP_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(XP_FILE, JSON.stringify(xpData, null, 2));
    } catch (error) {
        console.error('Failed to save XP data:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('XP management commands (Admin only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add XP to a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to give XP to')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to add')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(10000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove XP from a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to remove XP from')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to remove')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(10000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set user XP to specific amount')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to set XP for')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('XP amount to set')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(100000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check user XP and level')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to check (leave empty for yourself)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset user XP to 0')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to reset')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Show server XP leaderboard'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // Check if user is server owner or has required permissions
        if (interaction.guild.ownerId !== interaction.user.id && 
            !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: '❌ You need the "Manage Server" permission or be the server owner to use this command.',
                flags: 64
            });
        }

        let subcommand;
        try {
            subcommand = interaction.options.getSubcommand();
        } catch (error) {
            // No subcommand provided, show available actions
            const embed = new EmbedBuilder()
                .setTitle('⭐ XP Management System')
                .setColor(0xffd700)
                .setDescription('Available XP management commands:')
                .addFields(
                    { name: '/xp add', value: 'Add XP to a user', inline: false },
                    { name: '/xp remove', value: 'Remove XP from a user', inline: false },
                    { name: '/xp set', value: 'Set user XP to specific amount', inline: false },
                    { name: '/xp check', value: 'Check user XP and level', inline: false },
                    { name: '/xp reset', value: 'Reset user XP to 0', inline: false },
                    { name: '/xp leaderboard', value: 'Show server XP leaderboard', inline: false }
                )
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        try {
            const xpData = await loadXPData();
            const guildKey = interaction.guild.id;
            
            if (!xpData[guildKey]) {
                xpData[guildKey] = {};
            }

            switch (subcommand) {
                case 'add':
                    await handleAddXP(interaction, xpData);
                    break;
                case 'remove':
                    await handleRemoveXP(interaction, xpData);
                    break;
                case 'set':
                    await handleSetXP(interaction, xpData);
                    break;
                case 'check':
                    await handleCheckXP(interaction, xpData);
                    break;
                case 'reset':
                    await handleResetXP(interaction, xpData);
                    break;
                case 'leaderboard':
                    await handleLeaderboard(interaction, xpData);
                    break;
            }

        } catch (error) {
            console.error('XP command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while processing the XP command.',
                flags: 64
            });
        }
    }
};

function calculateLevel(xp) {
    // Simple level formula: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100));
}

function getXPForNextLevel(currentLevel) {
    return (currentLevel + 1) ** 2 * 100;
}

async function handleAddXP(interaction, xpData) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const guildKey = interaction.guild.id;
    
    const currentXP = xpData[guildKey][user.id] || 0;
    const newXP = currentXP + amount;
    const oldLevel = calculateLevel(currentXP);
    const newLevel = calculateLevel(newXP);
    
    xpData[guildKey][user.id] = newXP;
    await saveXPData(xpData);
    
    const embed = new EmbedBuilder()
        .setTitle('⭐ XP Added')
        .setColor(0x00ff00)
        .addFields(
            { name: '👤 User', value: user.tag, inline: true },
            { name: '➕ XP Added', value: amount.toLocaleString(), inline: true },
            { name: '💯 Total XP', value: newXP.toLocaleString(), inline: true },
            { name: '📊 Level', value: `${oldLevel} → ${newLevel}${newLevel > oldLevel ? ' 🎉' : ''}`, inline: false }
        )
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: `Command executed by ${interaction.user.tag}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleRemoveXP(interaction, xpData) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const guildKey = interaction.guild.id;
    
    const currentXP = xpData[guildKey][user.id] || 0;
    const newXP = Math.max(0, currentXP - amount);
    const oldLevel = calculateLevel(currentXP);
    const newLevel = calculateLevel(newXP);
    
    xpData[guildKey][user.id] = newXP;
    await saveXPData(xpData);
    
    const embed = new EmbedBuilder()
        .setTitle('⭐ XP Removed')
        .setColor(0xff6b6b)
        .addFields(
            { name: '👤 User', value: user.tag, inline: true },
            { name: '➖ XP Removed', value: amount.toLocaleString(), inline: true },
            { name: '💯 Total XP', value: newXP.toLocaleString(), inline: true },
            { name: '📊 Level', value: `${oldLevel} → ${newLevel}`, inline: false }
        )
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: `Command executed by ${interaction.user.tag}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleSetXP(interaction, xpData) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const guildKey = interaction.guild.id;
    
    const oldXP = xpData[guildKey][user.id] || 0;
    const oldLevel = calculateLevel(oldXP);
    const newLevel = calculateLevel(amount);
    
    xpData[guildKey][user.id] = amount;
    await saveXPData(xpData);
    
    const embed = new EmbedBuilder()
        .setTitle('⭐ XP Set')
        .setColor(0x4ecdc4)
        .addFields(
            { name: '👤 User', value: user.tag, inline: true },
            { name: '🔢 XP Set To', value: amount.toLocaleString(), inline: true },
            { name: '📊 Level', value: `${oldLevel} → ${newLevel}`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: `Command executed by ${interaction.user.tag}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleCheckXP(interaction, xpData) {
    const user = interaction.options.getUser('user') || interaction.user;
    const guildKey = interaction.guild.id;
    
    const currentXP = xpData[guildKey][user.id] || 0;
    const currentLevel = calculateLevel(currentXP);
    const nextLevelXP = getXPForNextLevel(currentLevel);
    const xpNeeded = nextLevelXP - currentXP;
    
    const embed = new EmbedBuilder()
        .setTitle(`⭐ ${user.displayName}'s XP Stats`)
        .setColor(0x9b59b6)
        .addFields(
            { name: '💯 Total XP', value: currentXP.toLocaleString(), inline: true },
            { name: '📊 Current Level', value: currentLevel.toString(), inline: true },
            { name: '🎯 Next Level', value: `${xpNeeded.toLocaleString()} XP needed`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: user === interaction.user ? 0 : 64 });
}

async function handleResetXP(interaction, xpData) {
    const user = interaction.options.getUser('user');
    const guildKey = interaction.guild.id;
    
    const oldXP = xpData[guildKey][user.id] || 0;
    const oldLevel = calculateLevel(oldXP);
    
    xpData[guildKey][user.id] = 0;
    await saveXPData(xpData);
    
    const embed = new EmbedBuilder()
        .setTitle('⭐ XP Reset')
        .setColor(0xe74c3c)
        .addFields(
            { name: '👤 User', value: user.tag, inline: true },
            { name: '🔄 Previous XP', value: oldXP.toLocaleString(), inline: true },
            { name: '🔄 Previous Level', value: oldLevel.toString(), inline: true }
        )
        .setDescription('User XP has been reset to 0')
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: `Command executed by ${interaction.user.tag}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleLeaderboard(interaction, xpData) {
    const guildKey = interaction.guild.id;
    const guildData = xpData[guildKey] || {};
    
    const sortedUsers = Object.entries(guildData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    if (sortedUsers.length === 0) {
        return interaction.reply({
            content: '📊 No XP data found for this server.',
            flags: 64
        });
    }
    
    const embed = new EmbedBuilder()
        .setTitle('🏆 XP Leaderboard')
        .setColor(0xffd700)
        .setDescription(`Top ${sortedUsers.length} users in ${interaction.guild.name}`)
        .setTimestamp();
    
    for (let i = 0; i < sortedUsers.length; i++) {
        const [userId, xp] = sortedUsers[i];
        const level = calculateLevel(xp);
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        const username = user ? user.tag : `Unknown User (${userId})`;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        
        embed.addFields({
            name: `${medal} ${username}`,
            value: `Level ${level} • ${xp.toLocaleString()} XP`,
            inline: false
        });
    }
    
    await interaction.reply({ embeds: [embed] });
}
