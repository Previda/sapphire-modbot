const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('📊 Display detailed server information and bot statistics'),
    
    async execute(interaction) {
        const guild = interaction.guild;
        const botMember = guild.members.cache.get(interaction.client.user.id);
        
        // Calculate bot uptime and join date
        const botJoinedAt = botMember.joinedAt;
        const timeSinceJoin = Date.now() - botJoinedAt.getTime();
        const daysSinceJoin = Math.floor(timeSinceJoin / (1000 * 60 * 60 * 24));
        
        // Server statistics (optimized for memory)
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline').size;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const humanCount = totalMembers - botCount;
        
        // Channel statistics
        const textChannels = guild.channels.cache.filter(channel => channel.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2).size;
        const categories = guild.channels.cache.filter(channel => channel.type === 4).size;
        
        // Role count
        const roleCount = guild.roles.cache.size - 1; // -1 to exclude @everyone
        
        // Server features (compressed display)
        const features = guild.features.map(feature => 
            feature.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        ).join(', ') || 'None';
        
        // Bot uptime
        const uptimeMs = process.uptime() * 1000;
        const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
        const uptimeHours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        const embed = new EmbedBuilder()
            .setTitle(`📊 ${guild.name} Server Information`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .setColor(0x0099ff)
            .addFields(
                {
                    name: '🏰 Server Details',
                    value: `**Name:** ${guild.name}\n**ID:** \`${guild.id}\`\n**Owner:** <@${guild.ownerId}>\n**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n**Verification:** ${guild.verificationLevel}`,
                    inline: true
                },
                {
                    name: '👥 Members',
                    value: `**Total:** ${totalMembers.toLocaleString()}\n**Humans:** ${humanCount.toLocaleString()}\n**Bots:** ${botCount.toLocaleString()}\n**Online:** ${onlineMembers.toLocaleString()}`,
                    inline: true
                },
                {
                    name: '📺 Channels',
                    value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categories}\n**Total:** ${textChannels + voiceChannels}`,
                    inline: true
                },
                {
                    name: '🛡️ Bot Information',
                    value: `**Joined:** <t:${Math.floor(botJoinedAt.getTime() / 1000)}:F>\n**Days Active:** ${daysSinceJoin}\n**Uptime:** ${uptimeDays}d ${uptimeHours}h\n**Commands:** 42+`,
                    inline: true
                },
                {
                    name: '🎭 Server Stats',
                    value: `**Roles:** ${roleCount}\n**Emojis:** ${guild.emojis.cache.size}\n**Stickers:** ${guild.stickers.cache.size}\n**Boost Level:** ${guild.premiumTier}`,
                    inline: true
                },
                {
                    name: '⚡ System Info',
                    value: `**Memory:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n**Platform:** Raspberry Pi\n**Node.js:** ${process.version}\n**Status:** 🟢 Optimal`,
                    inline: true
                }
            )
            .setFooter({ text: `Sapphire Moderation Bot • Optimized for Pi • ${daysSinceJoin} days of service`, iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        if (guild.bannerURL() && guild.premiumTier >= 2) {
            embed.setImage(guild.bannerURL({ dynamic: true, size: 512 }));
        }

        // Add features if not too long
        if (features.length <= 1024) {
            embed.addFields({
                name: '🌟 Server Features',
                value: features,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
