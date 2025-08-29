const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

class AutoModSystem {
    constructor() {
        this.configPath = path.join(process.cwd(), 'data', 'automod.json');
        this.config = {};
        this.violations = new Map();
        this.loadConfig();
    }

    async loadConfig() {
        try {
            const data = await fs.readFile(this.configPath, 'utf8');
            this.config = JSON.parse(data);
        } catch (error) {
            this.config = {};
        }
    }

    async saveConfig() {
        try {
            const dataDir = path.dirname(this.configPath);
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Error saving automod config:', error);
        }
    }

    getGuildConfig(guildId) {
        return this.config[guildId] || {
            enabled: false,
            antiSpam: true,
            antiInvite: false,
            antiNSFW: false,
            capsFlood: false,
            emojiFlood: false,
            warnThreshold: 3,
            muteThreshold: 5,
            muteDuration: 300
        };
    }

    setGuildConfig(guildId, config) {
        this.config[guildId] = config;
        this.saveConfig();
    }

    async processMessage(message) {
        if (!message.guild || message.author.bot) return;
        
        const guildConfig = this.getGuildConfig(message.guild.id);
        if (!guildConfig.enabled) return;

        let violations = [];

        // Anti-spam check
        if (guildConfig.antiSpam && this.checkSpam(message)) {
            violations.push('spam');
        }

        // Anti-invite check
        if (guildConfig.antiInvite && this.checkInvite(message)) {
            violations.push('invite');
        }

        // Caps flood check
        if (guildConfig.capsFlood && this.checkCapsFlood(message)) {
            violations.push('caps');
        }

        // Emoji flood check
        if (guildConfig.emojiFlood && this.checkEmojiFlood(message)) {
            violations.push('emoji_flood');
        }

        if (violations.length > 0) {
            await this.handleViolations(message, violations, guildConfig);
        }
    }

    checkSpam(message) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        
        if (!this.violations.has(guildId)) {
            this.violations.set(guildId, new Map());
        }
        
        const guildViolations = this.violations.get(guildId);
        if (!guildViolations.has(userId)) {
            guildViolations.set(userId, { messages: [], lastMessage: '' });
        }
        
        const userViolations = guildViolations.get(userId);
        const now = Date.now();
        
        // Remove messages older than 5 seconds
        userViolations.messages = userViolations.messages.filter(time => now - time < 5000);
        
        // Check for duplicate messages
        if (message.content === userViolations.lastMessage) {
            return true;
        }
        
        // Check for rapid messages (more than 5 in 5 seconds)
        userViolations.messages.push(now);
        userViolations.lastMessage = message.content;
        
        return userViolations.messages.length > 5;
    }

    checkInvite(message) {
        const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+/gi;
        return inviteRegex.test(message.content);
    }

    checkCapsFlood(message) {
        if (message.content.length < 10) return false;
        const capsCount = (message.content.match(/[A-Z]/g) || []).length;
        const capsPercentage = (capsCount / message.content.length) * 100;
        return capsPercentage > 70;
    }

    checkEmojiFlood(message) {
        const emojiCount = (message.content.match(/<:[^>]+>/g) || []).length;
        const unicodeEmojiCount = (message.content.match(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}]/gu) || []).length;
        return (emojiCount + unicodeEmojiCount) > 5;
    }

    async handleViolations(message, violations, config) {
        try {
            await message.delete();
            
            const embed = new EmbedBuilder()
                .setTitle('🚨 AutoMod Violation')
                .setColor(0xff0000)
                .addFields(
                    { name: '👤 User', value: message.author.toString(), inline: true },
                    { name: '📝 Violations', value: violations.join(', '), inline: true },
                    { name: '📍 Channel', value: message.channel.toString(), inline: true }
                )
                .setTimestamp();

            const logChannel = message.guild.channels.cache.find(ch => ch.name === 'mod-log' || ch.name === 'logs');
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error handling automod violations:', error);
        }
    }
}

module.exports = AutoModSystem;
