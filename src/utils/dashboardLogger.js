// Try to load node-fetch, but don't fail if not available
let fetch;
try {
    fetch = require('node-fetch');
} catch (error) {
    // Use native fetch if available (Node 18+) or create a dummy
    fetch = globalThis.fetch || (async () => ({ ok: false }));
}

class DashboardLogger {
    constructor() {
        this.dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
        this.botToken = process.env.PI_BOT_TOKEN || 'default_token';
    }

    async logCommand(commandName, user, guild, additionalData = {}) {
        try {
            const logData = {
                command: commandName,
                user: `${user.tag} (${user.id})`,
                guild: guild ? `${guild.name} (${guild.id})` : 'DM',
                timestamp: new Date().toISOString(),
                ...additionalData
            };

            await fetch(`${this.dashboardUrl}/api/bot/commands/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.botToken}`
                },
                body: JSON.stringify(logData)
            });
        } catch (error) {
            console.error('Failed to log command to dashboard:', error.message);
        }
    }

    async logError(error, interaction = null) {
        try {
            const errorData = {
                error: error.message || error.toString(),
                stack: error.stack,
                interaction: interaction ? {
                    commandName: interaction.commandName,
                    user: `${interaction.user.tag} (${interaction.user.id})`,
                    guild: interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : 'DM',
                    channelId: interaction.channelId
                } : null,
                timestamp: new Date().toISOString()
            };

            await fetch(`${this.dashboardUrl}/api/bot/errors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.botToken}`
                },
                body: JSON.stringify(errorData)
            });
        } catch (logError) {
            console.error('Failed to log error to dashboard:', logError.message);
        }
    }

    async logModeration(action, user, moderator, guild, reason, caseId = null) {
        try {
            await this.logCommand(`moderation-${action}`, moderator, guild, {
                target: `${user.tag} (${user.id})`,
                reason,
                caseId,
                action
            });
        } catch (error) {
            console.error('Failed to log moderation action:', error.message);
        }
    }

    async logTicketAction(action, user, guild, ticketId = null, additionalData = {}) {
        try {
            await this.logCommand(`ticket-${action}`, user, guild, {
                ticketId,
                action,
                ...additionalData
            });
        } catch (error) {
            console.error('Failed to log ticket action:', error.message);
        }
    }
}

module.exports = new DashboardLogger();
