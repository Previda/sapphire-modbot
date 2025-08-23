const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { getGuildConfig } = require('../commands/admin/setup');

class LoggingModule {
    constructor() {
        this.logFile = path.join(process.cwd(), 'data', 'logs', 'guild-logs.json');
        this.logTypes = {
            MODERATION: 'moderation',
            MEMBER: 'member',
            CHANNEL: 'channel',
            ROLE: 'role',
            MESSAGE: 'message',
            VOICE: 'voice',
            AUTOMOD: 'automod',
            TICKET: 'ticket'
        };
    }

    async logAction(type, guildId, data) {
        try {
            const config = await getGuildConfig(guildId);
            if (!config.modlog) return;

            const guild = data.guild || data.channel?.guild;
            if (!guild) return;

            const logChannel = guild.channels.cache.get(config.modlog);
            if (!logChannel) return;

            const embed = this.createLogEmbed(type, data);
            if (embed) {
                await logChannel.send({ embeds: [embed] });
            }

            // Save to file log
            await this.saveToFile(type, guildId, data);

        } catch (error) {
            console.error('Logging error:', error);
        }
    }

    createLogEmbed(type, data) {
        const embed = new EmbedBuilder().setTimestamp();

        switch (type) {
            case this.logTypes.MODERATION:
                return this.createModerationEmbed(embed, data);
            case this.logTypes.MEMBER:
                return this.createMemberEmbed(embed, data);
            case this.logTypes.CHANNEL:
                return this.createChannelEmbed(embed, data);
            case this.logTypes.ROLE:
                return this.createRoleEmbed(embed, data);
            case this.logTypes.MESSAGE:
                return this.createMessageEmbed(embed, data);
            case this.logTypes.VOICE:
                return this.createVoiceEmbed(embed, data);
            case this.logTypes.AUTOMOD:
                return this.createAutoModEmbed(embed, data);
            case this.logTypes.TICKET:
                return this.createTicketEmbed(embed, data);
            default:
                return null;
        }
    }

    createModerationEmbed(embed, data) {
        const colors = {
            warn: 0xffff00,
            mute: 0xff6600,
            kick: 0xff9900,
            ban: 0xff0000,
            unban: 0x00ff00,
            timeout: 0xff6600,
            untimeout: 0x00ff00
        };

        return embed
            .setTitle(`🔨 ${data.action.charAt(0).toUpperCase() + data.action.slice(1)} | ${data.user.tag}`)
            .setColor(colors[data.action] || 0x3498db)
            .addFields(
                { name: '👤 User', value: `${data.user.tag}\n\`${data.user.id}\``, inline: true },
                { name: '👮 Moderator', value: data.moderator ? data.moderator.tag : 'System', inline: true },
                { name: '🆔 Case ID', value: data.caseId || 'N/A', inline: true },
                { name: '📝 Reason', value: data.reason || 'No reason provided', inline: false }
            )
            .setThumbnail(data.user.displayAvatarURL());
    }

    createMemberEmbed(embed, data) {
        const isJoin = data.action === 'join';
        
        return embed
            .setTitle(`${isJoin ? '📥' : '📤'} Member ${isJoin ? 'Joined' : 'Left'}`)
            .setColor(isJoin ? 0x00ff00 : 0xff0000)
            .addFields(
                { name: '👤 User', value: `${data.user.tag}\n\`${data.user.id}\``, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(data.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Member Count', value: data.memberCount.toString(), inline: true }
            )
            .setThumbnail(data.user.displayAvatarURL())
            .setFooter({ text: `ID: ${data.user.id}` });
    }

    createChannelEmbed(embed, data) {
        const colors = { create: 0x00ff00, delete: 0xff0000, update: 0xffff00 };
        
        return embed
            .setTitle(`📺 Channel ${data.action.charAt(0).toUpperCase() + data.action.slice(1)}d`)
            .setColor(colors[data.action] || 0x3498db)
            .addFields(
                { name: '📺 Channel', value: data.channel.name, inline: true },
                { name: '📋 Type', value: data.channel.type.toString(), inline: true },
                { name: '👮 Executor', value: data.executor ? data.executor.tag : 'Unknown', inline: true }
            );
    }

    createRoleEmbed(embed, data) {
        const colors = { create: 0x00ff00, delete: 0xff0000, update: 0xffff00 };
        
        return embed
            .setTitle(`🎭 Role ${data.action.charAt(0).toUpperCase() + data.action.slice(1)}d`)
            .setColor(colors[data.action] || 0x3498db)
            .addFields(
                { name: '🎭 Role', value: data.role.name, inline: true },
                { name: '🎨 Color', value: data.role.hexColor || 'None', inline: true },
                { name: '👮 Executor', value: data.executor ? data.executor.tag : 'Unknown', inline: true }
            );
    }

    createMessageEmbed(embed, data) {
        const colors = { delete: 0xff0000, update: 0xffff00, bulk_delete: 0xff6600 };
        
        const baseEmbed = embed
            .setTitle(`💬 Message ${data.action === 'bulk_delete' ? 'Bulk Deleted' : data.action.charAt(0).toUpperCase() + data.action.slice(1)}d`)
            .setColor(colors[data.action] || 0x3498db)
            .addFields(
                { name: '👤 Author', value: data.author ? `${data.author.tag}\n\`${data.author.id}\`` : 'Unknown', inline: true },
                { name: '📍 Channel', value: data.channel.toString(), inline: true }
            );

        if (data.content && data.action !== 'bulk_delete') {
            baseEmbed.addFields({
                name: '📝 Content',
                value: data.content.length > 1024 ? data.content.substring(0, 1021) + '...' : data.content,
                inline: false
            });
        }

        if (data.action === 'bulk_delete') {
            baseEmbed.addFields({ name: '🔢 Count', value: data.count.toString(), inline: true });
        }

        return baseEmbed;
    }

    createVoiceEmbed(embed, data) {
        const actions = {
            join: { emoji: '🔊', color: 0x00ff00 },
            leave: { emoji: '🔇', color: 0xff0000 },
            move: { emoji: '↔️', color: 0xffff00 },
            mute: { emoji: '🔇', color: 0xff6600 },
            unmute: { emoji: '🔊', color: 0x00ff00 },
            deafen: { emoji: '🔇', color: 0xff6600 },
            undeafen: { emoji: '🔊', color: 0x00ff00 }
        };

        const actionData = actions[data.action] || { emoji: '🔊', color: 0x3498db };
        
        return embed
            .setTitle(`${actionData.emoji} Voice ${data.action.charAt(0).toUpperCase() + data.action.slice(1)}`)
            .setColor(actionData.color)
            .addFields(
                { name: '👤 User', value: `${data.user.tag}\n\`${data.user.id}\``, inline: true },
                { name: '🔊 Channel', value: data.channel ? data.channel.name : 'Unknown', inline: true }
            )
            .setThumbnail(data.user.displayAvatarURL());
    }

    createAutoModEmbed(embed, data) {
        return embed
            .setTitle('🤖 AutoMod Action')
            .setColor(0xff6600)
            .addFields(
                { name: '👤 User', value: `${data.user.tag}\n\`${data.user.id}\``, inline: true },
                { name: '🚨 Action', value: data.action, inline: true },
                { name: '⚠️ Violation', value: data.violation, inline: true },
                { name: '🆔 Case ID', value: data.caseId || 'N/A', inline: true },
                { name: '📝 Reason', value: data.reason, inline: false }
            )
            .setThumbnail(data.user.displayAvatarURL());
    }

    createTicketEmbed(embed, data) {
        const colors = { create: 0x00ff00, close: 0xff0000, update: 0xffff00 };
        
        return embed
            .setTitle(`🎫 Ticket ${data.action.charAt(0).toUpperCase() + data.action.slice(1)}d`)
            .setColor(colors[data.action] || 0x3498db)
            .addFields(
                { name: '👤 User', value: `${data.user.tag}\n\`${data.user.id}\``, inline: true },
                { name: '🎫 Ticket ID', value: data.ticketId || 'N/A', inline: true },
                { name: '📂 Category', value: data.category || 'General', inline: true },
                { name: '📝 Reason', value: data.reason || 'No reason provided', inline: false }
            )
            .setThumbnail(data.user.displayAvatarURL());
    }

    async saveToFile(type, guildId, data) {
        try {
            const logDir = path.dirname(this.logFile);
            await fs.mkdir(logDir, { recursive: true });

            let logs = {};
            try {
                const existingData = await fs.readFile(this.logFile, 'utf-8');
                logs = JSON.parse(existingData);
            } catch (error) {
                // File doesn't exist, start fresh
            }

            if (!logs[guildId]) logs[guildId] = [];
            
            logs[guildId].push({
                type,
                timestamp: Date.now(),
                data: {
                    ...data,
                    // Clean data for JSON storage
                    user: data.user ? { id: data.user.id, tag: data.user.tag } : null,
                    moderator: data.moderator ? { id: data.moderator.id, tag: data.moderator.tag } : null,
                    channel: data.channel ? { id: data.channel.id, name: data.channel.name } : null,
                    guild: data.guild ? { id: data.guild.id, name: data.guild.name } : null
                }
            });

            // Keep only last 1000 logs per guild
            if (logs[guildId].length > 1000) {
                logs[guildId] = logs[guildId].slice(-1000);
            }

            await fs.writeFile(this.logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Error saving log to file:', error);
        }
    }

    async getGuildLogs(guildId, limit = 50, type = null) {
        try {
            const data = await fs.readFile(this.logFile, 'utf-8');
            const logs = JSON.parse(data);
            let guildLogs = logs[guildId] || [];

            if (type) {
                guildLogs = guildLogs.filter(log => log.type === type);
            }

            return guildLogs.slice(-limit).reverse();
        } catch (error) {
            return [];
        }
    }
}

module.exports = { LoggingModule };
