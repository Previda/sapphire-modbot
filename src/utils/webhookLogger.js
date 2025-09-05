const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { setDocument, getDocument } = require('../models/database');

class WebhookLogger {
    constructor() {
        this.webhooks = new Map(); // Cache webhooks
    }

    // Get webhook configuration for a guild
    async getWebhookConfig(guildId) {
        const config = await getDocument('webhooks', guildId);
        return config || {
            modLog: null,
            joinLeave: null,
            messageLog: null,
            voiceLog: null,
            enabled: false
        };
    }

    // Set webhook configuration
    async setWebhookConfig(guildId, config) {
        await setDocument('webhooks', guildId, config);
        this.webhooks.set(guildId, config); // Update cache
    }

    // Send webhook message
    async sendWebhook(webhookUrl, embed, username = 'Skyfall Bot', avatarURL = null) {
        if (!webhookUrl) return false;

        try {
            const payload = {
                username: username,
                embeds: [embed],
            };

            if (avatarURL) {
                payload.avatar_url = avatarURL;
            }

            await axios.post(webhookUrl, payload);
            return true;
        } catch (error) {
            console.error('Webhook send failed:', error.message);
            return false;
        }
    }

    // Log moderation action
    async logModAction(guildId, action, data) {
        const config = await this.getWebhookConfig(guildId);
        if (!config.enabled || !config.modLog) return;

        const embed = new EmbedBuilder()
            .setColor(this.getActionColor(action))
            .setTitle(`🛡️ ${action.toUpperCase()} Action`)
            .addFields(
                { name: '👤 Target', value: `${data.targetTag}\n\`${data.targetId}\``, inline: true },
                { name: '👮 Moderator', value: `${data.moderatorTag}\n\`${data.moderatorId}\``, inline: true },
                { name: '🆔 Case ID', value: data.caseId || 'N/A', inline: true }
            )
            .setTimestamp();

        if (data.reason) {
            embed.addFields({ name: '📝 Reason', value: data.reason, inline: false });
        }

        if (data.duration) {
            embed.addFields({ name: '⏱️ Duration', value: data.duration, inline: true });
        }

        if (data.channel) {
            embed.addFields({ name: '📍 Channel', value: data.channel, inline: true });
        }

        await this.sendWebhook(config.modLog, embed, 'Mod Log');
    }

    // Log member join/leave
    async logMemberEvent(guildId, event, member, reason = null) {
        const config = await this.getWebhookConfig(guildId);
        if (!config.enabled || !config.joinLeave) return;

        const isJoin = event === 'join';
        const embed = new EmbedBuilder()
            .setColor(isJoin ? 0x00ff00 : 0xff0000)
            .setTitle(`${isJoin ? '📥' : '📤'} Member ${isJoin ? 'Joined' : 'Left'}`)
            .addFields(
                { name: '👤 User', value: `${member.user.tag}\n\`${member.user.id}\``, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        if (isJoin) {
            embed.addFields(
                { name: '👥 Member Count', value: member.guild.memberCount.toString(), inline: true }
            );
        } else if (reason) {
            embed.addFields({ name: '📝 Reason', value: reason, inline: false });
        }

        await this.sendWebhook(config.joinLeave, embed, 'Member Log');
    }

    // Log message events
    async logMessageEvent(guildId, event, data) {
        const config = await this.getWebhookConfig(guildId);
        if (!config.enabled || !config.messageLog) return;

        let embed;
        switch (event) {
            case 'delete':
                embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('🗑️ Message Deleted')
                    .addFields(
                        { name: '👤 Author', value: `${data.author.tag}\n\`${data.author.id}\``, inline: true },
                        { name: '📍 Channel', value: `${data.channel.name}\n\`${data.channel.id}\``, inline: true },
                        { name: '💬 Content', value: data.content || '[No content]', inline: false }
                    )
                    .setTimestamp();
                break;

            case 'edit':
                embed = new EmbedBuilder()
                    .setColor(0xffa500)
                    .setTitle('✏️ Message Edited')
                    .addFields(
                        { name: '👤 Author', value: `${data.author.tag}\n\`${data.author.id}\``, inline: true },
                        { name: '📍 Channel', value: `${data.channel.name}\n\`${data.channel.id}\``, inline: true },
                        { name: '📝 Before', value: data.oldContent || '[No content]', inline: false },
                        { name: '📝 After', value: data.newContent || '[No content]', inline: false }
                    )
                    .setTimestamp();
                break;
        }

        if (embed) {
            await this.sendWebhook(config.messageLog, embed, 'Message Log');
        }
    }

    // Log voice events
    async logVoiceEvent(guildId, event, member, oldChannel, newChannel) {
        const config = await this.getWebhookConfig(guildId);
        if (!config.enabled || !config.voiceLog) return;

        let title, color, description;
        switch (event) {
            case 'join':
                title = '🔊 Voice Channel Joined';
                color = 0x00ff00;
                description = `**Channel:** ${newChannel.name}`;
                break;
            case 'leave':
                title = '🔇 Voice Channel Left';
                color = 0xff0000;
                description = `**Channel:** ${oldChannel.name}`;
                break;
            case 'move':
                title = '🔄 Voice Channel Moved';
                color = 0xffa500;
                description = `**From:** ${oldChannel.name}\n**To:** ${newChannel.name}`;
                break;
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .addFields(
                { name: '👤 User', value: `${member.user.tag}\n\`${member.user.id}\``, inline: true }
            )
            .setDescription(description)
            .setTimestamp();

        await this.sendWebhook(config.voiceLog, embed, 'Voice Log');
    }

    // Get color for action type
    getActionColor(action) {
        const colors = {
            ban: 0xff0000,
            kick: 0xff6600,
            mute: 0xffff00,
            timeout: 0xffa500,
            warn: 0xff9900,
            unban: 0x00ff00,
            unmute: 0x00ff99,
            untimeout: 0x00ffff
        };
        return colors[action] || 0x0099ff;
    }

    // Test webhook
    async testWebhook(webhookUrl) {
        const embed = new EmbedBuilder()
            .setTitle('🧪 Webhook Test')
            .setDescription('This is a test message to verify webhook functionality.')
            .setColor(0x0099ff)
            .setTimestamp();

        return await this.sendWebhook(webhookUrl, embed, 'Test');
    }
}

// Create singleton instance
const webhookLogger = new WebhookLogger();
module.exports = webhookLogger;
