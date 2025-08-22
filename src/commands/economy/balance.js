const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const economyManager = require('../../utils/economyUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('💰 Check your current balance and economy stats')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Check another user\'s balance')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const isOwn = targetUser.id === interaction.user.id;
        
        // Get user data from economy manager
        const userData = economyManager.getUser(targetUser.id, interaction.guild.id);
        
        const totalWealth = userData.balance + userData.bank + (userData.gems * 10);
        const nextLevelXp = userData.level * 100;
        const xpProgress = Math.round((userData.xp / nextLevelXp) * 100);
        
        // Determine wealth rank color
        let rankColor = 0xcd7f32; // Bronze
        if (totalWealth >= 10000) rankColor = 0xffd700; // Gold
        else if (totalWealth >= 5000) rankColor = 0xc0c0c0; // Silver
        
        const embed = new EmbedBuilder()
            .setTitle(`💰 ${isOwn ? 'Your' : `${targetUser.username}'s`} Economy Profile`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
            .setColor(rankColor)
            .addFields(
                {
                    name: '💵 Wallet',
                    value: `\`\`\`\n💎 ${userData.gems.toLocaleString()} gems\n🪙 ${userData.balance.toLocaleString()} coins\n🏦 ${userData.bank.toLocaleString()} banked\n💰 ${totalWealth.toLocaleString()} total\n\`\`\``,
                    inline: true
                },
                {
                    name: '📊 Progress',
                    value: `\`\`\`\n🌟 Level ${userData.level}\n⭐ ${userData.xp}/${nextLevelXp} XP\n📈 ${xpProgress}% to next\n🏆 ${userData.totalEarned.toLocaleString()} earned\n\`\`\``,
                    inline: true
                },
                {
                    name: '📈 Activity',
                    value: `\`\`\`\n🔥 Work Streak: ${userData.workStreak}\n📅 Daily Streak: ${userData.dailyStreak}\n⚡ Commands: ${userData.commandsUsed}\n📊 Rank: ${this.getRankName(totalWealth)}\n\`\`\``,
                    inline: false
                }
            );

        // Add progress bar for XP
        const progressBar = '█'.repeat(Math.floor(xpProgress / 10)) + '░'.repeat(10 - Math.floor(xpProgress / 10));
        embed.addFields({
            name: '📊 Level Progress',
            value: `\`${progressBar}\` ${xpProgress}%`,
            inline: false
        });

        // Add quick actions or viewing info
        if (isOwn) {
            const canWork = economyManager.canWork(targetUser.id, interaction.guild.id);
            const canDaily = economyManager.canDaily(targetUser.id, interaction.guild.id);
            
            embed.addFields({
                name: '🎯 Available Actions',
                value: `${canWork ? '✅' : '⏰'} \`/work\` - Earn coins\n${canDaily ? '✅' : '⏰'} \`/daily\` - Daily reward\n💱 \`/transfer\` - Send money\n📊 \`/leaderboard\` - See rankings`,
                inline: true
            });
        } else {
            embed.addFields({
                name: '👁️ Viewing Mode',
                value: `You're viewing ${targetUser.username}'s profile.\nUse \`/balance\` to see your own stats.`,
                inline: true
            });
        }

        // Add membership info
        const memberSince = Math.floor((Date.now() - userData.createdAt) / (1000 * 60 * 60 * 24));
        embed.addFields({
            name: '📅 Economy Stats',
            value: `Member since: ${memberSince} days ago\nLast active: ${userData.lastWork ? `<t:${Math.floor(userData.lastWork / 1000)}:R>` : 'Never'}`,
            inline: false
        });

        embed.setFooter({ 
            text: `Sapphire Economy • ${isOwn ? 'Keep earning!' : 'Viewing another user'} • Pi Optimized`, 
            iconURL: interaction.client.user.avatarURL() 
        }).setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    getRankName(wealth) {
        if (wealth >= 50000) return 'Diamond 💎';
        if (wealth >= 25000) return 'Platinum 🏆';
        if (wealth >= 10000) return 'Gold 🥇';
        if (wealth >= 5000) return 'Silver 🥈';
        if (wealth >= 1000) return 'Bronze 🥉';
        return 'Starter 🌱';
    }
};
