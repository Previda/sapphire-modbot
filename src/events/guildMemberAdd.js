const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getDocument } = require('../utils/database');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const guildId = member.guild.id;
            const config = await getDocument('verification', guildId);
            
            // Only proceed if verification is enabled
            if (!config || !config.enabled) {
                return;
            }

            const verificationChannel = member.guild.channels.cache.get(config.channelId);
            const verifiedRole = member.guild.roles.cache.get(config.roleId);
            
            // Check if channel and role still exist
            if (!verificationChannel || !verifiedRole) {
                console.error(`Verification setup invalid for guild ${guildId} - missing channel or role`);
                return;
            }

            // Check if member already has verification role (shouldn't happen, but just in case)
            if (member.roles.cache.has(config.roleId)) {
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

            // Auto-remove unverified members after timeout if enabled
            if (config.removeUnverified && config.timeoutHours > 0) {
                setTimeout(async () => {
                    try {
                        // Check if member still exists and doesn't have verified role
                        const updatedMember = await member.guild.members.fetch(member.id).catch(() => null);
                        if (updatedMember && !updatedMember.roles.cache.has(config.roleId)) {
                            await updatedMember.kick('Failed to verify within time limit');
                            console.log(`Removed unverified member: ${member.user.tag} from ${member.guild.name}`);
                        }
                    } catch (error) {
                        console.error('Error removing unverified member:', error);
                    }
                }, config.timeoutHours * 60 * 60 * 1000); // Convert hours to milliseconds
            }

            // Log member join for verification tracking
            await logMemberJoin(guildId, member.id, member.user.tag);

        } catch (error) {
            console.error('Guild member add verification error:', error);
        }
    }
};

async function logMemberJoin(guildId, userId, userTag) {
    try {
        const { getDocument, setDocument } = require('../utils/database');
        const logs = await getDocument('verification_logs', guildId) || { entries: [] };
        
        logs.entries.unshift({
            userId,
            userTag,
            type: 'member_join',
            success: null, // Will be updated when they verify
            timestamp: Date.now(),
            id: require('crypto').randomUUID()
        });
        
        // Keep only last 1000 entries
        if (logs.entries.length > 1000) {
            logs.entries = logs.entries.slice(0, 1000);
        }
        
        await setDocument('verification_logs', guildId, logs);
    } catch (error) {
        console.error('Failed to log member join:', error);
    }
}
