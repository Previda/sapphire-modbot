const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const economyManager = require('../../utils/economyUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('🎁 Claim your daily reward (Pi optimized with bonuses)'),

    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;
        const guildId = interaction.guild.id;
        
        // Check if user can claim daily
        if (!economyManager.canDaily(userId, guildId)) {
            const userData = economyManager.getUser(userId, guildId);
            const timeLeft = (24 * 60 * 60 * 1000) - (Date.now() - userData.lastDaily);
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
            
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle('🎁 Daily Reward')
                    .setDescription('⏰ You have already claimed your daily reward!')
                    .setColor(0xff6b6b)
                    .addFields(
                        { name: '⏱️ Next Claim', value: `In **${hoursLeft} hours**`, inline: true },
                        { name: '💡 Tip', value: 'Use `/work` to earn more coins!', inline: true }
                    )
                    .setFooter({ text: 'Come back tomorrow!' })
                    .setTimestamp()
                ],
                ephemeral: true
            });
        }

        // Get user data for streak calculations
        const userData = economyManager.getUser(userId, guildId);
        const currentStreak = userData.dailyStreak || 0;
        
        // Calculate reward with streak bonus
        const baseReward = 150;
        const streakBonus = Math.floor(currentStreak * 25); // 25 coins per streak day
        const levelBonus = Math.floor(baseReward * (userData.level * 0.1)); // 10% per level
        const randomBonus = Math.floor(Math.random() * 50) + 25; // Random bonus 25-75
        
        // Special bonuses
        const isWeekend = [0, 6].includes(new Date().getDay());
        const weekendBonus = isWeekend ? 100 : 0;
        const luckyBonus = Math.random() < 0.1 ? Math.floor(baseReward * 0.5) : 0; // 10% chance for 50% bonus
        
        const finalReward = baseReward + streakBonus + levelBonus + randomBonus + weekendBonus + luckyBonus;
        const xpGained = 20 + Math.floor(currentStreak * 2); // Base 20 XP + 2 per streak day

        // Update user data
        const { user: updatedUser, leveledUp } = economyManager.addXP(userId, guildId, xpGained);
        economyManager.addBalance(userId, guildId, finalReward);
        economyManager.updateUser(userId, guildId, { 
            lastDaily: Date.now(),
            dailyStreak: currentStreak + 1,
            commandsUsed: updatedUser.commandsUsed + 1
        });

        const embed = new EmbedBuilder()
            .setTitle('🎁 Daily Reward Claimed!')
            .setDescription(`${luckyBonus > 0 ? '🍀 **LUCKY DAY!** 🍀' : '💰 **Daily Reward Collected!**'}`)
            .setColor(luckyBonus > 0 ? 0xffd700 : leveledUp ? 0x00ff00 : 0x28a745)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))
            .addFields(
                { name: '💰 Base Reward', value: `🪙 ${baseReward.toLocaleString()}`, inline: true },
                { name: '🔥 Streak Bonus', value: `🪙 ${streakBonus.toLocaleString()} (${currentStreak + 1} days)`, inline: true },
                { name: '⚡ Level Bonus', value: `🪙 ${levelBonus.toLocaleString()} (+${userData.level * 10}%)`, inline: true },
                { name: '🎲 Random Bonus', value: `🪙 ${randomBonus.toLocaleString()}`, inline: true },
                { name: '✨ XP Gained', value: `${xpGained} XP`, inline: true },
                { name: '💎 Total Earned', value: `🪙 ${finalReward.toLocaleString()}`, inline: true }
            );

        if (weekendBonus > 0) {
            embed.addFields({ 
                name: '🎉 Weekend Bonus!', 
                value: `🪙 ${weekendBonus.toLocaleString()} extra coins!`, 
                inline: true 
            });
        }

        if (luckyBonus > 0) {
            embed.addFields({
                name: '🍀 Lucky Bonus!',
                value: `🪙 ${luckyBonus.toLocaleString()} lucky coins!`,
                inline: true
            });
        }

        if (leveledUp) {
            embed.addFields({
                name: '🎉 LEVEL UP!',
                value: `Congratulations! You reached **Level ${updatedUser.level}**!\nDaily bonuses increased!`,
                inline: false
            });
        }

        // Next daily time
        const nextDaily = Date.now() + (24 * 60 * 60 * 1000);
        embed.addFields(
            { name: '⏰ Next Daily', value: `<t:${Math.floor(nextDaily / 1000)}:R>`, inline: true },
            { name: '💡 Tip', value: 'Keep your streak going for bigger rewards!', inline: true }
        );

        // Streak milestone messages
        let streakMessage = 'Keep building your streak!';
        if (currentStreak >= 30) streakMessage = 'Incredible dedication! 30+ day streak! 🏆';
        else if (currentStreak >= 14) streakMessage = 'Amazing commitment! 2 weeks strong! 💪';
        else if (currentStreak >= 7) streakMessage = 'One week streak! You\'re on fire! 🔥';
        else if (currentStreak >= 3) streakMessage = 'Great consistency! Keep it up! 📈';

        embed.addFields({
            name: '🎯 Streak Progress',
            value: streakMessage,
            inline: false
        });
        
        embed.setFooter({ 
            text: `Sapphire Economy • Day ${currentStreak + 1} streak • Pi Optimized`, 
            iconURL: interaction.client.user.avatarURL() 
        }).setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
