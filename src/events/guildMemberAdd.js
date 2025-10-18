const { Events, EmbedBuilder } = require('discord.js');
const { loadGuildConfig } = require('../utils/configManager');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const guildId = member.guild.id;
            const config = await loadGuildConfig(guildId);
            
            // Only proceed if verification is enabled
            if (!config || !config.verificationEnabled) {
                return;
            }

            const verificationChannel = member.guild.channels.cache.get(config.verificationChannel);
            const verifiedRole = member.guild.roles.cache.get(config.verifiedRole);
            
            // Check if channel and role still exist
            if (!verificationChannel || !verifiedRole) {
                console.error(`Verification setup invalid for guild ${guildId} - missing channel or role`);
                return;
            }

            // Check if member already has verification role (shouldn't happen, but just in case)
            if (member.roles.cache.has(config.verifiedRole)) {
                return;
            }

            // Send welcome DM with verification instructions
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#5865f2')
                    .setTitle(`Welcome to ${member.guild.name}! 🎉`)
                    .setDescription(`To access all channels, please complete verification in ${verificationChannel}.`)
                    .addFields(
                        { name: '🔐 Verification Required', value: 'Head over to the verification channel to get started!', inline: false },
                        { name: '🛡️ Why Verify?', value: 'Verification helps keep our server safe from spam and malicious users.', inline: false }
                    )
                    .setThumbnail(member.guild.iconURL())
                    .setFooter({ text: 'Skyfall Verification System' })
                    .setTimestamp();

                await member.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to ${member.user.tag}: ${dmError.message}`);
            }

            console.log(`✅ New member ${member.user.tag} joined ${member.guild.name} - verification required`);

        } catch (error) {
            console.error('Guild member add verification error:', error);
        }
    }
};
