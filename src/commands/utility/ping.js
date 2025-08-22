const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Check bot latency and system status'),
    
    async execute(interaction) {
        const start = Date.now();
        
        // Initial reply to measure round-trip time
        await interaction.reply({ content: '🏓 Pinging...', ephemeral: true });
        
        const end = Date.now();
        const roundTrip = end - start;
        const apiLatency = interaction.client.ws.ping;
        
        // Get system info (optimized for Pi)
        const memUsage = process.memoryUsage();
        const uptime = process.uptime();
        const uptimeDays = Math.floor(uptime / 86400);
        const uptimeHours = Math.floor((uptime % 86400) / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);
        
        // Status indicators
        const pingStatus = apiLatency < 100 ? '🟢' : apiLatency < 200 ? '🟡' : '🔴';
        const memStatus = memUsage.heapUsed / 1024 / 1024 < 100 ? '🟢' : '🟡';
        
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong! System Status')
            .setColor(apiLatency < 100 ? 0x00ff00 : apiLatency < 200 ? 0xffff00 : 0xff0000)
            .addFields(
                {
                    name: '📡 Latency',
                    value: `\`\`\`\n${pingStatus} API: ${apiLatency}ms\n🔄 Round-trip: ${roundTrip}ms\n📊 Status: ${apiLatency < 100 ? 'Excellent' : apiLatency < 200 ? 'Good' : 'Slow'}\n\`\`\``,
                    inline: true
                },
                {
                    name: '💾 System',
                    value: `\`\`\`\n${memStatus} Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB\n⚡ Platform: Raspberry Pi\n🔧 Node.js: ${process.version}\n\`\`\``,
                    inline: true
                },
                {
                    name: '⏱️ Uptime',
                    value: `\`\`\`\n🕐 ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m\n📅 Since: <t:${Math.floor((Date.now() - uptime * 1000) / 1000)}:R>\n🔄 Status: Online\n\`\`\``,
                    inline: false
                }
            )
            .setFooter({ 
                text: 'Sapphire Bot • Optimized for Raspberry Pi', 
                iconURL: interaction.client.user.avatarURL() 
            })
            .setTimestamp();

        // Update the reply with detailed info
        await interaction.editReply({ 
            content: null, 
            embeds: [embed], 
            ephemeral: true 
        });
    },
};
