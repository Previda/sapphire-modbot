const { EmbedBuilder } = require('discord.js');
const { createCase } = require('../utils/caseManager');
const { getGuildConfig } = require('../commands/admin/setup');

class AutoModerationModule {
    constructor() {
        this.filters = {
            spam: new SpamFilter(),
            toxicity: new ToxicityFilter(),
            links: new LinkFilter(),
            caps: new CapsFilter(),
            zalgo: new ZalgoFilter()
        };
        this.userWarnings = new Map();
    }

    async processMessage(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        try {
            const config = await getGuildConfig(message.guild.id);
            if (!config.automod.enabled) return;

            const violations = [];
            
            // Check each filter
            for (const [filterName, filter] of Object.entries(this.filters)) {
                if (await filter.check(message, config)) {
                    violations.push({
                        type: filterName,
                        severity: filter.severity,
                        action: filter.action
                    });
                }
            }

            if (violations.length > 0) {
                await this.handleViolations(message, violations, config);
            }

        } catch (error) {
            console.error('AutoMod processing error:', error);
        }
    }

    async handleViolations(message, violations, config) {
        // Sort by severity (highest first)
        violations.sort((a, b) => b.severity - a.severity);
        const highestViolation = violations[0];

        // Track user warnings
        const userId = message.author.id;
        const guildId = message.guild.id;
        const userKey = `${guildId}-${userId}`;

        if (!this.userWarnings.has(userKey)) {
            this.userWarnings.set(userKey, { count: 0, lastWarning: Date.now() });
        }

        const userWarnings = this.userWarnings.get(userKey);
        
        // Reset warnings if last one was over 24 hours ago
        if (Date.now() - userWarnings.lastWarning > 24 * 60 * 60 * 1000) {
            userWarnings.count = 0;
        }

        userWarnings.count++;
        userWarnings.lastWarning = Date.now();

        // Delete the violating message
        try {
            await message.delete();
        } catch (error) {
            console.log('Could not delete message:', error.message);
        }

        // Determine action based on warning count and severity
        let action = 'warn';
        let duration = null;

        if (userWarnings.count >= config.automod.warnThreshold) {
            if (highestViolation.severity >= 8) {
                action = 'ban';
            } else if (highestViolation.severity >= 6) {
                action = 'timeout';
                duration = 60 * 60; // 1 hour
            } else if (highestViolation.severity >= 4) {
                action = 'timeout';
                duration = 30 * 60; // 30 minutes
            }
        }

        // Create case
        const newCase = await createCase({
            type: action,
            userId: userId,
            moderatorId: message.client.user.id,
            guildId: guildId,
            reason: `AutoMod: ${violations.map(v => v.type).join(', ')} violation(s)`,
            status: 'active',
            appealable: true,
            duration: duration,
            automod: true
        });

        // Execute the action
        await this.executeAction(message, action, duration, newCase, violations);

        // Log to moderation channel
        await this.logAction(message, violations, action, newCase, config);
    }

    async executeAction(message, action, duration, caseData, violations) {
        const member = message.member;
        if (!member) return;

        try {
            switch (action) {
                case 'timeout':
                    if (member.moderatable) {
                        await member.timeout(duration * 1000, `AutoMod: ${caseData.reason} | Case: ${caseData.caseId}`);
                    }
                    break;
                case 'ban':
                    if (member.bannable) {
                        await member.ban({ reason: `AutoMod: ${caseData.reason} | Case: ${caseData.caseId}` });
                    }
                    break;
                case 'warn':
                    // Warning handled in logging
                    break;
            }

            // Send DM to user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle(`🤖 AutoMod Action: ${action.charAt(0).toUpperCase() + action.slice(1)}`)
                    .setColor(action === 'ban' ? 0xff0000 : action === 'timeout' ? 0xff6600 : 0xffff00)
                    .addFields(
                        { name: '🏢 Server', value: message.guild.name, inline: true },
                        { name: '🆔 Case ID', value: caseData.caseId, inline: true },
                        { name: '⚠️ Violations', value: violations.map(v => v.type).join(', '), inline: true },
                        { name: '📝 Reason', value: caseData.reason, inline: false },
                        { name: '📋 Appeal', value: `Use \`/appeal submit case_id:${caseData.caseId}\` if you believe this is unfair`, inline: false }
                    )
                    .setTimestamp();

                if (duration) {
                    dmEmbed.addFields({ name: '⏱️ Duration', value: `${Math.round(duration / 60)} minutes`, inline: true });
                }

                await message.author.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log(`Could not DM user ${message.author.tag}: ${error.message}`);
            }

        } catch (error) {
            console.error('Error executing automod action:', error);
        }
    }

    async logAction(message, violations, action, caseData, config) {
        if (!config.modlog) return;

        const channel = message.guild.channels.cache.get(config.modlog);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle('🤖 AutoMod Action')
            .setColor(action === 'ban' ? 0xff0000 : action === 'timeout' ? 0xff6600 : 0xffff00)
            .addFields(
                { name: '👤 User', value: `${message.author.tag}\n\`${message.author.id}\``, inline: true },
                { name: '📍 Channel', value: message.channel.toString(), inline: true },
                { name: '🚨 Action', value: action.charAt(0).toUpperCase() + action.slice(1), inline: true },
                { name: '🆔 Case ID', value: caseData.caseId, inline: true },
                { name: '⚠️ Violations', value: violations.map(v => `**${v.type}** (${v.severity}/10)`).join('\n'), inline: true },
                { name: '💬 Original Message', value: message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content || '*No content*', inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp();

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging automod action:', error);
        }
    }
}

class SpamFilter {
    constructor() {
        this.severity = 5;
        this.action = 'timeout';
        this.userMessages = new Map();
    }

    async check(message, config) {
        const userId = message.author.id;
        const now = Date.now();
        
        if (!this.userMessages.has(userId)) {
            this.userMessages.set(userId, []);
        }

        const userMessages = this.userMessages.get(userId);
        
        // Remove messages older than 10 seconds
        const recentMessages = userMessages.filter(timestamp => now - timestamp < 10000);
        
        // Add current message
        recentMessages.push(now);
        this.userMessages.set(userId, recentMessages);

        // Check if more than 5 messages in 10 seconds
        return recentMessages.length > 5;
    }
}

class ToxicityFilter {
    constructor() {
        this.severity = 7;
        this.action = 'timeout';
        this.toxicWords = [
            'idiot', 'stupid', 'dumb', 'retard', 'moron',
            'kill yourself', 'kys', 'die', 'cancer',
            // Add more words as needed
        ];
    }

    async check(message, config) {
        const content = message.content.toLowerCase();
        return this.toxicWords.some(word => content.includes(word));
    }
}

class LinkFilter {
    constructor() {
        this.severity = 3;
        this.action = 'warn';
    }

    async check(message, config) {
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        return urlRegex.test(message.content);
    }
}

class CapsFilter {
    constructor() {
        this.severity = 2;
        this.action = 'warn';
    }

    async check(message, config) {
        const content = message.content;
        if (content.length < 10) return false;
        
        const upperCount = (content.match(/[A-Z]/g) || []).length;
        const totalLetters = (content.match(/[a-zA-Z]/g) || []).length;
        
        return totalLetters > 0 && (upperCount / totalLetters) > 0.7;
    }
}

class ZalgoFilter {
    constructor() {
        this.severity = 4;
        this.action = 'warn';
    }

    async check(message, config) {
        // Check for excessive unicode combining characters (zalgo text)
        const zalgoRegex = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufeff]/g;
        const zalgoMatches = message.content.match(zalgoRegex);
        return zalgoMatches && zalgoMatches.length > 10;
    }
}

module.exports = { AutoModerationModule };
