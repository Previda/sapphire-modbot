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
            // Delete the offending message
            await message.delete().catch(() => {});
            
            const userId = message.author.id;
            const guildId = message.guild.id;
            
            // Track user violation count
            const violationKey = `${guildId}-${userId}`;
            const userViolationCount = (this.violations.get(guildId)?.get(userId)?.violationCount || 0) + 1;
            
            // Update violation count
            if (!this.violations.has(guildId)) {
                this.violations.set(guildId, new Map());
            }
            const guildViolations = this.violations.get(guildId);
            if (!guildViolations.has(userId)) {
                guildViolations.set(userId, { messages: [], lastMessage: '', violationCount: 0 });
            }
            guildViolations.get(userId).violationCount = userViolationCount;

            // Apply progressive punishment
            const member = message.member;
            let action = 'warning';
            let duration = null;

            if (userViolationCount >= config.muteThreshold) {
                // Mute user for repeated violations
                action = 'timeout';
                duration = config.muteDuration * 1000; // Convert to milliseconds
                try {
                    await member.timeout(duration, `AutoMod: ${violations.join(', ')} (${userViolationCount} violations)`);
                    console.log(`🚨 AutoMod: Timed out ${message.author.tag} for ${config.muteDuration}s due to ${violations.join(', ')}`);
                } catch (error) {
                    console.error('Failed to timeout user:', error);
                    action = 'failed_timeout';
                }
            } else if (userViolationCount >= config.warnThreshold) {
                action = 'warning';
                // Send warning DM
                try {
                    const warningEmbed = new EmbedBuilder()
                        .setTitle('⚠️ AutoMod Warning')
                        .setColor(0xff9900)
                        .setDescription(`You have been warned for ${violations.join(', ')} in **${message.guild.name}**.`)
                        .addFields(
                            { name: 'Violations', value: `${userViolationCount}/${config.muteThreshold}` },
                            { name: 'Next Action', value: userViolationCount + 1 >= config.muteThreshold ? 'Timeout' : 'Another Warning' }
                        )
                        .setTimestamp();
                    
                    await message.author.send({ embeds: [warningEmbed] });
                } catch (error) {
                    console.log('Could not DM user warning');
                }
            }

            // Log the action
            const embed = new EmbedBuilder()
                .setTitle('🚨 AutoMod Action')
                .setColor(action === 'timeout' ? 0xff0000 : 0xff9900)
                .addFields(
                    { name: '👤 User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: '📝 Violations', value: violations.join(', '), inline: true },
                    { name: '📍 Channel', value: message.channel.toString(), inline: true },
                    { name: '🔢 Violation Count', value: `${userViolationCount}`, inline: true },
                    { name: '⚡ Action', value: action === 'timeout' ? `Timed out for ${config.muteDuration}s` : `Warning issued`, inline: true },
                    { name: '💬 Message', value: message.content.slice(0, 100) + (message.content.length > 100 ? '...' : ''), inline: false }
                )
                .setTimestamp();

            // Send to log channel
            const logChannel = message.guild.channels.cache.find(ch => 
                ch.name === 'mod-log' || ch.name === 'logs' || ch.name === 'automod-log'
            );
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }

            // Send notification to general channel for timeout actions
            if (action === 'timeout') {
                const publicEmbed = new EmbedBuilder()
                    .setTitle('🚨 AutoMod Action')
                    .setColor(0xff0000)
                    .setDescription(`${message.author} was timed out for ${config.muteDuration} seconds`)
                    .addFields(
                        { name: 'Reason', value: violations.join(', '), inline: true },
                        { name: 'Violations', value: `${userViolationCount}`, inline: true }
                    )
                    .setTimestamp();
                
                await message.channel.send({ embeds: [publicEmbed] });
            }

        } catch (error) {
            console.error('Error handling automod violations:', error);
        }
    }
}

module.exports = AutoModSystem;
