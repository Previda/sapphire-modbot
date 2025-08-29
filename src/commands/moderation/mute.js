const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCase } = require('../../utils/caseManager');
const webhookLogger = require('../../utils/webhookLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔇 Timeout a member from speaking in channels')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Mute duration in minutes (max 40320 = 28 days)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(40320))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('silent')
                .setDescription('Don\'t send DM to user')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('server_id')
                .setDescription('Server ID (required for DMs)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const duration = interaction.options.getString('duration') || '1h';
        const silent = interaction.options.getBoolean('silent') || false;
        const serverIdRaw = interaction.options.getString('server_id');

        // Determine guild (from current guild or provided server_id for DMs)
        let guild;
        
        if (interaction.guild) {
            guild = interaction.guild;
        } else if (serverIdRaw) {
            try {
                guild = await interaction.client.guilds.fetch(serverIdRaw);
                if (!guild) {
                    return interaction.reply({
                        content: '❌ Server not found or bot is not in that server.',
                        flags: 64
                    });
                }
            } catch (error) {
                return interaction.reply({
                    content: '❌ Invalid server ID or bot is not in that server.',
                    flags: 64
                });
            }
        } else {
            return interaction.reply({
                content: '❌ When using moderation commands in DMs, please provide the server_id parameter.\nExample: `/mute user:@user server_id:123456789`',
                flags: 64
            });
        }

        // Defer reply for moderation actions
        await interaction.deferReply({ flags: silent ? 64 : 0 });

        // Check if user is server owner or has required permissions (skip for DMs)
        if (interaction.guild && guild.ownerId !== interaction.user.id && 
            !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.editReply({
                content: '❌ You need the **Moderate Members** permission to use this command.'
            });
        }

        try {
            const member = await guild.members.fetch(targetUser.id).catch(() => null);

            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            // Permission checks (skip for server owner)
            if (guild.ownerId !== interaction.user.id) {
                if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                    return interaction.reply({ content: '❌ You cannot mute this member due to role hierarchy.', ephemeral: true });
                }
            }
            
            if (!member.moderatable) {
                return interaction.reply({ content: '❌ I cannot mute this member.', ephemeral: true });
            }

            // Parse duration
            const durationMinutes = parseDuration(duration);
            if (!durationMinutes) {
                return interaction.reply({
                    content: '❌ Invalid duration format. Please use a format like 1h, 30m, or 1d.',
                    ephemeral: true
                });
            }

            // Calculate timeout duration in milliseconds
            const timeoutDuration = durationMinutes * 60 * 1000;
            const durationText = `${durationMinutes}m`;

            // Create moderation case with proper case ID
            const newCase = await createCase({
                type: 'mute',
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                guildId: guild.id,
                reason: reason,
                expires: new Date(Date.now() + timeoutDuration).toISOString(),
                appealable: true
            });

            // Apply timeout
            await member.timeout(timeoutDuration, `${reason} | Moderator: ${interaction.user.tag} | Case #${newCase.caseId}`);

            // Send DM to user (unless silent)
            let dmSent = false;
            if (!silent) {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🔇 You have been muted')
                        .setColor(0xff9900)
                        .addFields(
                            { name: '🏢 Server', value: guild.name, inline: true },
                            { name: '⏱️ Duration', value: durationText, inline: true },
                            { name: '📝 Reason', value: reason, inline: false },
                            { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                            { name: '📋 Appeal', value: 'Use `/appeal submit` with your case ID if you believe this is unfair', inline: false }
                        )
                        .setTimestamp();
                    
                    await targetUser.send({ embeds: [dmEmbed] });
                    dmSent = true;
                } catch (error) {
                    console.log(`Could not DM user ${targetUser.tag}: ${error.message}`);
                    dmSent = false;
                }
            }

            // Create response embed with real information
            const expiresAt = Date.now() + timeoutDuration;
            const embed = new EmbedBuilder()
                .setTitle('🔇 Member Muted')
                .setColor(0xff9900)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '🆔 Case ID', value: newCase.caseId, inline: true },
                    { name: '⏱️ Duration', value: durationText, inline: true },
                    { name: '🕐 Expires', value: `<t:${Math.floor(expiresAt / 1000)}:R>`, inline: true },
                    { name: '💬 DM Sent', value: dmSent ? '✅ Yes' : '❌ No', inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log to webhook if configured
            await webhookLogger.logModeration(guild, {
                type: 'mute',
                targetTag: targetUser.tag,
                targetId: targetUser.id,
                moderatorTag: interaction.user.tag,
                moderatorId: interaction.user.id,
                caseId: newCase.caseId,
                reason: reason,
                duration: `${durationMinutes} minutes`
            });

            // Log to mod channel if configured
            const modLogChannelId = process.env.MOD_LOG_CHANNEL_ID;
            if (modLogChannelId) {
                const modLogChannel = interaction.guild.channels.cache.get(modLogChannelId);
                if (modLogChannel) {
                    await modLogChannel.send({ embeds: [embed] });
                }
            }

        } catch (error) {
            console.error('Mute command error:', error);
            await interaction.reply({
                content: '❌ Failed to mute the user. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};

function parseDuration(duration) {
    const regex = /^(\d+)([smhd])$/;
    const match = duration.match(regex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };
    
    const result = value * multipliers[unit];
    return result > 2419200000 ? 2419200000 : result; // Max 28 days
}
