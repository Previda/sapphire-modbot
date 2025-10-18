const fs = require('fs').promises;
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class AppealLibrary {
    constructor() {
        this.appealsPath = path.join(__dirname, '../../data/appeals');
        this.init();
    }

    async init() {
        await fs.mkdir(this.appealsPath, { recursive: true });
    }

    // Generate random appeal code
    generateAppealCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Create appeal from moderation action
    async createAppeal(guildId, moderatedUserId, moderationType, moderatorId, originalReason, moderationTimestamp) {
        const appealCode = this.generateAppealCode();
        
        const appeal = {
            code: appealCode,
            guildId,
            moderatedUserId,
            moderationType, // 'ban', 'kick', 'mute', 'warn'
            moderatorId,
            originalReason,
            moderationTimestamp,
            status: 'pending', // 'pending', 'approved', 'rejected', 'under_review'
            createdAt: new Date().toISOString(),
            submittedAt: null,
            appealReason: null,
            appealEvidence: null,
            appealContact: null,
            reviewedBy: null,
            reviewedAt: null,
            reviewReason: null
        };

        await this.saveAppeal(guildId, appealCode, appeal);
        return appealCode;
    }

    // Submit appeal details
    async submitAppeal(appealCode, guildId, appealReason, appealEvidence, appealContact, submittedBy) {
        const appeal = await this.getAppeal(guildId, appealCode);
        
        if (!appeal) {
            throw new Error('Appeal not found');
        }

        if (appeal.status !== 'pending') {
            throw new Error('Appeal has already been submitted or reviewed');
        }

        // Verify the user submitting is the one who was moderated
        if (appeal.moderatedUserId !== submittedBy) {
            throw new Error('You can only submit appeals for your own moderation actions');
        }

        appeal.appealReason = appealReason;
        appeal.appealEvidence = appealEvidence;
        appeal.appealContact = appealContact;
        appeal.submittedAt = new Date().toISOString();
        appeal.status = 'under_review';

        await this.saveAppeal(guildId, appealCode, appeal);
        return appeal;
    }

    // Get appeal by code
    async getAppeal(guildId, appealCode) {
        try {
            const appealPath = path.join(this.appealsPath, guildId, `${appealCode}.json`);
            const data = await fs.readFile(appealPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    // Find appeal by code across all guilds (auto-retrieve server ID)
    async findAppealByCode(appealCode) {
        try {
            const guilds = await fs.readdir(this.appealsPath);
            
            for (const guildId of guilds) {
                const appeal = await this.getAppeal(guildId, appealCode);
                if (appeal) {
                    return { appeal, guildId };
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    // Save appeal
    async saveAppeal(guildId, appealCode, appealData) {
        const guildPath = path.join(this.appealsPath, guildId);
        await fs.mkdir(guildPath, { recursive: true });
        
        const appealPath = path.join(guildPath, `${appealCode}.json`);
        await fs.writeFile(appealPath, JSON.stringify(appealData, null, 2));
    }

    // Get all appeals for guild
    async getGuildAppeals(guildId, status = null) {
        try {
            const guildPath = path.join(this.appealsPath, guildId);
            const files = await fs.readdir(guildPath);
            const appeals = [];

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const appealData = await this.getAppeal(guildId, file.replace('.json', ''));
                    if (appealData && (!status || appealData.status === status)) {
                        appeals.push(appealData);
                    }
                }
            }

            return appeals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            return [];
        }
    }

    // Check if user has pending appeal
    async hasPendingAppeal(guildId, userId) {
        const appeals = await this.getGuildAppeals(guildId, 'pending');
        return appeals.some(appeal => appeal.moderatedUserId === userId);
    }

    // Review appeal
    async reviewAppeal(appealCode, guildId, reviewerId, decision, reviewReason = null) {
        const appeal = await this.getAppeal(guildId, appealCode);
        
        if (!appeal) {
            throw new Error('Appeal not found');
        }

        if (appeal.status !== 'under_review') {
            throw new Error('Appeal is not under review');
        }

        appeal.status = decision; // 'approved' or 'rejected'
        appeal.reviewedBy = reviewerId;
        appeal.reviewedAt = new Date().toISOString();
        appeal.reviewReason = reviewReason;

        await this.saveAppeal(guildId, appealCode, appeal);
        return appeal;
    }

    // Create appeal review embed
    createAppealEmbed(appeal, client) {
        const statusColors = {
            pending: 0xffa500,
            under_review: 0x0099ff,
            approved: 0x00ff00,
            rejected: 0xff0000
        };

        const statusEmojis = {
            pending: '⏳',
            under_review: '🔍',
            approved: '✅',
            rejected: '❌'
        };

        const embed = new EmbedBuilder()
            .setTitle(`📋 Appeal Review: ${appeal.code}`)
            .setColor(statusColors[appeal.status] || 0x5865f2)
            .addFields(
                { name: '🆔 Appeal Code', value: appeal.code, inline: true },
                { name: '👤 User ID', value: appeal.moderatedUserId, inline: true },
                { name: '⚖️ Original Action', value: appeal.moderationType.toUpperCase(), inline: true },
                { name: '📅 Moderated', value: `<t:${Math.floor(new Date(appeal.moderationTimestamp).getTime() / 1000)}:F>`, inline: true },
                { name: '📝 Original Reason', value: appeal.originalReason || 'No reason provided', inline: false }
            );

        if (appeal.appealReason) {
            embed.addFields(
                { name: '📝 Appeal Reason', value: appeal.appealReason, inline: false },
                { name: '🔍 Evidence', value: appeal.appealEvidence || 'None provided', inline: false },
                { name: '📞 Contact', value: appeal.appealContact || 'Discord DM', inline: true },
                { name: '📅 Submitted', value: `<t:${Math.floor(new Date(appeal.submittedAt).getTime() / 1000)}:F>`, inline: true }
            );
        }

        embed.addFields(
            { name: '⏳ Status', value: `${statusEmojis[appeal.status]} ${appeal.status.replace('_', ' ').toUpperCase()}`, inline: true }
        );

        if (appeal.reviewedBy) {
            embed.addFields(
                { name: '👮 Reviewed By', value: `<@${appeal.reviewedBy}>`, inline: true },
                { name: '📅 Reviewed', value: `<t:${Math.floor(new Date(appeal.reviewedAt).getTime() / 1000)}:F>`, inline: true }
            );
            
            if (appeal.reviewReason) {
                embed.addFields({ name: '📝 Review Reason', value: appeal.reviewReason, inline: false });
            }
        }

        embed.setTimestamp();
        return embed;
    }

    // Create review action buttons
    createReviewButtons(appealCode, requireReason = false) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`appeal_approve_${appealCode}`)
                    .setLabel('Approve')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`appeal_reject_${appealCode}`)
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌'),
                new ButtonBuilder()
                    .setCustomId(`appeal_skip_${appealCode}`)
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏭️')
            );

        if (requireReason) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`appeal_approve_reason_${appealCode}`)
                    .setLabel('Approve with Reason')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📝')
            );
        }

        return row;
    }

    // Check appeal validity
    async validateAppeal(appealCode, guildId) {
        const appeal = await this.getAppeal(guildId, appealCode);
        
        if (!appeal) {
            return { valid: false, reason: 'Appeal not found' };
        }

        if (appeal.status === 'approved') {
            return { valid: false, reason: 'Appeal already approved' };
        }

        if (appeal.status === 'rejected') {
            return { valid: false, reason: 'Appeal already rejected' };
        }

        // Check if appeal is too old (optional - 30 days)
        const daysSinceCreated = (Date.now() - new Date(appeal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated > 30) {
            return { valid: false, reason: 'Appeal expired (older than 30 days)' };
        }

        return { valid: true, appeal };
    }

    // Get user's appeal codes
    async getUserAppeals(guildId, userId) {
        const appeals = await this.getGuildAppeals(guildId);
        return appeals.filter(appeal => appeal.moderatedUserId === userId);
    }

    // Auto-generate appeal for moderation action
    async autoGenerateAppeal(guildId, userId, moderationType, moderatorId, reason) {
        const appealCode = await this.createAppeal(
            guildId,
            userId,
            moderationType,
            moderatorId,
            reason,
            new Date().toISOString()
        );

        return appealCode;
    }

    // Delete appeal
    async deleteAppeal(guildId, appealCode) {
        try {
            const appealPath = path.join(this.appealsPath, guildId, `${appealCode}.json`);
            await fs.unlink(appealPath);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get appeal statistics
    async getAppealStats(guildId) {
        const appeals = await this.getGuildAppeals(guildId);
        
        const stats = {
            total: appeals.length,
            pending: appeals.filter(a => a.status === 'pending').length,
            under_review: appeals.filter(a => a.status === 'under_review').length,
            approved: appeals.filter(a => a.status === 'approved').length,
            rejected: appeals.filter(a => a.status === 'rejected').length
        };

        return stats;
    }
}

module.exports = new AppealLibrary();
