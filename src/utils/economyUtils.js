const fs = require('fs');
const path = require('path');

// Pi-optimized economy utilities
class EconomyManager {
    constructor() {
        this.dataFile = path.join(__dirname, '../../data/economy.json');
        this.data = this.loadData();
        
        // Auto-save every 5 minutes (Pi optimized)
        setInterval(() => this.saveData(), 5 * 60 * 1000);
    }

    loadData() {
        try {
            if (fs.existsSync(this.dataFile)) {
                return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
            }
        } catch (error) {
            console.error('Error loading economy data:', error);
        }
        return {};
    }

    saveData() {
        try {
            const dir = path.dirname(this.dataFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving economy data:', error);
        }
    }

    getUserKey(userId, guildId) {
        return `${userId}_${guildId}`;
    }

    getUser(userId, guildId) {
        const key = this.getUserKey(userId, guildId);
        if (!this.data[key]) {
            this.data[key] = {
                userId,
                guildId,
                balance: 100,
                bank: 0,
                gems: 0,
                level: 1,
                xp: 0,
                lastWork: null,
                lastDaily: null,
                workStreak: 0,
                dailyStreak: 0,
                totalEarned: 100,
                commandsUsed: 0,
                achievements: [],
                createdAt: Date.now()
            };
        }
        return this.data[key];
    }

    updateUser(userId, guildId, updates) {
        const user = this.getUser(userId, guildId);
        Object.assign(user, updates);
        user.updatedAt = Date.now();
        this.saveData();
        return user;
    }

    addBalance(userId, guildId, amount) {
        const user = this.getUser(userId, guildId);
        user.balance += amount;
        user.totalEarned += amount;
        this.checkLevelUp(user);
        this.saveData();
        return user;
    }

    checkLevelUp(user) {
        const xpNeeded = user.level * 100;
        if (user.xp >= xpNeeded) {
            user.level += 1;
            user.xp -= xpNeeded;
            return true;
        }
        return false;
    }

    addXP(userId, guildId, amount) {
        const user = this.getUser(userId, guildId);
        user.xp += amount;
        const leveledUp = this.checkLevelUp(user);
        this.saveData();
        return { user, leveledUp };
    }

    canWork(userId, guildId) {
        const user = this.getUser(userId, guildId);
        if (!user.lastWork) return true;
        
        const now = Date.now();
        const cooldown = 60 * 60 * 1000; // 1 hour
        return (now - user.lastWork) >= cooldown;
    }

    canDaily(userId, guildId) {
        const user = this.getUser(userId, guildId);
        if (!user.lastDaily) return true;
        
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours
        return (now - user.lastDaily) >= cooldown;
    }

    getLeaderboard(guildId, type = 'balance', limit = 10) {
        const users = Object.values(this.data)
            .filter(user => user.guildId === guildId)
            .sort((a, b) => (b[type] || 0) - (a[type] || 0))
            .slice(0, limit);
        
        return users;
    }

    transferMoney(fromUserId, toUserId, guildId, amount) {
        const fromUser = this.getUser(fromUserId, guildId);
        const toUser = this.getUser(toUserId, guildId);
        
        if (fromUser.balance < amount) {
            throw new Error('Insufficient funds');
        }
        
        fromUser.balance -= amount;
        toUser.balance += amount;
        
        this.saveData();
        return { fromUser, toUser };
    }

    getStats(guildId) {
        const users = Object.values(this.data).filter(user => user.guildId === guildId);
        
        return {
            totalUsers: users.length,
            totalMoney: users.reduce((sum, user) => sum + user.balance + user.bank, 0),
            averageLevel: users.reduce((sum, user) => sum + user.level, 0) / users.length || 0,
            activeUsers: users.filter(user => user.lastWork && (Date.now() - user.lastWork) < 7 * 24 * 60 * 60 * 1000).length
        };
    }
}

module.exports = new EconomyManager();
