const { EmbedBuilder, PermissionFlagsBits, AuditLogEvent } = require('discord.js');
const { logEvent } = require('./logger');

// Anti-nuke tracking
const nukeTracking = new Map();
const actionCooldowns = new Map();

// Configuration
const NUKE_CONFIG = {
    // Action limits within time window
    limits: {
        channelDelete: { count: 3, window: 60000 },    // 3 deletions in 1 minute
        channelCreate: { count: 5, window: 60000 },    // 5 creates in 1 minute
        roleDelete: { count: 3, window: 60000 },       // 3 role deletions
        roleCreate: { count: 5, window: 60000 },       // 5 role creates
        memberKick: { count: 5, window: 60000 },       // 5 kicks
        memberBan: { count: 5, window: 60000 },        // 5 bans
        webhook: { count: 3, window: 60000 },          // 3 webhook actions
        emoji: { count: 10, window: 60000 }            // 10 emoji changes
    },
    autoResponse: {
        enabled: true,
        removePerms: true,
        kickUser: false,    // Be careful with this
        alertMods: true
    }
};

class AntiNukeSystem {
    constructor(client) {
        this.client = client;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Channel events
        this.client.on('channelDelete', (channel) => this.trackAction(channel.guild, 'channelDelete'));
        this.client.on('channelCreate', (channel) => this.trackAction(channel.guild, 'channelCreate'));
        
        // Role events
        this.client.on('roleDelete', (role) => this.trackAction(role.guild, 'roleDelete'));
        this.client.on('roleCreate', (role) => this.trackAction(role.guild, 'roleCreate'));
        
        // Member events
        this.client.on('guildMemberRemove', async (member) => {
            // Check if it was a kick or ban via audit log
            await this.checkMemberRemoval(member);
        });
        
        // Webhook events
        this.client.on('webhookUpdate', (channel) => this.trackAction(channel.guild, 'webhook'));
        
        // Emoji events
        this.client.on('emojiDelete', (emoji) => this.trackAction(emoji.guild, 'emoji'));
        this.client.on('emojiCreate', (emoji) => this.trackAction(emoji.guild, 'emoji'));
    }

    async trackAction(guild, actionType, executor = null) {
        if (!guild) return;

        const guildId = guild.id;
        const now = Date.now();

        // Initialize tracking for guild
        if (!nukeTracking.has(guildId)) {
            nukeTracking.set(guildId, new Map());
        }

        const guildTracking = nukeTracking.get(guildId);

        // Get executor from audit log if not provided
        if (!executor) {
            executor = await this.getAuditLogExecutor(guild, actionType);
        }

        if (!executor) return; // Couldn't determine executor

        const executorId = executor.id;

        // Initialize user tracking
        if (!guildTracking.has(executorId)) {
            guildTracking.set(executorId, new Map());
        }

        const userTracking = guildTracking.get(executorId);

        // Initialize action type tracking
        if (!userTracking.has(actionType)) {
            userTracking.set(actionType, []);
        }

        const actionHistory = userTracking.get(actionType);
        const config = NUKE_CONFIG.limits[actionType];

        if (!config) return;

        // Add current action
        actionHistory.push(now);

        // Clean old actions (outside time window)
        const recentActions = actionHistory.filter(timestamp => 
            now - timestamp <= config.window
        );
        userTracking.set(actionType, recentActions);

        // Check if limit exceeded
        if (recentActions.length >= config.count) {
            await this.triggerNukeProtection(guild, executor, actionType, recentActions.length);
        }
    }

    async getAuditLogExecutor(guild, actionType) {
        try {
            const auditEventMap = {
                'channelDelete': AuditLogEvent.ChannelDelete,
                'channelCreate': AuditLogEvent.ChannelCreate,
                'roleDelete': AuditLogEvent.RoleDelete,
                'roleCreate': AuditLogEvent.RoleCreate,
                'memberKick': AuditLogEvent.MemberKick,
                'memberBan': AuditLogEvent.MemberBanAdd,
                'webhook': AuditLogEvent.WebhookCreate,
                'emoji': AuditLogEvent.EmojiDelete
            };

            const auditEvent = auditEventMap[actionType];
            if (!auditEvent) return null;

            const auditLogs = await guild.fetchAuditLogs({
                type: auditEvent,
                limit: 1
            });

            const entry = auditLogs.entries.first();
            return entry?.executor || null;

        } catch (error) {
            console.error('Error fetching audit logs:', error);
            return null;
        }
    }

    async checkMemberRemoval(member) {
        try {
            const auditLogs = await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberKick,
                limit: 5
            });

            const kickEntry = auditLogs.entries.find(entry => 
                entry.target?.id === member.id &&
                Date.now() - entry.createdTimestamp < 5000 // Within 5 seconds
            );

            if (kickEntry) {
                await this.trackAction(member.guild, 'memberKick', kickEntry.executor);
            }

            // Check for bans
            const banLogs = await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 5
            });

            const banEntry = banLogs.entries.find(entry => 
                entry.target?.id === member.id &&
                Date.now() - entry.createdTimestamp < 5000
            );

            if (banEntry) {
                await this.trackAction(member.guild, 'memberBan', banEntry.executor);
            }

        } catch (error) {
            console.error('Error checking member removal:', error);
        }
    }

    async triggerNukeProtection(guild, executor, actionType, actionCount) {
        const nukeId = `${guild.id}-${executor.id}-${Date.now()}`;
        
        // Check cooldown to prevent spam
        const cooldownKey = `${guild.id}-${executor.id}`;
        if (actionCooldowns.has(cooldownKey)) {
            const lastTrigger = actionCooldowns.get(cooldownKey);
            if (Date.now() - lastTrigger < 30000) return; // 30 second cooldown
        }
        actionCooldowns.set(cooldownKey, Date.now());

        const nukeData = {
            id: nukeId,
            guild: guild,
            executor: executor,
            actionType: actionType,
            actionCount: actionCount,
            timestamp: new Date(),
            severity: this.calculateNukeSeverity(actionType, actionCount)
        };

        // Execute protection response
        await this.executeNukeResponse(nukeData);
    }

    calculateNukeSeverity(actionType, count) {
        const severityMap = {
            'channelDelete': 3,
            'roleDelete': 4,
            'memberBan': 3,
            'memberKick': 2,
            'channelCreate': 2,
            'roleCreate': 2,
            'webhook': 3,
            'emoji': 1
        };

        const baseScore = (severityMap[actionType] || 1) * count;
        
        if (baseScore >= 15) return 'CRITICAL';
        if (baseScore >= 10) return 'HIGH';
        if (baseScore >= 6) return 'MEDIUM';
        return 'LOW';
    }

    async executeNukeResponse(nukeData) {
        const { guild, executor, actionType, actionCount, severity } = nukeData;

        try {
            // Create alert embed
            const alertEmbed = new EmbedBuilder()
                .setTitle('🛡️ ANTI-NUKE PROTECTION TRIGGERED')
                .setColor(this.getSeverityColor(severity))
                .setDescription(`**Potential nuke attempt detected!**`)
                .addFields(
                    { name: '👤 User', value: `${executor} (${executor.tag})`, inline: true },
                    { name: '⚡ Action', value: this.getActionDisplay(actionType), inline: true },
                    { name: '📊 Count', value: `${actionCount} actions`, inline: true },
                    { name: '🚨 Severity', value: `**${severity}**`, inline: true },
                    { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '🆔 User ID', value: `${executor.id}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Nuke Protection • ID: ${nukeData.id}` });

            // Take automatic action if configured
            if (NUKE_CONFIG.autoResponse.enabled) {
                const actions = await this.takeAutomaticAction(guild, executor, severity);
                if (actions.length > 0) {
                    alertEmbed.addFields({
                        name: '🔨 Auto-Actions Taken',
                        value: actions.join('\n'),
                        inline: false
                    });
                }
            }

            // Log the nuke attempt
            await logEvent(guild, {
                type: 'ANTI_NUKE_TRIGGERED',
                executor: this.client.user,
                target: executor,
                reason: `Nuke protection: ${actionCount}x ${actionType}, severity: ${severity}`,
                embed: alertEmbed,
                timestamp: new Date()
            });

            // Alert moderators
            if (NUKE_CONFIG.autoResponse.alertMods) {
                await this.alertModerators(guild, alertEmbed, nukeData);
            }

        } catch (error) {
            console.error('Error executing nuke response:', error);
        }
    }

    async takeAutomaticAction(guild, user, severity) {
        const actions = [];
        const member = guild.members.cache.get(user.id);

        try {
            // Remove dangerous permissions
            if (NUKE_CONFIG.autoResponse.removePerms && member) {
                const dangerousPerms = [
                    PermissionFlagsBits.Administrator,
                    PermissionFlagsBits.ManageGuild,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageRoles,
                    PermissionFlagsBits.KickMembers,
                    PermissionFlagsBits.BanMembers,
                    PermissionFlagsBits.ManageWebhooks
                ];

                for (const role of member.roles.cache.values()) {
                    if (role.permissions.any(dangerousPerms) && role.editable) {
                        const newPermissions = role.permissions.remove(dangerousPerms);
                        await role.setPermissions(newPermissions, 'Anti-nuke: Removed dangerous permissions');
                        actions.push(`🔒 Removed dangerous permissions from role: ${role.name}`);
                    }
                }
            }

            // Timeout user (safer than kicking)
            if (member && member.moderatable && (severity === 'HIGH' || severity === 'CRITICAL')) {
                await member.timeout(10 * 60 * 1000, 'Anti-nuke: Suspicious activity detected');
                actions.push('⏸️ User timed out for 10 minutes');
            }

            // Kick user only in critical situations and if explicitly enabled
            if (NUKE_CONFIG.autoResponse.kickUser && member?.kickable && severity === 'CRITICAL') {
                await member.kick('Anti-nuke: Critical threat detected');
                actions.push('👢 User kicked from server');
            }

        } catch (error) {
            console.error('Error taking automatic action:', error);
            actions.push('❌ Some auto-actions failed');
        }

        return actions;
    }

    async alertModerators(guild, embed, nukeData) {
        // Find appropriate channel
        const channels = ['security-logs', 'mod-logs', 'admin-logs', 'staff-logs'];
        let alertChannel = null;

        for (const channelName of channels) {
            alertChannel = guild.channels.cache.find(ch => 
                ch.name.toLowerCase().includes(channelName) && 
                ch.type === 0
            );
            if (alertChannel) break;
        }

        if (!alertChannel) {
            // Find channel with appropriate permissions
            alertChannel = guild.channels.cache.find(ch => 
                ch.type === 0 && 
                ch.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages)
            );
        }

        if (alertChannel) {
            try {
                await alertChannel.send({
                    content: '🚨 **NUKE PROTECTION ALERT** - Immediate admin attention required! @here',
                    embeds: [embed]
                });
            } catch (error) {
                console.error('Failed to send nuke alert:', error);
            }
        }
    }

    getActionDisplay(actionType) {
        const displays = {
            'channelDelete': '🗑️ Channel Deletions',
            'channelCreate': '➕ Channel Creations',
            'roleDelete': '🗑️ Role Deletions',
            'roleCreate': '➕ Role Creations',
            'memberKick': '👢 Member Kicks',
            'memberBan': '🔨 Member Bans',
            'webhook': '🔗 Webhook Actions',
            'emoji': '😀 Emoji Changes'
        };
        return displays[actionType] || actionType;
    }

    getSeverityColor(severity) {
        const colors = {
            'LOW': '#FFA726',      // Orange
            'MEDIUM': '#FF7043',   // Deep Orange  
            'HIGH': '#F44336',     // Red
            'CRITICAL': '#8E24AA'  // Purple
        };
        return colors[severity] || '#95A5A6';
    }

    // Public method to get nuke statistics
    getNukeStats(guildId) {
        const guildTracking = nukeTracking.get(guildId);
        if (!guildTracking) return { totalUsers: 0, totalActions: 0 };

        let totalActions = 0;
        for (const userActions of guildTracking.values()) {
            for (const actionList of userActions.values()) {
                totalActions += actionList.length;
            }
        }

        return {
            totalUsers: guildTracking.size,
            totalActions: totalActions
        };
    }

    // Method to whitelist users (for trusted admins)
    setWhitelist(guildId, userId, whitelisted = true) {
        // Implementation for whitelisting trusted users
        const key = `whitelist-${guildId}`;
        if (!nukeTracking.has(key)) {
            nukeTracking.set(key, new Set());
        }
        
        const whitelist = nukeTracking.get(key);
        if (whitelisted) {
            whitelist.add(userId);
        } else {
            whitelist.delete(userId);
        }
    }
}

module.exports = AntiNukeSystem;
