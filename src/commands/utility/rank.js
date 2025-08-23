const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { XPSystem } = require('../../modules/xpSystem');

const xpSystem = new XPSystem();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check XP and level information')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check rank for (defaults to yourself)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(targetUser.id);
        
        if (!member) {
            return interaction.reply({ content: '❌ **Error:** Unable to fetch your XP data.', flags: 64 });
        }

        try {
            const userData = await xpSystem.getUserXP(interaction.guild.id, targetUser.id);
            const leaderboard = await xpSystem.getLeaderboard(interaction.guild.id, 100);
            
            // Find user's position in leaderboard
            const position = leaderboard.findIndex(user => user.userId === targetUser.id) + 1;
            
            // Calculate progress to next level
            const currentLevelXP = xpSystem.getXPForLevel(userData.level);
            const nextLevelXP = xpSystem.getXPForNextLevel(userData.level);
            const progress = userData.xp - currentLevelXP;
            const needed = nextLevelXP - currentLevelXP;
            const progressPercent = Math.round((progress / needed) * 100);

            // Create progress bar
            const barLength = 20;
            const filledLength = Math.round((progress / needed) * barLength);
            const progressBar = '▰'.repeat(filledLength) + '▱'.repeat(barLength - filledLength);

            const embed = new EmbedBuilder()
                .setTitle(`📊 ${targetUser.username}'s Rank`)
                .setColor(0x00ff00)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '🏆 Level', value: userData.level.toString(), inline: true },
                    { name: '⭐ Total XP', value: userData.xp.toLocaleString(), inline: true },
                    { name: '📈 Server Rank', value: position > 0 ? `#${position}` : 'Unranked', inline: true },
                    { name: '📝 Messages Sent', value: userData.totalMessages.toLocaleString(), inline: true },
                    { name: '💬 XP to Next Level', value: `${progress.toLocaleString()}/${needed.toLocaleString()}`, inline: true },
                    { name: '📊 Progress', value: `${progressBar} ${progressPercent}%`, inline: false }
                )
                .setTimestamp();

            if (userData.lastMessage > 0) {
                embed.addFields({
                    name: '⏰ Last Activity',
                    value: `<t:${Math.floor(userData.lastMessage / 1000)}:R>`,
                    inline: true
                });
            }

            return interaction.reply({ embeds: [embed], flags: 64 });

        } catch (error) {
            console.error('Error fetching rank:', error);
            await interaction.reply({
                content: '❌ Failed to fetch rank information. Please try again later.',
                ephemeral: true
            });
        }
    },
};
