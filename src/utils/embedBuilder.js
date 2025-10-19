const { EmbedBuilder } = require('discord.js');

/**
 * Standardized embed builder for consistent, modern UI across all commands
 */

// Color palette
const COLORS = {
    PRIMARY: 0x5865F2,    // Discord Blurple
    SUCCESS: 0x57F287,    // Green
    WARNING: 0xFEE75C,    // Yellow
    ERROR: 0xED4245,      // Red
    INFO: 0x3498DB,       // Blue
    MODERATION: 0xFF6B6B, // Red-orange
    APPEAL: 0x9B59B6,     // Purple
    TICKET: 0x3498DB,     // Blue
    VERIFICATION: 0x2ECC71 // Green
};

// Emojis for consistent branding
const EMOJIS = {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    LOADING: '⏳',
    BAN: '🔨',
    KICK: '👢',
    WARN: '⚠️',
    MUTE: '🔇',
    UNMUTE: '🔊',
    TIMEOUT: '⏰',
    APPEAL: '📝',
    TICKET: '🎫',
    VERIFY: '✅',
    LOCK: '🔒',
    UNLOCK: '🔓',
    CASE: '📋',
    STATS: '📊',
    SETTINGS: '⚙️',
    MODERATOR: '👮',
    USER: '👤',
    REASON: '📝',
    TIME: '🕐',
    CHANNEL: '📍',
    ROLE: '🎭'
};

class ModernEmbedBuilder {
    /**
     * Create a success embed
     */
    static success(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle(`${EMOJIS.SUCCESS} ${title}`)
            .setTimestamp();

        if (description) embed.setDescription(description);
        if (fields.length > 0) embed.addFields(fields);

        return embed;
    }

    /**
     * Create an error embed
     */
    static error(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.ERROR)
            .setTitle(`${EMOJIS.ERROR} ${title}`)
            .setTimestamp();

        if (description) embed.setDescription(description);
        if (fields.length > 0) embed.addFields(fields);

        return embed;
    }

    /**
     * Create a warning embed
     */
    static warning(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.WARNING)
            .setTitle(`${EMOJIS.WARNING} ${title}`)
            .setTimestamp();

        if (description) embed.setDescription(description);
        if (fields.length > 0) embed.addFields(fields);

        return embed;
    }

    /**
     * Create an info embed
     */
    static info(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.INFO)
            .setTitle(`${EMOJIS.INFO} ${title}`)
            .setTimestamp();

        if (description) embed.setDescription(description);
        if (fields.length > 0) embed.addFields(fields);

        return embed;
    }

    /**
     * Create a loading embed
     */
    static loading(title, description) {
        return new EmbedBuilder()
            .setColor(COLORS.INFO)
            .setTitle(`${EMOJIS.LOADING} ${title}`)
            .setDescription(description || 'Please wait...')
            .setTimestamp();
    }

    /**
     * Create a moderation action embed
     */
    static moderation(action, data) {
        const actionEmojis = {
            ban: EMOJIS.BAN,
            kick: EMOJIS.KICK,
            warn: EMOJIS.WARN,
            mute: EMOJIS.MUTE,
            unmute: EMOJIS.UNMUTE,
            timeout: EMOJIS.TIMEOUT,
            unban: '🔄',
            untimeout: '🔄'
        };

        const embed = new EmbedBuilder()
            .setColor(COLORS.MODERATION)
            .setTitle(`${actionEmojis[action] || EMOJIS.INFO} ${action.charAt(0).toUpperCase() + action.slice(1)} Action`)
            .setTimestamp();

        const fields = [];

        if (data.user) {
            fields.push({
                name: `${EMOJIS.USER} Target User`,
                value: `${data.user.tag}\n\`${data.user.id}\``,
                inline: true
            });
        }

        if (data.moderator) {
            fields.push({
                name: `${EMOJIS.MODERATOR} Moderator`,
                value: `${data.moderator.tag}\n\`${data.moderator.id}\``,
                inline: true
            });
        }

        if (data.caseId) {
            fields.push({
                name: `${EMOJIS.CASE} Case ID`,
                value: `\`${data.caseId}\``,
                inline: true
            });
        }

        if (data.reason) {
            fields.push({
                name: `${EMOJIS.REASON} Reason`,
                value: data.reason,
                inline: false
            });
        }

        if (data.duration) {
            fields.push({
                name: `${EMOJIS.TIME} Duration`,
                value: data.duration,
                inline: true
            });
        }

        if (data.dmSent !== undefined) {
            fields.push({
                name: '💬 DM Notification',
                value: data.dmSent ? '✅ Sent' : '❌ Failed',
                inline: true
            });
        }

        if (data.appealCode) {
            fields.push({
                name: `${EMOJIS.APPEAL} Appeal Code`,
                value: `\`${data.appealCode}\``,
                inline: true
            });
        }

        embed.addFields(fields);

        if (data.footer) {
            embed.setFooter({ text: data.footer });
        }

        return embed;
    }

    /**
     * Create a permission error embed
     */
    static permissionError(missingPermission, solution) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.ERROR)
            .setTitle(`${EMOJIS.ERROR} Missing Permissions`)
            .setDescription(`I need the **${missingPermission}** permission to execute this command.`)
            .setTimestamp();

        if (solution) {
            embed.addFields({
                name: '💡 How to Fix',
                value: solution,
                inline: false
            });
        } else {
            embed.addFields({
                name: '💡 How to Fix',
                value: '1. Go to **Server Settings** → **Roles**\n2. Find my role\n3. Enable the required permission\n4. Make sure my role is positioned correctly',
                inline: false
            });
        }

        embed.addFields({
            name: '🔍 Quick Check',
            value: 'Use `/fix-permissions` to see all missing permissions',
            inline: false
        });

        return embed;
    }

    /**
     * Create a case embed
     */
    static case(caseData) {
        const typeEmojis = {
            ban: EMOJIS.BAN,
            kick: EMOJIS.KICK,
            warn: EMOJIS.WARN,
            mute: EMOJIS.MUTE,
            timeout: EMOJIS.TIMEOUT
        };

        const embed = new EmbedBuilder()
            .setColor(COLORS.MODERATION)
            .setTitle(`${typeEmojis[caseData.type] || EMOJIS.CASE} Case ${caseData.caseId}`)
            .addFields(
                { name: `${EMOJIS.USER} User`, value: `<@${caseData.userId}>\n\`${caseData.userId}\``, inline: true },
                { name: `${EMOJIS.MODERATOR} Moderator`, value: `<@${caseData.moderatorId}>`, inline: true },
                { name: '📅 Type', value: caseData.type.toUpperCase(), inline: true },
                { name: `${EMOJIS.REASON} Reason`, value: caseData.reason || 'No reason provided', inline: false }
            )
            .setTimestamp(caseData.timestamp);

        if (caseData.duration) {
            embed.addFields({ name: `${EMOJIS.TIME} Duration`, value: caseData.duration, inline: true });
        }

        if (caseData.status) {
            const statusEmoji = caseData.status === 'active' ? '🟢' : caseData.status === 'reversed' ? '🔄' : '⚪';
            embed.addFields({ name: '📊 Status', value: `${statusEmoji} ${caseData.status}`, inline: true });
        }

        return embed;
    }

    /**
     * Create an appeal embed
     */
    static appeal(appealData) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.APPEAL)
            .setTitle(`${EMOJIS.APPEAL} Appeal ${appealData.appealCode}`)
            .addFields(
                { name: `${EMOJIS.USER} User`, value: `<@${appealData.userId}>\n\`${appealData.userId}\``, inline: true },
                { name: '📅 Type', value: appealData.type.toUpperCase(), inline: true },
                { name: '📊 Status', value: appealData.status || 'Pending', inline: true }
            )
            .setTimestamp(appealData.timestamp);

        if (appealData.reason) {
            embed.addFields({ name: `${EMOJIS.REASON} Appeal Reason`, value: appealData.reason, inline: false });
        }

        if (appealData.responses) {
            appealData.responses.forEach((response, index) => {
                embed.addFields({
                    name: `❓ ${response.question}`,
                    value: response.answer || 'No answer provided',
                    inline: false
                });
            });
        }

        return embed;
    }

    /**
     * Create a stats embed
     */
    static stats(title, stats) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.INFO)
            .setTitle(`${EMOJIS.STATS} ${title}`)
            .setTimestamp();

        const fields = Object.entries(stats).map(([key, value]) => ({
            name: key,
            value: String(value),
            inline: true
        }));

        embed.addFields(fields);

        return embed;
    }

    /**
     * Create a ticket embed
     */
    static ticket(ticketData) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.TICKET)
            .setTitle(`${EMOJIS.TICKET} Ticket ${ticketData.ticketId}`)
            .addFields(
                { name: `${EMOJIS.USER} Creator`, value: `<@${ticketData.userId}>`, inline: true },
                { name: '📂 Category', value: ticketData.category || 'General', inline: true },
                { name: '📊 Status', value: ticketData.status || 'Open', inline: true }
            )
            .setTimestamp(ticketData.createdAt);

        if (ticketData.claimedBy) {
            embed.addFields({ name: '👤 Claimed By', value: `<@${ticketData.claimedBy}>`, inline: true });
        }

        if (ticketData.description) {
            embed.addFields({ name: '📝 Description', value: ticketData.description, inline: false });
        }

        return embed;
    }

    /**
     * Create a verification embed
     */
    static verification(guildName, guildIcon) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.VERIFICATION)
            .setTitle(`${EMOJIS.VERIFY} Verify to Access ${guildName}`)
            .setDescription('Click the button below to verify and gain access to all channels!')
            .addFields(
                { name: '🔐 Why Verify?', value: 'Verification helps keep our server safe from spam and malicious users.', inline: false },
                { name: '⚡ Quick Process', value: 'Just click the button below - it takes less than a second!', inline: false },
                { name: '✨ What You Get', value: 'Full access to all channels, roles, and features!', inline: false }
            )
            .setThumbnail(guildIcon)
            .setFooter({ text: 'Skyfall Verification System' })
            .setTimestamp();

        return embed;
    }
}

module.exports = {
    ModernEmbedBuilder,
    COLORS,
    EMOJIS
};
