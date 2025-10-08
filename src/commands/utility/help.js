const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show available commands and bot information')
        .setDefaultMemberPermissions(null), // Allow all users

    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const embed = new EmbedBuilder()
                .setTitle('🤖 Sapphire Modbot - Help')
                .setColor(0x3498db)
                .setDescription('Here are the available commands:')
                .addFields(
                    { 
                        name: '🔧 Utility Commands', 
                        value: `\`/ping\` - Check bot latency
\`/help\` - Show this help message`, 
                        inline: false 
                    },
                    { 
                        name: '🎫 Ticket Commands', 
                        value: `\`/ticket open\` - Open a support ticket
\`/ticket close\` - Close current ticket (mods only)
\`/ticket transcript\` - Generate ticket transcript`, 
                        inline: false 
                    },
                    { 
                        name: '🎵 Music Commands', 
                        value: `\`/play\` - Play music from YouTube/Spotify
\`/stop\` - Stop music playback
\`/nowplaying\` - Show current song`, 
                        inline: false 
                    },
                    { 
                        name: '🛡️ Moderation Commands', 
                        value: `\`/case create\` - Create a moderation case (mods only)
\`/case view\` - View case details (mods only)
\`/warn\` - Warn a user (mods only)`, 
                        inline: false 
                    }
                )
                .setFooter({ 
                    text: 'Sapphire Modbot - Advanced Discord Management', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Help command error:', error);
            await interaction.editReply({
                content: '❌ Failed to show help information.'
            });
        }
    },
};