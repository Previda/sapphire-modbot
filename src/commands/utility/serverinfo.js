const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display server information'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const guild = interaction.guild;
            
            const embed = new EmbedBuilder()
                .setTitle(`📊 ${guild.name} Server Info`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setColor(0x3498db)
                .addFields(
                    { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                    { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                    { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                    { name: '🆔 Server ID', value: `${guild.id}`, inline: true },
                    { name: '🌍 Region', value: 'Auto', inline: true },
                    { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Serverinfo command error:', error);
            
            const errorMessage = {
                content: '❌ Failed to get server information.',
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