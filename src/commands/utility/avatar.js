const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('🖼️ Display a user\'s avatar and profile picture')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose avatar to display')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('server')
                .setDescription('Show server-specific avatar instead of global')
                .setRequired(false)),
    
    async execute(interaction) {
        try {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const showServer = interaction.options.getBoolean('server') || false;
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        
        // Get different avatar types (Pi optimized)
        const globalAvatar = targetUser.displayAvatarURL({ dynamic: true, size: 1024 
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
    });
        const serverAvatar = member ? member.displayAvatarURL({ dynamic: true, size: 1024 }) : null;
        const avatarToShow = (showServer && serverAvatar) ? serverAvatar : globalAvatar;
        
        // Check if user has different server avatar
        const hasDifferentServerAvatar = serverAvatar && serverAvatar !== globalAvatar;
        
        const embed = new EmbedBuilder()
            .setTitle(`🖼️ ${targetUser.username}'s Avatar`)
            .setDescription(showServer && hasDifferentServerAvatar ? 
                `**Server Avatar** for ${targetUser.displayName}` : 
                `**Global Avatar** for ${targetUser.displayName}`)
            .setColor(member?.displayColor || 0x0099ff)
            .setImage(avatarToShow)
            .addFields({ name: '🔗 Direct Links', 
                    value: `[PNG](${avatarToShow.replace(/\.(webp|gif)(\?.*)?$/, '.png$2')}) • [JPG](${avatarToShow.replace(/\.(webp|gif)(\?.*)?$/, '.jpg$2')}) • [WEBP](${avatarToShow.replace(/\.(gif)(\?.*)?$/, '.webp$2')})${avatarToShow.includes('.gif') ? ` • [GIF](${avatarToShow})` : ''}`, 
                    inline: false 
                },
                {
                    name: '📊 Avatar Info',
                    value: `**Type:** ${showServer && hasDifferentServerAvatar ? 'Server-specific' : 'Global'}\n**Format:** ${avatarToShow.includes('.gif') ? 'Animated GIF' : 'Static Image'}\n**Size:** 1024x1024px`,
                    inline: true
                }
            )
            .setFooter({ 
                text: `Requested by ${interaction.user.username} • Pi Optimized`, 
                iconURL: interaction.user.avatarURL() 
            })
            .setTimestamp();

        // Add server avatar option if available
        if (hasDifferentServerAvatar && !showServer) {
            embed.addFields({ name: '🎭 Server Avatar Available',
                value: 'This user has a different avatar in this server!\nUse `/avatar server:true` to see it.',
                inline: true
            });
        }
        
        // Add avatar history note
        if (showServer && hasDifferentServerAvatar) {
            embed.addFields({ name: '🌐 Global Avatar',
                value: `[View Global Avatar](${globalAvatar})\nUse \`/avatar server:false\` to see global avatar.`,
                inline: true
            });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
