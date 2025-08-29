const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

class XPSystem {
    constructor() {
        this.dataPath = path.join(process.cwd(), 'data', 'xp.json');
        this.xpData = {};
        this.loadData();
    }

    async loadData() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            this.xpData = JSON.parse(data);
        } catch (error) {
            this.xpData = {};
        }
    }

    async saveData() {
        try {
            const dataDir = path.dirname(this.dataPath);
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(this.dataPath, JSON.stringify(this.xpData, null, 2));
        } catch (error) {
            console.error('Error saving XP data:', error);
        }
    }

    addXP(guildId, userId, amount = 1) {
        if (!this.xpData[guildId]) {
            this.xpData[guildId] = {};
        }
        
        if (!this.xpData[guildId][userId]) {
            this.xpData[guildId][userId] = {
                xp: 0,
                level: 1,
                totalMessages: 0
            };
        }
        
        const userData = this.xpData[guildId][userId];
        userData.xp += amount;
        userData.totalMessages += 1;
        
        // Calculate level (basic formula)
        const newLevel = Math.floor(0.1 * Math.sqrt(userData.xp)) + 1;
        const leveledUp = newLevel > userData.level;
        userData.level = newLevel;
        
        this.saveData();
        
        return {
            leveledUp,
            newLevel,
            currentXP: userData.xp,
            totalMessages: userData.totalMessages
        };
    }

    getUserData(guildId, userId) {
        if (!this.xpData[guildId] || !this.xpData[guildId][userId]) {
            return {
                xp: 0,
                level: 1,
                totalMessages: 0
            };
        }
        return this.xpData[guildId][userId];
    }

    getLeaderboard(guildId, limit = 10) {
        if (!this.xpData[guildId]) return [];
        
        return Object.entries(this.xpData[guildId])
            .map(([userId, data]) => ({ userId, ...data }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit);
    }

    reset(guildId, userId = null) {
        if (!this.xpData[guildId]) return false;
        
        if (userId) {
            delete this.xpData[guildId][userId];
        } else {
            this.xpData[guildId] = {};
        }
        
        this.saveData();
        return true;
    }
}

module.exports = XPSystem;
