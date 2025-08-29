const { EmbedBuilder, WebhookClient } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

class LoggingSystem {
    constructor() {
        this.configPath = path.join(process.cwd(), 'data', 'logging.json');
        this.config = {};
        this.webhooks = new Map();
        this.loadConfig();
    }

    async loadConfig() {
        try {
            const data = await fs.readFile(this.configPath, 'utf8');
            this.config = JSON.parse(data);
            
            // Initialize webhooks
            for (const [guildId, guildConfig] of Object.entries(this.config)) {
                if (guildConfig.webhookURL) {
                    this.webhooks.set(guildId, new WebhookClient({ url: guildConfig.webhookURL }));
                }
            }
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
            console.error('Error saving logging config:', error);
        }
    }

    setWebhook(guildId, webhookURL) {
        if (!this.config[guildId]) {
            this.config[guildId] = {};
        }
        
        this.config[guildId].webhookURL = webhookURL;
        this.webhooks.set(guildId, new WebhookClient({ url: webhookURL }));
        this.saveConfig();
    }

    async logAction(guildId, type, data) {
        const webhook = this.webhooks.get(guildId);
        if (!webhook) return;

        const embed = new EmbedBuilder()
            .setColor(this.getColorForType(type))
            .setTitle(`${this.getEmojiForType(type)} ${type.toUpperCase()}`)
            .setTimestamp();

        switch (type) {
            case 'ban':
            case 'kick':
            case 'timeout':
            case 'warn':
                embed.addFields(
                    { name: '👤 User', value: `${data.user} (${data.userId})`, inline: true },
                    { name: '👮 Moderator', value: `${data.moderator} (${data.moderatorId})`, inline: true },
                    { name: '📝 Reason', value: data.reason || 'No reason provided', inline: false }
                );
                break;
            
            case 'unban':
            case 'untimeout':
                embed.addFields(
                    { name: '👤 User', value: `${data.user} (${data.userId})`, inline: true },
                    { name: '👮 Moderator', value: `${data.moderator} (${data.moderatorId})`, inline: true }
                );
                break;
        }

        try {
            await webhook.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending webhook log:', error);
        }
    }

    getColorForType(type) {
        const colors = {
            'ban': 0xff0000,
            'kick': 0xff8800,
            'timeout': 0xffaa00,
            'warn': 0xffff00,
            'unban': 0x00ff00,
            'untimeout': 0x00aa00
        };
        return colors[type] || 0x0099ff;
    }

    getEmojiForType(type) {
        const emojis = {
            'ban': '🔨',
            'kick': '👢',
            'timeout': '⏰',
            'warn': '⚠️',
            'unban': '🔓',
            'untimeout': '⏰'
        };
        return emojis[type] || '📝';
    }
}

module.exports = LoggingSystem;
