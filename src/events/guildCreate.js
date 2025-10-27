
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log(`📥 Joined new server: ${guild.name} (ID: ${guild.id})`);
        
        // Try to send a welcome message to the system channel or first available text channel
        const channel = guild.systemChannel || guild.channels.cache.find(ch => ch.isTextBased() && ch.permissionsFor(guild.members.me).has('SendMessages'));
        
        if (channel) {
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🤖 Thanks for adding Skyfall Bot!')
                .setDescription('I\'m here to help with moderation and server management.')
                .addFields(
                    { name: '🚀 Getting Started', value: 'Use `/help` to see all available commands' },
                    { name: '⚙️ Setup', value: 'Configure moderation settings with `/config`' },
                    { name: '📚 Documentation', value: 'Visit our GitHub for detailed guides' }
                )
                .setTimestamp();
            
            try {
                await channel.send({ embeds: [welcomeEmbed] });
            } catch (error) {
                console.log('Could not send welcome message:', error.message);
            }
        }
    },
};
