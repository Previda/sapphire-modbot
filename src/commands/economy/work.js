const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const economyManager = require('../../utils/economyUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('💼 Work to earn coins and XP (Pi optimized)'),

    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;
        const guildId = interaction.guild.id;
        
        // Check if user can work
        if (!economyManager.canWork(userId, guildId)) {
            const userData = economyManager.getUser(userId, guildId);
            const timeLeft = (60 * 60 * 1000) - (Date.now() - userData.lastWork);
            const minutesLeft = Math.ceil(timeLeft / (1000 * 60));
            
            return interaction.reply({
                content: `⏰ You can work again in **${minutesLeft} minutes**!\n💡 Tip: Use \`/daily\` for more rewards while you wait.`,
                ephemeral: true
            });
        }

        // Get user data
        const userData = economyManager.getUser(userId, guildId);
        
        // Available jobs (Pi optimized list)
        const jobs = [
            { name: '🍕 Pizza Delivery', pay: [45, 120], xp: [8, 18], emoji: '🍕' },
            { name: '🐕 Dog Walker', pay: [30, 85], xp: [6, 15], emoji: '🐕' },
            { name: '🚗 Ride Driver', pay: [60, 150], xp: [12, 25], emoji: '🚗' },
            { name: '💻 Tech Support', pay: [80, 200], xp: [15, 30], emoji: '💻' },
            { name: '🌱 Gardening', pay: [35, 95], xp: [7, 16], emoji: '🌱' },
            { name: '📚 Tutoring', pay: [55, 140], xp: [10, 22], emoji: '📚' },
            { name: '🍔 Food Delivery', pay: [40, 110], xp: [8, 19], emoji: '🍔' },
            { name: '🧹 House Cleaning', pay: [50, 130], xp: [9, 20], emoji: '🧹' }
        ];

        const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
        const baseEarnings = Math.floor(Math.random() * (randomJob.pay[1] - randomJob.pay[0] + 1)) + randomJob.pay[0];
        const baseXp = Math.floor(Math.random() * (randomJob.xp[1] - randomJob.xp[0] + 1)) + randomJob.xp[0];

        // Level bonus calculations
        const levelBonus = Math.floor(baseEarnings * (userData.level * 0.05)); // 5% per level
        const streak = userData.workStreak || 0;
        const streakBonus = Math.floor(baseEarnings * (streak * 0.02)); // 2% per streak day
        
        // Simulate success rate and bonuses
        const success = Math.random() > 0.15; // 85% success rate
        const criticalSuccess = Math.random() < 0.1; // 10% chance for critical success
        
        if (!success) {
            // Update work time but don't give rewards
            economyManager.updateUser(userId, guildId, { 
                lastWork: Date.now(),
                workStreak: 0 // Reset streak on failure
            });
            
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle('💼 Work Failed!')
                    .setDescription(`You attempted **${randomJob.name}** but it didn't go well...`)
                    .setColor(0xff6b6b)
                    .addFields(
                        { name: '💔 Result', value: 'Job failed - better luck next time!', inline: true },
                        { name: '🔥 Streak Lost', value: `Previous streak: ${streak}`, inline: true },
                        { name: '⏰ Cooldown', value: '1 hour', inline: true },
                        { name: '💡 Tip', value: 'Try again in an hour! Success rate is 85%', inline: false }
                    )
                    .setFooter({ text: 'Keep trying - consistency builds wealth!' })
                    .setTimestamp()
                ]
            });
        }

        // Calculate final rewards
        const totalEarnings = baseEarnings + levelBonus + streakBonus + (criticalSuccess ? Math.floor(baseEarnings * 0.5) : 0);
        const totalXp = baseXp + (criticalSuccess ? Math.floor(baseXp * 0.3) : 0);
        
        // Update user data
        const { user: updatedUser, leveledUp } = economyManager.addXP(userId, guildId, totalXp);
        economyManager.addBalance(userId, guildId, totalEarnings);
        economyManager.updateUser(userId, guildId, { 
            lastWork: Date.now(),
            workStreak: streak + 1,
            commandsUsed: updatedUser.commandsUsed + 1
        });

        const embed = new EmbedBuilder()
            .setTitle('💼 Work Completed!')
            .setDescription(`${randomJob.emoji} You successfully worked as **${randomJob.name}**!${criticalSuccess ? ' 🌟 **CRITICAL SUCCESS!**' : ''}`)
            .setColor(criticalSuccess ? 0xffd700 : leveledUp ? 0x00ff00 : 0x28a745)
            .addFields(
                { name: '💰 Base Pay', value: `🪙 ${baseEarnings.toLocaleString()}`, inline: true },
                { name: '⚡ Level Bonus', value: `🪙 ${levelBonus.toLocaleString()} (+${userData.level}%)`, inline: true },
                { name: '🔥 Streak Bonus', value: `🪙 ${streakBonus.toLocaleString()} (${streak + 1} days)`, inline: true },
                { name: '✨ XP Gained', value: `${totalXp} XP`, inline: true },
                { name: '🎯 Success Rate', value: '85%', inline: true },
                { name: '💎 Total Earned', value: `🪙 ${totalEarnings.toLocaleString()}`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))
            .setFooter({ text: 'Sapphire Economy • Work again in 1 hour', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        if (criticalSuccess) {
            embed.addFields({
                name: '🌟 Critical Success!',
                value: `Amazing work! You earned 50% bonus coins and 30% bonus XP!`,
                inline: false
            });
        }

        if (leveledUp) {
            embed.addFields({
                name: '🎉 LEVEL UP!',
                value: `Congratulations! You reached **Level ${updatedUser.level}**!\nYour level bonus is now **${updatedUser.level * 5}%**!`,
                inline: false
            });
        }

        // Add motivational message based on streak
        let tip = 'Keep working to build your streak!';
        if (streak >= 7) tip = 'Amazing streak! You\'re a dedicated worker! 🔥';
        else if (streak >= 3) tip = 'Great streak going! Keep it up! 💪';
        else if (streak >= 1) tip = 'Building momentum! Consistency pays off! 📈';

        embed.addFields({
            name: '💡 Tip',
            value: tip,
            inline: false
        });

        await interaction.reply({ embeds: [embed] });
    },
};
