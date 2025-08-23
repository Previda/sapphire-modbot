const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logEvent } = require('./logger');

// Anti-raid tracking
const raidTracking = new Map();
const joinTracker = new Map();

// Configuration
const RAID_CONFIG = {
    joinThreshold: 10,        // Users joining
    timeWindow: 30000,        // 30 seconds
    newAccountAge: 86400000,  // 1 day in ms
    autoKickEnabled: true,
    logRaids: true
};

class AntiRaidSystem {
    constructor(client) {
        this.client = client;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.client.on('guildMemberAdd', (member) => {
            this.handleMemberJoin(member);
        });

        this.client.on('messageCreate', (message) => {
            this.detectSpamRaid(message);
        });
    }

    async handleMemberJoin(member) {
        const guildId = member.guild.id;
        const now = Date.now();

        // Initialize tracking if not exists
        if (!joinTracker.has(guildId)) {
            joinTracker.set(guildId, []);
        }

        const joins = joinTracker.get(guildId);
        
        // Add current join
        joins.push({
            userId: member.user.id,
            timestamp: now,
            accountAge: now - member.user.createdTimestamp,
            suspicious: this.isSuspiciousAccount(member.user)
        });

        // Clean old joins (outside time window)
        const recentJoins = joins.filter(join => 
            now - join.timestamp <= RAID_CONFIG.timeWindow
        );
        joinTracker.set(guildId, recentJoins);

        // Check for raid
        if (recentJoins.length >= RAID_CONFIG.joinThreshold) {
            await this.triggerRaidProtection(member.guild, recentJoins);
        }
    }

    isSuspiciousAccount(user) {
        const accountAge = Date.now() - user.createdTimestamp;
        const hasAvatar = user.avatar !== null;
        const hasCustomStatus = user.presence?.activities?.length > 0;
        
        return {
            newAccount: accountAge < RAID_CONFIG.newAccountAge,
            noAvatar: !hasAvatar,
            noStatus: !hasCustomStatus,
            suspiciousName: this.checkSuspiciousName(user.username)
        };
    }

    checkSuspiciousName(username) {
        const patterns = [
            /discord\.gg/i,
            /https?:\/\//i,
            /\d{10,}/,  // Long number sequences
            /^[a-z]{1,3}\d{3,}$/,  // Short letters + numbers
        ];
        
        return patterns.some(pattern => pattern.test(username));
    }

    async triggerRaidProtection(guild, recentJoins) {
        const raidId = `${guild.id}-${Date.now()}`;
        
        // Count suspicious accounts
        const suspiciousCount = recentJoins.filter(join => 
            join.suspicious.newAccount || join.suspicious.noAvatar
        ).length;

        const raidData = {
            id: raidId,
            guild: guild,
            timestamp: new Date(),
            joinCount: recentJoins.length,
            suspiciousCount: suspiciousCount,
            severity: this.calculateSeverity(recentJoins),
            users: recentJoins
        };

        // Store raid data
        raidTracking.set(raidId, raidData);

        // Take action based on severity
        await this.executeRaidResponse(raidData);
    }

    calculateSeverity(joins) {
        let score = 0;
        
        joins.forEach(join => {
            if (join.suspicious.newAccount) score += 3;
            if (join.suspicious.noAvatar) score += 2;
            if (join.suspicious.suspiciousName) score += 4;
            if (join.accountAge < 3600000) score += 2; // Less than 1 hour
        });

        if (score >= 30) return 'CRITICAL';
        if (score >= 20) return 'HIGH';
        if (score >= 10) return 'MEDIUM';
        return 'LOW';
    }

    async executeRaidResponse(raidData) {
        const { guild, severity, users, joinCount, suspiciousCount } = raidData;

        try {
            // Create alert embed
            const alertEmbed = new EmbedBuilder()
                .setTitle('🚨 RAID DETECTION ALERT')
                .setColor(this.getSeverityColor(severity))
                .setDescription(`**Potential raid detected in ${guild.name}**`)
                .addFields(
                    { name: '👥 Recent Joins', value: `${joinCount} users`, inline: true },
                    { name: '⚠️ Suspicious Accounts', value: `${suspiciousCount}`, inline: true },
                    { name: '📊 Severity Level', value: `**${severity}**`, inline: true },
                    { name: '⏰ Detection Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Raid ID: ${raidData.id}` });

            // Auto-kick suspicious users if enabled and severity is high
            if (RAID_CONFIG.autoKickEnabled && (severity === 'HIGH' || severity === 'CRITICAL')) {
                const kickedUsers = await this.autoKickSuspicious(guild, users);
                if (kickedUsers.length > 0) {
                    alertEmbed.addFields({
                        name: '🔨 Auto-Action Taken',
                        value: `Kicked ${kickedUsers.length} suspicious accounts`,
                        inline: true
                    });
                }
            }

            // Log the raid
            await logEvent(guild, {
                type: 'ANTI_RAID_TRIGGERED',
                executor: this.client.user,
                reason: `Raid detection: ${joinCount} joins, ${suspiciousCount} suspicious, severity: ${severity}`,
                embed: alertEmbed,
                timestamp: new Date()
            });

            // Send alert to moderators
            await this.alertModerators(guild, alertEmbed, raidData);

        } catch (error) {
            console.error('Error executing raid response:', error);
        }
    }

    async autoKickSuspicious(guild, users) {
        const kickedUsers = [];
        
        for (const joinData of users) {
            try {
                const member = guild.members.cache.get(joinData.userId);
                if (!member) continue;

                const suspicious = joinData.suspicious;
                const shouldKick = (
                    suspicious.newAccount && 
                    (suspicious.noAvatar || suspicious.suspiciousName)
                ) || (
                    joinData.accountAge < 3600000 // Less than 1 hour old
                );

                if (shouldKick && member.kickable) {
                    await member.kick('Auto-kicked: Suspicious account during raid detection');
                    kickedUsers.push(member.user);
                }
            } catch (error) {
                console.error(`Failed to kick user ${joinData.userId}:`, error);
            }
        }

        return kickedUsers;
    }

    async alertModerators(guild, embed, raidData) {
        // Try to find mod/admin channel
        const channels = ['mod-logs', 'staff-logs', 'admin-logs', 'security-logs'];
        let alertChannel = null;

        for (const channelName of channels) {
            alertChannel = guild.channels.cache.find(ch => 
                ch.name.toLowerCase().includes(channelName) && 
                ch.type === 0
            );
            if (alertChannel) break;
        }

        if (!alertChannel) {
            // Try to find a channel with manage messages permissions
            alertChannel = guild.channels.cache.find(ch => 
                ch.type === 0 && 
                ch.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages)
            );
        }

        if (alertChannel) {
            try {
                await alertChannel.send({
                    content: '🚨 **RAID ALERT** - Immediate attention required!',
                    embeds: [embed]
                });
            } catch (error) {
                console.error('Failed to send raid alert:', error);
            }
        }
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

    async detectSpamRaid(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const now = Date.now();

        // Initialize spam tracking
        if (!raidTracking.has(`spam-${guildId}`)) {
            raidTracking.set(`spam-${guildId}`, new Map());
        }

        const spamTracker = raidTracking.get(`spam-${guildId}`);
        
        if (!spamTracker.has(userId)) {
            spamTracker.set(userId, []);
        }

        const userMessages = spamTracker.get(userId);
        userMessages.push({
            content: message.content,
            timestamp: now,
            channelId: message.channel.id
        });

        // Clean old messages (last 30 seconds)
        const recentMessages = userMessages.filter(msg => 
            now - msg.timestamp <= 30000
        );
        spamTracker.set(userId, recentMessages);

        // Check for spam (5+ messages in 30 seconds)
        if (recentMessages.length >= 5) {
            await this.handleSpamDetection(message, recentMessages);
        }
    }

    async handleSpamDetection(message, messages) {
        try {
            const member = message.member;
            if (!member || !member.moderatable) return;

            // Timeout for 5 minutes
            await member.timeout(5 * 60 * 1000, 'Anti-raid: Spam detection');

            // Delete recent messages
            for (const msg of messages) {
                try {
                    const channel = message.guild.channels.cache.get(msg.channelId);
                    if (channel) {
                        const msgToDelete = await channel.messages.fetch(msg.id).catch(() => null);
                        if (msgToDelete) await msgToDelete.delete();
                    }
                } catch (error) {
                    // Ignore deletion errors
                }
            }

            // Log spam action
            await logEvent(message.guild, {
                type: 'ANTI_RAID_SPAM',
                executor: this.client.user,
                target: message.author,
                reason: `Spam detection: ${messages.length} messages in 30 seconds`,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error handling spam detection:', error);
        }
    }

    // Public method to get raid statistics
    getRaidStats(guildId) {
        const joins = joinTracker.get(guildId) || [];
        const raids = Array.from(raidTracking.values()).filter(raid => 
            raid.guild.id === guildId
        );

        return {
            recentJoins: joins.length,
            totalRaidsDetected: raids.length,
            lastRaidTime: raids.length > 0 ? raids[raids.length - 1].timestamp : null
        };
    }
}

module.exports = AntiRaidSystem;
