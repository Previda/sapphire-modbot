const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Ultra-polished, modern embed system with beautiful UI
 * Provides consistent, professional appearance across all bot features
 */

// Premium color palette - Modern and professional
const COLORS = {
    // Primary colors
    PRIMARY: 0x5865F2,      // Discord Blurple
    SUCCESS: 0x57F287,      // Vibrant Green
    ERROR: 0xED4245,        // Vibrant Red
    WARNING: 0xFEE75C,      // Vibrant Yellow
    INFO: 0x00D9FF,         // Cyan
    
    // Moderation colors
    BAN: 0xED4245,          // Red
    KICK: 0xFEE75C,         // Yellow
    WARN: 0xFEE75C,         // Yellow
    MUTE: 0xEB459E,         // Fuchsia
    TIMEOUT: 0xEB459E,      // Fuchsia
    
    // Feature colors
    APPEAL: 0x9B59B6,       // Purple
    TICKET: 0x3498DB,       // Blue
    VERIFICATION: 0x57F287, // Green
    ECONOMY: 0xF1C40F,      // Gold
    MUSIC: 0xE91E63,        // Pink
    XP: 0x9B59B6,           // Purple
    
    // Status colors
    ONLINE: 0x57F287,       // Green
    OFFLINE: 0x747F8D,      // Gray
    IDLE: 0xFEE75C,         // Yellow
    DND: 0xED4245           // Red
};

// Premium emoji set
const EMOJIS = {
    // Actions
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    LOADING: '⏳',
    CHECK: '✓',
    CROSS: '✗',
    
    // Moderation
    BAN: '🔨',
    KICK: '👢',
    WARN: '⚠️',
    MUTE: '🔇',
    UNMUTE: '🔊',
    TIMEOUT: '⏰',
    LOCK: '🔒',
    UNLOCK: '🔓',
    
    // Features
    APPEAL: '📝',
    TICKET: '🎫',
    VERIFY: '✅',
    CASE: '📋',
    STATS: '📊',
    SETTINGS: '⚙️',
    MUSIC: '🎵',
    ECONOMY: '💰',
    XP: '⭐',
    
    // Users & Roles
    MODERATOR: '👮',
    USER: '👤',
    ADMIN: '👑',
    BOT: '🤖',
    ROLE: '🎭',
    
    // Misc
    REASON: '📝',
    TIME: '🕐',
    CHANNEL: '📍',
    SERVER: '🏢',
    CALENDAR: '📅',
    CLOCK: '⏰',
    BELL: '🔔',
    SHIELD: '🛡️',
    CROWN: '👑',
    STAR: '⭐',
    SPARKLES: '✨',
    FIRE: '🔥',
    ROCKET: '🚀',
    TARGET: '🎯',
    TROPHY: '🏆'
};

class PolishedEmbed {
    /**
     * Create a beautiful success embed
     */
    static success(title, description, options = {}) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle(`${EMOJIS.SUCCESS} ${title}`)
            .setTimestamp();

        if (description) {
            embed.setDescription(description);
        }

        if (options.fields) {
            embed.addFields(options.fields);
        }

        if (options.footer) {
            embed.setFooter({ text: options.footer });
        }

        if (options.thumbnail) {
            embed.setThumbnail(options.thumbnail);
        }

        return embed;
    }

    /**
     * Create a beautiful error embed
     */
    static error(title, description, options = {}) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.ERROR)
            .setTitle(`${EMOJIS.ERROR} ${title}`)
            .setTimestamp();

        if (description) {
            embed.setDescription(description);
        }

        if (options.fields) {
            embed.addFields(options.fields);
        }

        if (options.footer) {
            embed.setFooter({ text: options.footer || 'If this persists, contact an administrator' });
        }

        if (options.solution) {
            embed.addFields({
                name: '💡 Solution',
                value: options.solution,
                inline: false
            });
        }

        return embed;
    }

    /**
     * Create a beautiful warning embed
     */
    static warning(title, description, options = {}) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.WARNING)
            .setTitle(`${EMOJIS.WARNING} ${title}`)
            .setTimestamp();

        if (description) {
            embed.setDescription(description);
        }

        if (options.fields) {
            embed.addFields(options.fields);
        }

        if (options.footer) {
            embed.setFooter({ text: options.footer });
        }

        return embed;
    }

    /**
     * Create a beautiful info embed
     */
    static info(title, description, options = {}) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.INFO)
            .setTitle(`${EMOJIS.INFO} ${title}`)
            .setTimestamp();

        if (description) {
            embed.setDescription(description);
        }

        if (options.fields) {
            embed.addFields(options.fields);
        }

        if (options.footer) {
            embed.setFooter({ text: options.footer });
        }

        if (options.thumbnail) {
            embed.setThumbnail(options.thumbnail);
        }

        return embed;
    }

    /**
     * Create a beautiful moderation action embed
     */
    static moderation(action, data) {
        const actionConfig = {
            ban: { emoji: EMOJIS.BAN, color: COLORS.BAN, title: 'Member Banned' },
            kick: { emoji: EMOJIS.KICK, color: COLORS.KICK, title: 'Member Kicked' },
            warn: { emoji: EMOJIS.WARN, color: COLORS.WARN, title: 'Member Warned' },
            mute: { emoji: EMOJIS.MUTE, color: COLORS.MUTE, title: 'Member Muted' },
            unmute: { emoji: EMOJIS.UNMUTE, color: COLORS.SUCCESS, title: 'Member Unmuted' },
            timeout: { emoji: EMOJIS.TIMEOUT, color: COLORS.TIMEOUT, title: 'Member Timed Out' },
            untimeout: { emoji: EMOJIS.UNMUTE, color: COLORS.SUCCESS, title: 'Timeout Removed' },
            unban: { emoji: EMOJIS.SUCCESS, color: COLORS.SUCCESS, title: 'Member Unbanned' }
        };

        const config = actionConfig[action] || { emoji: EMOJIS.INFO, color: COLORS.PRIMARY, title: 'Moderation Action' };

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`${config.emoji} ${config.title}`)
            .setTimestamp();

        // Add user info with clean formatting
        if (data.user) {
            embed.addFields({
                name: `${EMOJIS.USER} Target User`,
                value: `**${data.user.tag}**\n\`${data.user.id}\``,
                inline: true
            });
        }

        // Add moderator info
        if (data.moderator) {
            embed.addFields({
                name: `${EMOJIS.MODERATOR} Moderator`,
                value: `**${data.moderator.tag}**\n\`${data.moderator.id}\``,
                inline: true
            });
        }

        // Add case ID
        if (data.caseId) {
            embed.addFields({
                name: `${EMOJIS.CASE} Case ID`,
                value: `\`${data.caseId}\``,
                inline: true
            });
        }

        // Add reason with clean formatting
        if (data.reason) {
            embed.addFields({
                name: `${EMOJIS.REASON} Reason`,
                value: `>>> ${data.reason}`,
                inline: false
            });
        }

        // Add duration if applicable
        if (data.duration) {
            embed.addFields({
                name: `${EMOJIS.TIME} Duration`,
                value: data.duration,
                inline: true
            });
        }

        // Add DM status with visual indicator
        if (data.dmSent !== undefined) {
            embed.addFields({
                name: '💬 DM Notification',
                value: data.dmSent ? `${EMOJIS.SUCCESS} Successfully sent` : `${EMOJIS.ERROR} Could not send`,
                inline: true
            });
        }

        // Add appeal code with emphasis
        if (data.appealCode) {
            embed.addFields({
                name: `${EMOJIS.APPEAL} Appeal Code`,
                value: `\`\`\`${data.appealCode}\`\`\``,
                inline: false
            });
        }

        // Add user thumbnail
        if (data.user) {
            embed.setThumbnail(data.user.displayAvatarURL({ dynamic: true, size: 256 }));
        }

        // Add footer
        if (data.footer) {
            embed.setFooter({ text: data.footer });
        }

        return embed;
    }

    /**
     * Create a beautiful case embed
     */
    static case(caseData) {
        const typeConfig = {
            ban: { emoji: EMOJIS.BAN, color: COLORS.BAN },
            kick: { emoji: EMOJIS.KICK, color: COLORS.KICK },
            warn: { emoji: EMOJIS.WARN, color: COLORS.WARN },
            mute: { emoji: EMOJIS.MUTE, color: COLORS.MUTE },
            timeout: { emoji: EMOJIS.TIMEOUT, color: COLORS.TIMEOUT }
        };

        const config = typeConfig[caseData.type] || { emoji: EMOJIS.CASE, color: COLORS.PRIMARY };

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`${config.emoji} Case #${caseData.caseId}`)
            .setDescription(`**Action Type:** ${caseData.type.toUpperCase()}`)
            .addFields(
                { 
                    name: `${EMOJIS.USER} Target User`, 
                    value: `<@${caseData.userId}>\n\`${caseData.userId}\``, 
                    inline: true 
                },
                { 
                    name: `${EMOJIS.MODERATOR} Moderator`, 
                    value: `<@${caseData.moderatorId}>`, 
                    inline: true 
                },
                { 
                    name: `${EMOJIS.CALENDAR} Date`, 
                    value: `<t:${Math.floor(new Date(caseData.timestamp).getTime() / 1000)}:F>`, 
                    inline: true 
                },
                { 
                    name: `${EMOJIS.REASON} Reason`, 
                    value: `>>> ${caseData.reason || 'No reason provided'}`, 
                    inline: false 
                }
            )
            .setTimestamp(new Date(caseData.timestamp));

        // Add status with visual indicator
        if (caseData.status) {
            const statusEmoji = {
                active: '🟢',
                reversed: '🔄',
                expired: '⚪',
                appealed: '📝'
            };
            embed.addFields({
                name: '📊 Status',
                value: `${statusEmoji[caseData.status] || '⚪'} ${caseData.status.toUpperCase()}`,
                inline: true
            });
        }

        // Add duration if applicable
        if (caseData.duration) {
            embed.addFields({
                name: `${EMOJIS.TIME} Duration`,
                value: caseData.duration,
                inline: true
            });
        }

        embed.setFooter({ text: `Case ID: ${caseData.caseId}` });

        return embed;
    }

    /**
     * Create a beautiful appeal embed
     */
    static appeal(appealData) {
        const statusColors = {
            pending: COLORS.WARNING,
            under_review: COLORS.INFO,
            approved: COLORS.SUCCESS,
            rejected: COLORS.ERROR
        };

        const statusEmojis = {
            pending: '⏳',
            under_review: '🔍',
            approved: '✅',
            rejected: '❌'
        };

        const embed = new EmbedBuilder()
            .setColor(statusColors[appealData.status] || COLORS.APPEAL)
            .setTitle(`${EMOJIS.APPEAL} Appeal #${appealData.appealCode}`)
            .setDescription(`**Status:** ${statusEmojis[appealData.status]} ${appealData.status.toUpperCase().replace('_', ' ')}`)
            .addFields(
                { 
                    name: `${EMOJIS.USER} User`, 
                    value: `<@${appealData.userId}>\n\`${appealData.userId}\``, 
                    inline: true 
                },
                { 
                    name: '📅 Type', 
                    value: appealData.type.toUpperCase(), 
                    inline: true 
                },
                { 
                    name: `${EMOJIS.CALENDAR} Submitted`, 
                    value: `<t:${Math.floor(new Date(appealData.timestamp).getTime() / 1000)}:R>`, 
                    inline: true 
                }
            )
            .setTimestamp(new Date(appealData.timestamp));

        // Add appeal reason
        if (appealData.reason) {
            embed.addFields({
                name: `${EMOJIS.REASON} Appeal Reason`,
                value: `>>> ${appealData.reason}`,
                inline: false
            });
        }

        // Add review info if reviewed
        if (appealData.reviewedBy) {
            embed.addFields({
                name: `${EMOJIS.MODERATOR} Reviewed By`,
                value: `<@${appealData.reviewedBy}>`,
                inline: true
            });
        }

        if (appealData.reviewReason) {
            embed.addFields({
                name: '📋 Review Notes',
                value: `>>> ${appealData.reviewReason}`,
                inline: false
            });
        }

        embed.setFooter({ text: `Appeal Code: ${appealData.appealCode}` });

        return embed;
    }

    /**
     * Create a beautiful stats embed
     */
    static stats(title, stats, options = {}) {
        const embed = new EmbedBuilder()
            .setColor(options.color || COLORS.INFO)
            .setTitle(`${EMOJIS.STATS} ${title}`)
            .setTimestamp();

        if (options.description) {
            embed.setDescription(options.description);
        }

        // Format stats nicely
        const fields = Object.entries(stats).map(([key, value]) => {
            // Add emojis based on key names
            let emoji = '';
            if (key.toLowerCase().includes('user')) emoji = EMOJIS.USER;
            else if (key.toLowerCase().includes('server')) emoji = EMOJIS.SERVER;
            else if (key.toLowerCase().includes('command')) emoji = EMOJIS.ROCKET;
            else if (key.toLowerCase().includes('message')) emoji = '💬';
            else if (key.toLowerCase().includes('member')) emoji = EMOJIS.USER;
            else emoji = EMOJIS.STAR;

            return {
                name: `${emoji} ${key}`,
                value: `**${value}**`,
                inline: true
            };
        });

        embed.addFields(fields);

        if (options.footer) {
            embed.setFooter({ text: options.footer });
        }

        return embed;
    }

    /**
     * Create a beautiful ticket embed
     */
    static ticket(ticketData) {
        const statusColors = {
            open: COLORS.SUCCESS,
            claimed: COLORS.INFO,
            closed: COLORS.OFFLINE
        };

        const embed = new EmbedBuilder()
            .setColor(statusColors[ticketData.status] || COLORS.TICKET)
            .setTitle(`${EMOJIS.TICKET} Ticket #${ticketData.ticketId}`)
            .addFields(
                { 
                    name: `${EMOJIS.USER} Creator`, 
                    value: `<@${ticketData.userId}>`, 
                    inline: true 
                },
                { 
                    name: '📂 Category', 
                    value: ticketData.category || 'General', 
                    inline: true 
                },
                { 
                    name: '📊 Status', 
                    value: ticketData.status.toUpperCase(), 
                    inline: true 
                }
            )
            .setTimestamp(new Date(ticketData.createdAt));

        if (ticketData.claimedBy) {
            embed.addFields({
                name: `${EMOJIS.MODERATOR} Claimed By`,
                value: `<@${ticketData.claimedBy}>`,
                inline: true
            });
        }

        if (ticketData.description) {
            embed.addFields({
                name: '📝 Description',
                value: `>>> ${ticketData.description}`,
                inline: false
            });
        }

        embed.setFooter({ text: `Ticket ID: ${ticketData.ticketId}` });

        return embed;
    }

    /**
     * Create a beautiful verification embed
     */
    static verification(guildName, guildIcon) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.VERIFICATION)
            .setTitle(`${EMOJIS.VERIFY} Welcome to ${guildName}!`)
            .setDescription(`${EMOJIS.SHIELD} **Verification Required**\n\nClick the button below to verify and unlock full server access!`)
            .addFields(
                { 
                    name: `${EMOJIS.SHIELD} Why Verify?`, 
                    value: 'Keeps our community safe from spam, bots, and malicious users', 
                    inline: false 
                },
                { 
                    name: `${EMOJIS.ROCKET} Quick & Easy`, 
                    value: 'Just one click - takes less than a second!', 
                    inline: true 
                },
                { 
                    name: `${EMOJIS.SPARKLES} Full Access`, 
                    value: 'Unlock all channels, roles, and features', 
                    inline: true 
                }
            )
            .setThumbnail(guildIcon)
            .setFooter({ text: '🛡️ Skyfall Security System | Keeping the community safe' })
            .setTimestamp();

        return embed;
    }

    /**
     * Create a beautiful loading embed
     */
    static loading(title, description) {
        return new EmbedBuilder()
            .setColor(COLORS.INFO)
            .setTitle(`${EMOJIS.LOADING} ${title}`)
            .setDescription(description || '⏳ Please wait while we process your request...')
            .setTimestamp();
    }

    /**
     * Create a beautiful permission error embed
     */
    static permissionError(permission, solution) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.ERROR)
            .setTitle(`${EMOJIS.ERROR} Missing Permissions`)
            .setDescription(`I need the **${permission}** permission to execute this command.`)
            .addFields({
                name: '💡 How to Fix',
                value: solution || 
                    '1. Go to **Server Settings** → **Roles**\n' +
                    '2. Find my role and enable the required permission\n' +
                    '3. Ensure my role is positioned correctly in the hierarchy\n' +
                    '4. Try the command again',
                inline: false
            })
            .addFields({
                name: '🔍 Quick Check',
                value: 'Use `/fix-permissions` to diagnose all permission issues',
                inline: false
            })
            .setFooter({ text: 'Need help? Contact a server administrator' })
            .setTimestamp();

        return embed;
    }
}

module.exports = {
    PolishedEmbed,
    COLORS,
    EMOJIS
};
