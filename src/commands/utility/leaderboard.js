const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { XPSystem } = require('../../modules/xpSystem');

const xpSystem = new XPSystem();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server XP leaderboard')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number to view (10 users per page)')
                .setMinValue(1)
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const page = interaction.options.getInteger('page') || 1;
            const pageSize = 10;
            const startIndex = (page - 1) * pageSize;
            
            const fullLeaderboard = await xpSystem.getLeaderboard(interaction.guild.id, 100);
            const pageLeaderboard = fullLeaderboard.slice(startIndex, startIndex + pageSize);
            
            if (pageLeaderboard.length === 0) {
                return interaction.reply({
                    content: page === 1 ? '📊 No XP data found for this server yet!' : `📊 Page ${page} is empty! Try a lower page number.`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${interaction.guild.name} Leaderboard`)
                .setColor(0xffd700)
                .setFooter({ 
                    text: `Page ${page} • Total Users: ${fullLeaderboard.length}`,
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            let description = '';
            
            for (let i = 0; i < pageLeaderboard.length; i++) {
                const userData = pageLeaderboard[i];
                const user = interaction.client.users.cache.get(userData.userId);
                const rank = startIndex + i + 1;
                
                // Get medals for top 3
                let medal = '';
                if (rank === 1) medal = '🥇';
                else if (rank === 2) medal = '🥈';
                else if (rank === 3) medal = '🥉';
                else medal = `**${rank}.**`;

                const username = user ? user.username : 'Unknown User';
                const displayName = user ? (user.globalName || username) : username;
                
                description += `${medal} **${displayName}**\n`;
                description += `   \`Level ${userData.level}\` • \`${userData.xp.toLocaleString()} XP\` • \`${userData.totalMessages.toLocaleString()} msgs\`\n\n`;
            }

            embed.setDescription(description);

            // Add user's position if they're not on current page
            const userPosition = fullLeaderboard.findIndex(user => user.userId === interaction.user.id) + 1;
            if (userPosition > 0 && (userPosition < startIndex + 1 || userPosition > startIndex + pageSize)) {
                const userData = fullLeaderboard[userPosition - 1];
                embed.addFields({
                    name: '📍 Your Position',
                    value: `**#${userPosition}** • Level ${userData.level} • ${userData.xp.toLocaleString()} XP`,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await interaction.reply({
                content: '❌ Failed to fetch leaderboard. Please try again later.',
                ephemeral: true
            });
        }
    },
};
