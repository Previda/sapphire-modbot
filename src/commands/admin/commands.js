const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('View all available bot commands and features'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🌌 Skyfall Bot - Complete Command Arsenal')
            .setDescription('**Advanced Discord Management Bot with Professional Dashboard**')
            .setColor(0x0099ff)
            .addFields(
                {
                    name: '🔨 Moderation Commands',
                    value: '`/ban` - Ban user (with message deletion, silent mode)\n`/kick` - Kick user with case tracking\n`/warn` - Warn user with appeal system\n`/mute` - Mute user with duration support\n`/slowmode` - Set channel slowmode (0-21600s)\n`/modstats` - View moderation statistics',
                    inline: false
                },
                {
                    name: '🎵 Skyfall Music System',
                    value: '`/play` - Play music from YouTube/Spotify\n`/skip` - Skip current song\n`/stop` - Stop music and disconnect\n`/queue` - View music queue\n`/volume` - Adjust playback volume\n`/nowplaying` - Show current song info',
                    inline: false
                },
                {
                    name: '🎫 Ticket System',
                    value: '`/ticket open` - Open support ticket\n`/ticket close` - Close with transcript\n`/ticket add/remove` - Manage participants\n`/ticket transcript` - Generate HTML export\n`/manage menu` - **Interactive ticket menu**\n`/manage list` - List all open tickets\n`/manage create` - Create ticket for user',
                    inline: false
                },
                {
                    name: '📝 Appeals System',
                    value: '`/appeal submit case_id:ABC123` - Submit punishment appeal\n`/appeal status case_id:ABC123` - Check appeal status\n`/appeal review case_id:ABC123` - Review appeals (Staff)\n`/appeal settings` - Configure appeal system (Admin)\n**DM Support:** Add `server_id:123456789` parameter\n**Auto-Invites:** Rejoin buttons for kicks/unbans',
                    inline: false
                },
                {
                    name: '💰 Economy System',
                    value: '`/balance` - Check wallet, bank, level, XP\n`/daily` - Claim daily rewards with bonuses\n**Features:** Level progression, XP tracking',
                    inline: false
                },
                {
                    name: '🛠️ Skyfall Utilities',
                    value: '`/userinfo` - Comprehensive user information\n`/tempsys` - Skyfall system stats\n`/sysinfo` - Raspberry Pi system info\n**Interactive:** `!ticket` menu in channels',
                    inline: false
                },
                {
                    name: '📱 DM Commands (Private Message Bot)',
                    value: '`!case CASE-ABC123` - Look up case details\n`!appeal CASE-ABC123` - Start appeal process\n`!help` - Show DM command help',
                    inline: false
                },
                {
                    name: '🎛️ Interactive Features',
                    value: '• **Ticket Menu:** Type `!ticket` for staff controls\n• **Rich Embeds:** Beautiful formatted responses\n• **Modal Forms:** Easy input for appeals/tickets\n• **Button Interactions:** Quick actions\n• **Auto Transcripts:** HTML conversation exports',
                    inline: false
                },
                {
                    name: '🔧 Advanced Features',
                    value: '• **Case System:** Unique IDs for all punishments\n• **Appeal Integration:** DM-based appeal process\n• **User Mentions:** Auto-ping in tickets\n• **Customizable:** Categories, durations, settings\n• **MySQL Backend:** Reliable data storage',
                    inline: false
                }
            )
            .setFooter({ text: 'Skyfall Bot v2.0 - Use slash commands (/) or DM commands (!). Dashboard: skyfall-omega.vercel.app' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
