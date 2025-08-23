const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { getGuildConfig } = require('../commands/admin/setup');

class XPSystem {
    constructor() {
        this.xpCooldowns = new Map();
        this.dataFile = path.join(process.cwd(), 'data', 'xp-data.json');
        this.levels = this.calculateLevels();
    }

    calculateLevels() {
        const levels = [];
        for (let i = 1; i <= 100; i++) {
            levels[i] = Math.floor(100 * Math.pow(1.5, i - 1));
        }
        return levels;
    }

    async loadXPData() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return {};
        }
    }

    async saveXPData(data) {
        try {
            const dataDir = path.dirname(this.dataFile);
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to save XP data:', error);
        }
    }

    async processMessage(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        try {
            const config = await getGuildConfig(message.guild.id);
            if (!config.xp.enabled) return;

            const userId = message.author.id;
            const guildId = message.guild.id;
            const userKey = `${guildId}-${userId}`;

            // Check cooldown (prevent spam farming)
            if (this.xpCooldowns.has(userKey)) {
                const cooldown = this.xpCooldowns.get(userKey);
                if (Date.now() - cooldown < 60000) return; // 1 minute cooldown
            }

            this.xpCooldowns.set(userKey, Date.now());

            const xpData = await this.loadXPData();
            if (!xpData[guildId]) xpData[guildId] = {};
            if (!xpData[guildId][userId]) {
                xpData[guildId][userId] = {
                    xp: 0,
                    level: 1,
                    totalMessages: 0,
                    lastMessage: Date.now()
                };
            }

            const userData = xpData[guildId][userId];
            
            // Calculate XP gain (base + random bonus)
            const baseXP = config.xp.perMessage || 15;
            const bonusXP = Math.floor(Math.random() * 5) + 1;
            const totalXP = baseXP + bonusXP;

            userData.xp += totalXP;
            userData.totalMessages++;
            userData.lastMessage = Date.now();

            // Check for level up
            const newLevel = this.calculateLevel(userData.xp);
            const oldLevel = userData.level;

            if (newLevel > oldLevel) {
                userData.level = newLevel;
                await this.handleLevelUp(message, userData, config, newLevel, oldLevel);
            }

            await this.saveXPData(xpData);

        } catch (error) {
            console.error('XP System processing error:', error);
        }
    }

    calculateLevel(xp) {
        for (let level = 1; level <= 100; level++) {
            if (xp < this.levels[level]) {
                return level;
            }
        }
        return 100; // Max level
    }

    getXPForLevel(level) {
        return this.levels[level] || 0;
    }

    getXPForNextLevel(currentLevel) {
        return this.levels[currentLevel + 1] || this.levels[100];
    }

    async handleLevelUp(message, userData, config, newLevel, oldLevel) {
        const embed = new EmbedBuilder()
            .setTitle('🎉 Level Up!')
            .setColor(0xffd700)
            .addFields(
                { name: '👤 User', value: message.author.toString(), inline: true },
                { name: '📊 New Level', value: newLevel.toString(), inline: true },
                { name: '⭐ Total XP', value: userData.xp.toLocaleString(), inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp();

        // Send to configured channel or current channel
        let targetChannel = message.channel;
        if (config.xp.levelupChannel) {
            const levelChannel = message.guild.channels.cache.get(config.xp.levelupChannel);
            if (levelChannel) targetChannel = levelChannel;
        }

        try {
            await targetChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending level up message:', error);
        }

        // Check for role rewards (if implemented)
        await this.checkRoleRewards(message.member, newLevel);
    }

    async checkRoleRewards(member, level) {
        // Placeholder for role reward system
        // Could be expanded to give roles at certain levels
        const roleRewards = {
            5: 'Active Member',
            10: 'Regular',
            25: 'Veteran',
            50: 'Elite',
            75: 'Legend'
        };

        if (roleRewards[level]) {
            // Find role and assign if exists
            const roleName = roleRewards[level];
            const role = member.guild.roles.cache.find(r => r.name === roleName);
            
            if (role && !member.roles.cache.has(role.id)) {
                try {
                    await member.roles.add(role);
                    console.log(`Awarded ${roleName} role to ${member.user.tag} for reaching level ${level}`);
                } catch (error) {
                    console.error(`Failed to award role ${roleName}:`, error);
                }
            }
        }
    }

    async getUserXP(guildId, userId) {
        const xpData = await this.loadXPData();
        return xpData[guildId]?.[userId] || {
            xp: 0,
            level: 1,
            totalMessages: 0,
            lastMessage: 0
        };
    }

    async getLeaderboard(guildId, limit = 10) {
        const xpData = await this.loadXPData();
        const guildData = xpData[guildId] || {};

        const leaderboard = Object.entries(guildData)
            .map(([userId, userData]) => ({ userId, ...userData }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit);

        return leaderboard;
    }

    async setUserXP(guildId, userId, xp) {
        const xpData = await this.loadXPData();
        if (!xpData[guildId]) xpData[guildId] = {};
        
        const newLevel = this.calculateLevel(xp);
        
        xpData[guildId][userId] = {
            ...xpData[guildId][userId],
            xp: xp,
            level: newLevel
        };

        await this.saveXPData(xpData);
        return { xp, level: newLevel };
    }

    async addUserXP(guildId, userId, xp) {
        const userData = await this.getUserXP(guildId, userId);
        const newXP = userData.xp + xp;
        return await this.setUserXP(guildId, userId, newXP);
    }

    async removeUserXP(guildId, userId, xp) {
        const userData = await this.getUserXP(guildId, userId);
        const newXP = Math.max(0, userData.xp - xp);
        return await this.setUserXP(guildId, userId, newXP);
    }

    async resetUserXP(guildId, userId) {
        return await this.setUserXP(guildId, userId, 0);
    }
}

module.exports = { XPSystem };
