const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display user information')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to get information about')
                .setRequired(false)),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            const member = interaction.guild.members.cache.get(user.id);
            
            const embed = new EmbedBuilder()
                .setTitle(`👤 ${user.username} User Info`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor(0xe74c3c)
                .addFields(
                    { name: '🏷️ Tag', value: `${user.tag}`, inline: true },
                    { name: '🆔 ID', value: `${user.id}`, inline: true },
                    { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
                );

            if (member) {
                embed.addFields(
                    { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                    { name: '🎭 Roles', value: member.roles.cache.size > 1 ? `${member.roles.cache.size - 1} roles` : 'No roles', inline: true }
                );
            }

            embed.setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Userinfo command error:', error);
            
            const errorMessage = {
                content: '❌ Failed to get user information.',
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