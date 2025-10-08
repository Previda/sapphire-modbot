const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('👤 Display detailed information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)),
    
    async execute(interaction) {
        try {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        
        // User account info
        const accountAge = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
        const joinAge = member ? Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24)) : 0;
        
        // User status and activity (Pi optimized)
        const status = member?.presence?.status || 'offline';
        const statusEmoji = {
            online: '🟢',
            idle: '🟡', 
            dnd: '🔴',
            offline: '⚫'
        
        } catch (error) {
            console.error('Command execution error:', error);
            
            const errorMessage = {
                content: '❌ An error occurred while executing this command. Please try again later.',
                ephemeral: true
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    };
        
        // Role information (limited for memory)
        const roles = member ? member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10) // Limit to 10 roles for Pi
            : [];
        
        // Permissions (key ones only)
        const keyPerms = member ? [
            member.permissions.has('Administrator') && '👑 Administrator',
            member.permissions.has('ManageGuild') && '🏠 Manage Server',
            member.permissions.has('ManageMessages') && '📝 Manage Messages',
            member.permissions.has('BanMembers') && '🔨 Ban Members',
            member.permissions.has('KickMembers') && '👢 Kick Members',
            member.permissions.has('ManageRoles') && '🎭 Manage Roles'
        ].filter(Boolean) : [];
        
        const embed = new EmbedBuilder()
            .setTitle(`👤 ${targetUser.username}'s Profile`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .setColor(member?.displayColor || 0x0099ff)
            .addFields(
                {
                    name: '📊 Account Info',
                    value: `**Username:** ${targetUser.username}\n**Display Name:** ${targetUser.displayName}\n**ID:** \`${targetUser.id}\`\n**Bot:** ${targetUser.bot ? '🤖 Yes' : '👤 No'}`,
                    inline: true
                },
                {
                    name: '📅 Dates',
                    value: `**Created:** <t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>\n**Account Age:** ${accountAge} days${member ? `\n**Joined:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n**Server Age:** ${joinAge} days` : ''}`,
                    inline: true
                },
                {
                    name: '🔸 Status',
                    value: `${statusEmoji[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}${member?.presence?.activities?.length ? `\n**Activity:** ${member.presence.activities[0].name}` : ''}`,
                    inline: true
                }
            );

        // Add roles if user is in server
        if (member && roles.length > 0) {
            embed.addFields({
                name: `🎭 Roles (${member.roles.cache.size - 1})`,
                value: roles.length >= 10 ? 
                    `${roles.join(' ')}\n*+${member.roles.cache.size - 11} more...*` : 
                    roles.join(' ') || 'None',
                inline: false
            });
        }
        
        // Add key permissions
        if (keyPerms.length > 0) {
            embed.addFields({
                name: '🔑 Key Permissions',
                value: keyPerms.join('\n'),
                inline: false
            });
        }
        
        // Add server-specific info
        if (member) {
            embed.addFields({
                name: '📈 Server Stats',
                value: `**Highest Role:** ${member.roles.highest}\n**Nickname:** ${member.nickname || 'None'}\n**Booster:** ${member.premiumSince ? '💎 Yes' : '❌ No'}`,
                inline: true
            });
        }

        // Avatar and banner (if available)
        if (targetUser.banner) {
            embed.setImage(targetUser.bannerURL({ dynamic: true, size: 512 }));
        }
        
        embed.setFooter({ 
            text: `Requested by ${interaction.user.username} • Pi Optimized`, 
            iconURL: interaction.user.avatarURL() 
        }).setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
