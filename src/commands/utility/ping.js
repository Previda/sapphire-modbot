const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and status')
        .setDefaultMemberPermissions(null), // Allow all users

    async execute(interaction) {
        try {
            const sent = await interaction.reply({ 
                content: '🏓 Pinging...', 
                fetchReply: true 
            });
            
            const embed = new EmbedBuilder()
                .setTitle('🏓 Pong!')
                .setColor(0x00ff00)
                .addFields(
                    { 
                        name: '📡 Latency', 
                        value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, 
                        inline: true 
                    },
                    { 
                        name: '💓 API Latency', 
                        value: `${Math.round(interaction.client.ws.ping)}ms`, 
                        inline: true 
                    },
                    { 
                        name: '🤖 Status', 
                        value: 'Online ✅', 
                        inline: true 
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Requested by ${interaction.user.username}`, 
                    iconURL: interaction.user.displayAvatarURL() 
                });

            await interaction.editReply({ 
                content: null, 
                embeds: [embed] 
            });
            
        } catch (error) {
            console.error('Ping command error:', error);
            
            const errorMessage = {
                content: '❌ Failed to execute ping command.',
                ephemeral: true
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};