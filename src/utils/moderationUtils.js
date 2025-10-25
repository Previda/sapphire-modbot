const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

// Pi-optimized moderation case management
class ModerationManager {
    constructor() {
        this.dataFile = path.join(__dirname, '../../data/moderation.json');
        this.data = this.loadData();
        this.caseCounter = this.data.lastCaseId || 1000;
        
        // Auto-save every 2 minutes
        setInterval(() => this.saveData(), 2 * 60 * 1000);
    }

    loadData() {
        try {
            if (fs.existsSync(this.dataFile)) {
                return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
            }
        } catch (error) {
            console.error('Error loading moderation data:', error);
        }
        return { cases: {}, lastCaseId: 1000 };
    }

    saveData() {
        try {
            const dir = path.dirname(this.dataFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            this.data.lastCaseId = this.caseCounter;
            fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving moderation data:', error);
        }
    }

    generateCaseId() {
        // Generate consistent 8-character case ID
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (I, O, 0, 1)
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Ensure uniqueness by checking existing cases
        while (this.data.cases[code]) {
            code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }
        return code;
    }

    createCase(data) {
        const caseId = this.generateCaseId();
        const moderationCase = {
            caseId,
            type: data.type,
            userId: data.userId,
            moderatorId: data.moderatorId,
            guildId: data.guildId,
            reason: data.reason || 'No reason provided',
            duration: data.duration || null,
            active: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            appealable: data.appealable !== false,
            dmSent: false,
            ...data
        };

        this.data.cases[caseId] = moderationCase;
        this.saveData();
        return moderationCase;
    }

    getCase(caseId) {
        return this.data.cases[caseId];
    }

    updateCase(caseId, updates) {
        if (this.data.cases[caseId]) {
            Object.assign(this.data.cases[caseId], updates, { updatedAt: Date.now() });
            this.saveData();
            return this.data.cases[caseId];
        }
        return null;
    }

    getUserCases(userId, guildId) {
        return Object.values(this.data.cases)
            .filter(c => c.userId === userId && c.guildId === guildId)
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    getActiveCases(guildId, type = null) {
        return Object.values(this.data.cases)
            .filter(c => c.guildId === guildId && c.active && (!type || c.type === type))
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    async sendDM(user, moderationCase, client) {
        try {
            const embed = new EmbedBuilder()
                .setTitle(`📋 Moderation Action: ${moderationCase.type.toUpperCase()}`)
                .setColor(this.getActionColor(moderationCase.type))
                .addFields(
                    { name: '🏠 Server', value: moderationCase.guildName || 'Unknown Server', inline: true },
                    { name: '👮 Moderator', value: moderationCase.moderatorTag || 'Unknown', inline: true },
                    { name: '📝 Reason', value: moderationCase.reason, inline: false },
                    { name: '🆔 Case ID', value: `#${moderationCase.caseId}`, inline: true },
                    { name: '📅 Date', value: `<t:${Math.floor(moderationCase.createdAt / 1000)}:F>`, inline: true }
                );

            if (moderationCase.duration) {
                embed.addFields({ name: '⏱️ Duration', value: moderationCase.duration, inline: true });
            }

            if (moderationCase.appealable) {
                embed.addFields({
                    name: '📞 Appeal Process',
                    value: `You can appeal this action by using \`/appeal ${moderationCase.caseId}\` in the server or DMing a moderator.`,
                    inline: false
                });
            }

            embed.setFooter({ 
                text: 'Skyfall Moderation System', 
                iconURL: client.user.avatarURL() 
            }).setTimestamp();

            await user.send({ embeds: [embed] });
            
            // Update case to mark DM as sent
            this.updateCase(moderationCase.caseId, { dmSent: true });
            return true;
        } catch (error) {
            if (error.code === 50007) {
                console.log(`💬 User ${user.tag} has DMs disabled - skipping notification`);
            } else {
                console.error(`Failed to send DM to user ${user.id}:`, error);
            }
            return false;
        }
    }

    getActionColor(type) {
        const colors = {
            ban: 0xdc3545,
            kick: 0xfd7e14,
            mute: 0xffc107,
            warn: 0x28a745,
            timeout: 0x6f42c1,
            unban: 0x20c997,
            unmute: 0x17a2b8
        };
        return colors[type] || 0x6c757d;
    }

    getActionEmoji(type) {
        const emojis = {
            ban: '🔨',
            kick: '👢',
            mute: '🔇',
            warn: '⚠️',
            timeout: '⏰',
            unban: '🔓',
            unmute: '🔊'
        };
        return emojis[type] || '📋';
    }

    createModerationEmbed(moderationCase, guild, moderator, targetUser) {
        const embed = new EmbedBuilder()
            .setTitle(`${this.getActionEmoji(moderationCase.type)} ${moderationCase.type.toUpperCase()} - Case #${moderationCase.caseId}`)
            .setColor(this.getActionColor(moderationCase.type))
            .addFields(
                { name: '👤 User', value: `${targetUser.tag}\n\`${targetUser.id}\``, inline: true },
                { name: '👮 Moderator', value: `${moderator.tag}\n\`${moderator.id}\``, inline: true },
                { name: '📝 Reason', value: moderationCase.reason, inline: false },
                { name: '🆔 Case ID', value: `#${moderationCase.caseId}`, inline: true },
                { name: '📅 Date', value: `<t:${Math.floor(moderationCase.createdAt / 1000)}:F>`, inline: true },
                { name: '📨 DM Sent', value: moderationCase.dmSent ? '✅ Yes' : '❌ No', inline: true }
            );

        if (moderationCase.duration) {
            embed.addFields({ name: '⏱️ Duration', value: moderationCase.duration, inline: true });
        }

        if (moderationCase.appealable) {
            embed.addFields({
                name: '📞 Appeal Info',
                value: `User can appeal with: \`/appeal ${moderationCase.caseId}\``,
                inline: false
            });
        }

        embed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Skyfall Moderation System' })
            .setTimestamp();

        return embed;
    }

    getStats(guildId) {
        const cases = Object.values(this.data.cases).filter(c => c.guildId === guildId);
        const last30Days = cases.filter(c => (Date.now() - c.createdAt) < 30 * 24 * 60 * 60 * 1000);
        
        return {
            totalCases: cases.length,
            activeCases: cases.filter(c => c.active).length,
            last30Days: last30Days.length,
            typeBreakdown: this.getCaseTypeBreakdown(cases),
            dmSuccessRate: this.getDMSuccessRate(cases)
        };
    }

    getCaseTypeBreakdown(cases) {
        const breakdown = {};
        cases.forEach(c => {
            breakdown[c.type] = (breakdown[c.type] || 0) + 1;
        });
        return breakdown;
    }

    getDMSuccessRate(cases) {
        const dmCases = cases.filter(c => c.dmSent !== undefined);
        const successful = dmCases.filter(c => c.dmSent).length;
        return dmCases.length > 0 ? Math.round((successful / dmCases.length) * 100) : 0;
    }
}

module.exports = new ModerationManager();
