const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

/**
 * Advanced Auto-Moderation System (Wick-Level)
 * Features: Anti-spam, Anti-raid, Anti-nuke, Anti-invite, Anti-link, Caps/Emoji flood, Mention spam
 */
class AdvancedAutomod {
    constructor(client) {
        this.client = client;
        this.userViolations = new Map(); // userId -> { spam: [], mentions: [], caps: [], etc }
        this.raidDetection = new Map(); // guildId -> { joins: [], timestamp }
        this.messageCache = new Map(); // userId -> [messages]
        
        // Cleanup old data every 5 minutes
        setInterval(() => this.cleanup(), 300000);
    }

    /**
     * Initialize automod event listeners
     */
    initialize() {
        // Message monitoring
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot || !message.guild) return;
            await this.checkMessage(message);
        });

        // Member join monitoring (raid detection)
        this.client.on('guildMemberAdd', async (member) => {
            await this.checkRaid(member);
        });

        // Anti-nuke: Channel/Role deletion monitoring
        this.client.on('channelDelete', async (channel) => {
            await this.checkNuke(channel.guild, 'channel_delete', channel);
        });

        this.client.on('roleDelete', async (role) => {
            await this.checkNuke(role.guild, 'role_delete', role);
        });

        // Anti-nuke: Mass ban monitoring
        this.client.on('guildBanAdd', async (ban) => {
            await this.checkNuke(ban.guild, 'mass_ban', ban);
        });

        // Anti-nuke: Mass kick monitoring
        this.client.on('guildMemberRemove', async (member) => {
            if (member.user.bot) return;
            await this.checkNuke(member.guild, 'mass_kick', member);
        });

        console.log('✅ Advanced Auto-Moderation System initialized');
    }

    /**
     * Check message for violations
     */
    async checkMessage(message) {
        try {
            const config = await this.getGuildConfig(message.guild.id);
            if (!config || !config.enabled) return;

            // Ignore whitelisted roles/channels
            if (this.isWhitelisted(message.member, message.channel, config)) return;

            const violations = [];

            // 1. Anti-Spam Detection
            if (config.antiSpam) {
                const spamCheck = await this.checkSpam(message);
                if (spamCheck.violation) violations.push(spamCheck);
            }

            // 2. Anti-Invite Detection
            if (config.antiInvite) {
                const inviteCheck = this.checkInvites(message);
                if (inviteCheck.violation) violations.push(inviteCheck);
            }

            // 3. Anti-Link Detection
            if (config.antiLink) {
                const linkCheck = this.checkLinks(message);
                if (linkCheck.violation) violations.push(linkCheck);
            }

            // 4. Caps Flood Detection
            if (config.capsFlood) {
                const capsCheck = this.checkCapsFlood(message);
                if (capsCheck.violation) violations.push(capsCheck);
            }

            // 5. Emoji Flood Detection
            if (config.emojiFlood) {
                const emojiCheck = this.checkEmojiFlood(message);
                if (emojiCheck.violation) violations.push(emojiCheck);
            }

            // 6. Mention Spam Detection
            if (config.mentionSpam) {
                const mentionCheck = this.checkMentionSpam(message);
                if (mentionCheck.violation) violations.push(mentionCheck);
            }

            // 7. NSFW Content Detection
            if (config.antiNSFW) {
                const nsfwCheck = this.checkNSFW(message);
                if (nsfwCheck.violation) violations.push(nsfwCheck);
            }

            // 8. Zalgo Text Detection
            if (config.antiZalgo) {
                const zalgoCheck = this.checkZalgo(message);
                if (zalgoCheck.violation) violations.push(zalgoCheck);
            }

            // Handle violations
            if (violations.length > 0) {
                await this.handleViolations(message, violations, config);
            }

        } catch (error) {
            console.error('Automod check error:', error);
        }
    }

    /**
     * Anti-Spam: Detect message spam
     */
    async checkSpam(message) {
        const userId = message.author.id;
        const now = Date.now();
        
        if (!this.messageCache.has(userId)) {
            this.messageCache.set(userId, []);
        }

        const userMessages = this.messageCache.get(userId);
        
        // Add current message
        userMessages.push({
            content: message.content,
            timestamp: now,
            channelId: message.channel.id
        });

        // Remove messages older than 10 seconds
        const recentMessages = userMessages.filter(m => now - m.timestamp < 10000);
        this.messageCache.set(userId, recentMessages);

        // Check for spam (5+ messages in 10 seconds)
        if (recentMessages.length >= 5) {
            return {
                violation: true,
                type: 'spam',
                severity: 'medium',
                details: `${recentMessages.length} messages in 10 seconds`
            };
        }

        // Check for duplicate messages (3+ identical in 30 seconds)
        const duplicates = recentMessages.filter(m => 
            m.content === message.content && now - m.timestamp < 30000
        );
        
        if (duplicates.length >= 3) {
            return {
                violation: true,
                type: 'duplicate_spam',
                severity: 'high',
                details: 'Repeated identical messages'
            };
        }

        return { violation: false };
    }

    /**
     * Anti-Invite: Detect Discord invites
     */
    checkInvites(message) {
        const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+/gi;
        const matches = message.content.match(inviteRegex);

        if (matches && matches.length > 0) {
            return {
                violation: true,
                type: 'invite',
                severity: 'high',
                details: `Posted ${matches.length} invite link(s)`
            };
        }

        return { violation: false };
    }

    /**
     * Anti-Link: Detect external links
     */
    checkLinks(message) {
        const linkRegex = /(https?:\/\/[^\s]+)/gi;
        const matches = message.content.match(linkRegex);

        if (matches && matches.length > 0) {
            // Filter out Discord links if anti-invite is separate
            const nonDiscordLinks = matches.filter(link => 
                !link.includes('discord.gg') && 
                !link.includes('discord.com') &&
                !link.includes('discordapp.com')
            );

            if (nonDiscordLinks.length > 0) {
                return {
                    violation: true,
                    type: 'external_link',
                    severity: 'medium',
                    details: `Posted ${nonDiscordLinks.length} external link(s)`
                };
            }
        }

        return { violation: false };
    }

    /**
     * Caps Flood: Detect excessive caps
     */
    checkCapsFlood(message) {
        if (message.content.length < 10) return { violation: false };

        const capsCount = (message.content.match(/[A-Z]/g) || []).length;
        const totalChars = message.content.replace(/\s/g, '').length;
        const capsPercentage = (capsCount / totalChars) * 100;

        if (capsPercentage > 70 && totalChars > 10) {
            return {
                violation: true,
                type: 'caps_flood',
                severity: 'low',
                details: `${Math.round(capsPercentage)}% caps`
            };
        }

        return { violation: false };
    }

    /**
     * Emoji Flood: Detect excessive emojis
     */
    checkEmojiFlood(message) {
        const emojiRegex = /<a?:\w+:\d+>|[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const emojis = message.content.match(emojiRegex) || [];

        if (emojis.length > 10) {
            return {
                violation: true,
                type: 'emoji_flood',
                severity: 'low',
                details: `${emojis.length} emojis`
            };
        }

        return { violation: false };
    }

    /**
     * Mention Spam: Detect excessive mentions
     */
    checkMentionSpam(message) {
        const mentions = message.mentions.users.size + message.mentions.roles.size;

        if (mentions > 5) {
            return {
                violation: true,
                type: 'mention_spam',
                severity: 'high',
                details: `${mentions} mentions`
            };
        }

        // Check for @everyone/@here abuse
        if (message.mentions.everyone) {
            return {
                violation: true,
                type: 'everyone_mention',
                severity: 'critical',
                details: 'Used @everyone or @here'
            };
        }

        return { violation: false };
    }

    /**
     * Anti-NSFW: Detect NSFW keywords
     */
    checkNSFW(message) {
        // Basic NSFW keyword detection (expand as needed)
        const nsfwKeywords = ['porn', 'xxx', 'nsfw', 'sex', 'nude', 'naked'];
        const content = message.content.toLowerCase();

        for (const keyword of nsfwKeywords) {
            if (content.includes(keyword)) {
                return {
                    violation: true,
                    type: 'nsfw_content',
                    severity: 'high',
                    details: 'NSFW keyword detected'
                };
            }
        }

        return { violation: false };
    }

    /**
     * Anti-Zalgo: Detect zalgo text
     */
    checkZalgo(message) {
        const zalgoRegex = /[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]{3,}/g;
        
        if (zalgoRegex.test(message.content)) {
            return {
                violation: true,
                type: 'zalgo_text',
                severity: 'medium',
                details: 'Zalgo/combining characters detected'
            };
        }

        return { violation: false };
    }

    /**
     * Raid Detection: Monitor rapid member joins
     */
    async checkRaid(member) {
        try {
            const config = await this.getGuildConfig(member.guild.id);
            if (!config || !config.antiRaid) return;

            const guildId = member.guild.id;
            const now = Date.now();

            if (!this.raidDetection.has(guildId)) {
                this.raidDetection.set(guildId, { joins: [], lastAlert: 0 });
            }

            const raidData = this.raidDetection.get(guildId);
            
            // Add join
            raidData.joins.push({
                userId: member.id,
                timestamp: now,
                accountAge: now - member.user.createdTimestamp
            });

            // Remove joins older than 60 seconds
            raidData.joins = raidData.joins.filter(j => now - j.timestamp < 60000);

            // Check for raid (10+ joins in 60 seconds)
            if (raidData.joins.length >= 10) {
                // Check if we already alerted recently (don't spam)
                if (now - raidData.lastAlert > 300000) { // 5 minutes
                    await this.handleRaid(member.guild, raidData.joins, config);
                    raidData.lastAlert = now;
                }
            }

        } catch (error) {
            console.error('Raid detection error:', error);
        }
    }

    /**
     * Anti-Nuke: Detect mass deletions/bans
     */
    async checkNuke(guild, type, target) {
        try {
            const config = await this.getGuildConfig(guild.id);
            if (!config || !config.antiNuke) return;

            // Get audit log to find who performed the action
            const auditLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: this.getAuditLogType(type)
            });

            const entry = auditLogs.entries.first();
            if (!entry) return;

            const executor = entry.executor;
            
            // Don't trigger on bot owner or whitelisted users
            if (this.isNukeWhitelisted(executor, config)) return;

            // Track actions by this user
            const key = `${guild.id}-${executor.id}-${type}`;
            const now = Date.now();
            
            if (!this.userViolations.has(key)) {
                this.userViolations.set(key, []);
            }

            const actions = this.userViolations.get(key);
            actions.push(now);

            // Remove actions older than 10 seconds
            const recentActions = actions.filter(t => now - t < 10000);
            this.userViolations.set(key, recentActions);

            // Trigger if 3+ actions in 10 seconds
            if (recentActions.length >= 3) {
                await this.handleNuke(guild, executor, type, recentActions.length, config);
            }

        } catch (error) {
            console.error('Anti-nuke error:', error);
        }
    }

    /**
     * Handle message violations
     */
    async handleViolations(message, violations, config) {
        try {
            // Delete message
            await message.delete().catch(() => {});

            // Track user violations
            const userId = message.author.id;
            if (!this.userViolations.has(userId)) {
                this.userViolations.set(userId, { count: 0, lastViolation: Date.now() });
            }

            const userViolationData = this.userViolations.get(userId);
            userViolationData.count++;
            userViolationData.lastViolation = Date.now();

            // Determine action based on violation count
            let action = 'warn';
            if (userViolationData.count >= config.muteThreshold) {
                action = 'mute';
            } else if (userViolationData.count >= config.kickThreshold) {
                action = 'kick';
            } else if (userViolationData.count >= config.banThreshold) {
                action = 'ban';
            }

            // Execute action
            await this.executeAction(message.member, action, violations, config);

            // Log to mod channel
            await this.logViolation(message, violations, action, config);

        } catch (error) {
            console.error('Handle violations error:', error);
        }
    }

    /**
     * Execute moderation action
     */
    async executeAction(member, action, violations, config) {
        try {
            const reason = `Automod: ${violations.map(v => v.type).join(', ')}`;

            switch (action) {
                case 'warn':
                    // Send warning DM
                    await member.send({
                        embeds: [new EmbedBuilder()
                            .setTitle('⚠️ Automod Warning')
                            .setDescription(`You have been warned in **${member.guild.name}**`)
                            .addFields(
                                { name: 'Violations', value: violations.map(v => `• ${v.type}: ${v.details}`).join('\n') }
                            )
                            .setColor(0xffaa00)
                            .setTimestamp()]
                    }).catch(() => {});
                    break;

                case 'mute':
                    await member.timeout(config.muteDuration * 1000, reason);
                    break;

                case 'kick':
                    await member.kick(reason);
                    break;

                case 'ban':
                    await member.ban({ reason, deleteMessageSeconds: 86400 });
                    break;
            }

        } catch (error) {
            console.error('Execute action error:', error);
        }
    }

    /**
     * Handle raid detection
     */
    async handleRaid(guild, joins, config) {
        try {
            // Enable verification level
            if (config.raidAction === 'lockdown') {
                await guild.setVerificationLevel(4); // Highest verification
            }

            // Kick recent joins if configured
            if (config.raidAction === 'kick_new') {
                for (const join of joins) {
                    const member = await guild.members.fetch(join.userId).catch(() => null);
                    if (member && join.accountAge < 86400000) { // Account < 1 day old
                        await member.kick('Automod: Raid detection - new account');
                    }
                }
            }

            // Log raid alert
            const logChannel = guild.channels.cache.get(config.logChannelId);
            if (logChannel) {
                await logChannel.send({
                    embeds: [new EmbedBuilder()
                        .setTitle('🚨 RAID DETECTED')
                        .setDescription(`**${joins.length}** members joined in the last 60 seconds!`)
                        .addFields(
                            { name: 'Action Taken', value: config.raidAction || 'Alert only' },
                            { name: 'New Accounts', value: `${joins.filter(j => j.accountAge < 86400000).length}` }
                        )
                        .setColor(0xff0000)
                        .setTimestamp()]
                });
            }

        } catch (error) {
            console.error('Handle raid error:', error);
        }
    }

    /**
     * Handle nuke detection
     */
    async handleNuke(guild, executor, type, actionCount, config) {
        try {
            // Remove dangerous permissions from executor
            const member = await guild.members.fetch(executor.id).catch(() => null);
            if (member) {
                const dangerousPerms = [
                    PermissionFlagsBits.Administrator,
                    PermissionFlagsBits.ManageGuild,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageRoles,
                    PermissionFlagsBits.BanMembers,
                    PermissionFlagsBits.KickMembers
                ];

                // Remove roles with dangerous permissions
                for (const role of member.roles.cache.values()) {
                    if (role.permissions.any(dangerousPerms) && role.position < guild.members.me.roles.highest.position) {
                        await member.roles.remove(role, 'Automod: Anti-nuke triggered');
                    }
                }

                // Ban if configured
                if (config.nukeAction === 'ban') {
                    await member.ban({ reason: `Automod: Anti-nuke - ${type} (${actionCount} actions)` });
                }
            }

            // Log nuke alert
            const logChannel = guild.channels.cache.get(config.logChannelId);
            if (logChannel) {
                await logChannel.send({
                    embeds: [new EmbedBuilder()
                        .setTitle('🚨 ANTI-NUKE TRIGGERED')
                        .setDescription(`**${executor.tag}** performed **${actionCount}** ${type.replace('_', ' ')} actions in 10 seconds!`)
                        .addFields(
                            { name: 'User', value: `${executor} (${executor.id})`, inline: true },
                            { name: 'Action Type', value: type.replace('_', ' '), inline: true },
                            { name: 'Count', value: `${actionCount}`, inline: true },
                            { name: 'Response', value: config.nukeAction || 'Permissions removed' }
                        )
                        .setColor(0xff0000)
                        .setTimestamp()]
                });
            }

        } catch (error) {
            console.error('Handle nuke error:', error);
        }
    }

    /**
     * Log violation to mod channel
     */
    async logViolation(message, violations, action, config) {
        try {
            const logChannel = message.guild.channels.cache.get(config.logChannelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('⚠️ Automod Action')
                .setDescription(`Action taken against ${message.author}`)
                .addFields(
                    { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Channel', value: `${message.channel}`, inline: true },
                    { name: 'Action', value: action.toUpperCase(), inline: true },
                    { name: 'Violations', value: violations.map(v => `• **${v.type}**: ${v.details} (${v.severity})`).join('\n') },
                    { name: 'Message Content', value: message.content.substring(0, 1000) || '*No content*' }
                )
                .setColor(this.getColorForAction(action))
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Log violation error:', error);
        }
    }

    /**
     * Check if user/channel is whitelisted
     */
    isWhitelisted(member, channel, config) {
        if (!config.whitelist) return false;

        // Check whitelisted roles
        if (config.whitelist.roles) {
            for (const roleId of config.whitelist.roles) {
                if (member.roles.cache.has(roleId)) return true;
            }
        }

        // Check whitelisted channels
        if (config.whitelist.channels && config.whitelist.channels.includes(channel.id)) {
            return true;
        }

        // Check if user has admin perms
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            return true;
        }

        return false;
    }

    /**
     * Check if user is whitelisted for nuke protection
     */
    isNukeWhitelisted(user, config) {
        if (!config.nukeWhitelist) return false;
        return config.nukeWhitelist.includes(user.id);
    }

    /**
     * Get guild automod configuration
     */
    async getGuildConfig(guildId) {
        // This would fetch from database in production
        // For now, return default config
        return {
            enabled: true,
            antiSpam: true,
            antiInvite: true,
            antiLink: false,
            capsFlood: true,
            emojiFlood: true,
            mentionSpam: true,
            antiNSFW: true,
            antiZalgo: true,
            antiRaid: true,
            antiNuke: true,
            warnThreshold: 2,
            muteThreshold: 4,
            kickThreshold: 6,
            banThreshold: 8,
            muteDuration: 600,
            raidAction: 'lockdown',
            nukeAction: 'remove_perms',
            logChannelId: null,
            whitelist: {
                roles: [],
                channels: []
            },
            nukeWhitelist: []
        };
    }

    /**
     * Get audit log type for nuke detection
     */
    getAuditLogType(type) {
        const types = {
            'channel_delete': 12,
            'role_delete': 32,
            'mass_ban': 22,
            'mass_kick': 20
        };
        return types[type] || 1;
    }

    /**
     * Get color for action
     */
    getColorForAction(action) {
        const colors = {
            warn: 0xffaa00,
            mute: 0xff6600,
            kick: 0xff3300,
            ban: 0xff0000
        };
        return colors[action] || 0x0099ff;
    }

    /**
     * Cleanup old data
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 3600000; // 1 hour

        // Clean message cache
        for (const [userId, messages] of this.messageCache.entries()) {
            const recent = messages.filter(m => now - m.timestamp < maxAge);
            if (recent.length === 0) {
                this.messageCache.delete(userId);
            } else {
                this.messageCache.set(userId, recent);
            }
        }

        // Clean violations
        for (const [key, data] of this.userViolations.entries()) {
            if (Array.isArray(data)) {
                const recent = data.filter(t => now - t < maxAge);
                if (recent.length === 0) {
                    this.userViolations.delete(key);
                } else {
                    this.userViolations.set(key, recent);
                }
            } else if (now - data.lastViolation > maxAge) {
                this.userViolations.delete(key);
            }
        }

        // Clean raid detection
        for (const [guildId, data] of this.raidDetection.entries()) {
            const recent = data.joins.filter(j => now - j.timestamp < maxAge);
            if (recent.length === 0) {
                this.raidDetection.delete(guildId);
            } else {
                data.joins = recent;
            }
        }
    }
}

module.exports = AdvancedAutomod;
