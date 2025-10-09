const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show available commands and bot information'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const embed = new EmbedBuilder()
                .setTitle('🤖 Skyfall - Help')
                .setDescription('Here are the available commands:')
                .setColor(0x3498db)
                .addFields(
                    {
                        name: '⚡ Utility Commands',
                        value: `\`/ping\` - Check bot latency
\`/help\` - Show this help message
\`/avatar\` - Show user avatar
\`/serverinfo\` - Show server information
\`/userinfo\` - Show user information`,
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
\`/nowplaying\` - Show current song
\`/queue\` - Show music queue`,
                        inline: false
                    },
                    {
                        name: '🛡️ Moderation Commands',
                        value: `\`/case create\` - Create a moderation case (mods only)
\`/case view\` - View case details (mods only)
\`/warn\` - Warn a user (mods only)
\`/ban\` - Ban a user (mods only)`,
                        inline: false
                    },
                    {
                        name: '🎮 Fun Commands',
                        value: `\`/8ball\` - Ask the magic 8-ball
\`/coinflip\` - Flip a coin
\`/roll\` - Roll dice`,
                        inline: false
                    }
                )
                .setFooter({ 
                    text: 'Skyfall - Advanced Discord Management • Use /help for more info',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Help command error:', error);
            
            const errorMessage = {
                content: '❌ Failed to load help information.',
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