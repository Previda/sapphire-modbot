const express = require('express');
const cors = require('cors');
const { EmbedBuilder } = require('discord.js');
const { logEvent } = require('../utils/logger');
const { isSuperuser, getSuperusers, addSuperuser, removeSuperuser } = require('../utils/superuserManager');
const fs = require('fs').promises;
const path = require('path');

class DashboardAPI {
    constructor(client) {
        this.client = client;
        this.app = express();
        this.port = process.env.DASHBOARD_PORT || 3000;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: ['http://localhost:3000', 'https://previda-bot.web.app', 'https://previda-bot.firebaseapp.com'],
            credentials: true
        }));
        this.app.use(express.json());
        
        // Authentication middleware
        this.app.use('/api', (req, res, next) => {
            const auth = req.headers.authorization;
            if (!auth || !auth.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            
            const token = auth.split(' ')[1];
            // In production, verify Discord OAuth token
            // For now, using simple validation
            if (token !== process.env.DASHBOARD_SECRET) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            
            next();
        });
    }

    setupRoutes() {
        // Bot stats
        this.app.get('/api/stats', (req, res) => {
            try {
                const stats = {
                    servers: this.client.guilds.cache.size,
                    users: this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
                    commands: this.client.commands.size,
                    uptime: process.uptime(),
                    status: 'online'
                };
                res.json(stats);
            } catch (error) {
                console.error('Error getting stats:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Get all commands
        this.app.get('/api/commands', async (req, res) => {
            try {
                const commands = [];
                const commandsConfig = await this.getCommandsConfig();
                
                for (const [name, command] of this.client.commands) {
                    const config = commandsConfig[name] || { enabled: true };
                    commands.push({
                        name: name,
                        description: command.data.description,
                        category: this.getCommandCategory(command),
                        enabled: config.enabled,
                        permissions: command.data.default_member_permissions?.toString() || null,
                        cooldown: config.cooldown || 0
                    });
                }
                
                res.json(commands);
            } catch (error) {
                console.error('Error getting commands:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Toggle command
        this.app.post('/api/commands/:name/toggle', async (req, res) => {
            try {
                const { name } = req.params;
                const { enabled, userId } = req.body;
                
                if (!this.client.commands.has(name)) {
                    return res.status(404).json({ error: 'Command not found' });
                }
                
                const commandsConfig = await this.getCommandsConfig();
                commandsConfig[name] = { 
                    ...(commandsConfig[name] || {}), 
                    enabled: enabled 
                };
                
                await this.saveCommandsConfig(commandsConfig);
                
                // Log the change
                const user = await this.client.users.fetch(userId).catch(() => null);
                if (user) {
                    for (const guild of this.client.guilds.cache.values()) {
                        await logEvent(guild, {
                            type: 'COMMAND_TOGGLE',
                            executor: user,
                            reason: `Command /${name} ${enabled ? 'enabled' : 'disabled'} via dashboard`,
                            timestamp: new Date()
                        });
                    }
                }
                
                res.json({ success: true, enabled });
            } catch (error) {
                console.error('Error toggling command:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Get guild settings
        this.app.get('/api/guilds/:guildId/settings', async (req, res) => {
            try {
                const { guildId } = req.params;
                const guild = this.client.guilds.cache.get(guildId);
                
                if (!guild) {
                    return res.status(404).json({ error: 'Guild not found' });
                }
                
                const settings = await this.getGuildSettings(guildId);
                res.json(settings);
            } catch (error) {
                console.error('Error getting guild settings:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Update guild settings
        this.app.post('/api/guilds/:guildId/settings', async (req, res) => {
            try {
                const { guildId } = req.params;
                const settings = req.body;
                
                const guild = this.client.guilds.cache.get(guildId);
                if (!guild) {
                    return res.status(404).json({ error: 'Guild not found' });
                }
                
                await this.saveGuildSettings(guildId, settings);
                
                res.json({ success: true });
            } catch (error) {
                console.error('Error updating guild settings:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Get security settings
        this.app.get('/api/security/settings', async (req, res) => {
            try {
                const settings = await this.getSecuritySettings();
                res.json(settings);
            } catch (error) {
                console.error('Error getting security settings:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Update security settings
        this.app.post('/api/security/settings', async (req, res) => {
            try {
                const { userId, ...settings } = req.body;
                await this.saveSecuritySettings(settings);
                
                // Log the change
                const user = await this.client.users.fetch(userId).catch(() => null);
                if (user) {
                    for (const guild of this.client.guilds.cache.values()) {
                        await logEvent(guild, {
                            type: 'SECURITY_CONFIG_UPDATE',
                            executor: user,
                            reason: 'Security settings updated via dashboard',
                            details: JSON.stringify(settings),
                            timestamp: new Date()
                        });
                    }
                }
                
                res.json({ success: true });
            } catch (error) {
                console.error('Error updating security settings:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Execute bot actions
        this.app.post('/api/actions/:action', async (req, res) => {
            try {
                const { action } = req.params;
                const { userId } = req.body;
                
                let result = null;
                
                switch (action) {
                    case 'refresh':
                        result = await this.refreshBot();
                        break;
                    case 'deploy-commands':
                        result = await this.deployCommands();
                        break;
                    case 'backup':
                        result = await this.generateBackup();
                        break;
                    default:
                        return res.status(400).json({ error: 'Invalid action' });
                }
                
                // Log the action
                const user = await this.client.users.fetch(userId).catch(() => null);
                if (user) {
                    for (const guild of this.client.guilds.cache.values()) {
                        await logEvent(guild, {
                            type: 'DASHBOARD_ACTION',
                            executor: user,
                            reason: `Dashboard action: ${action}`,
                            timestamp: new Date()
                        });
                    }
                }
                
                res.json({ success: true, result });
            } catch (error) {
                console.error(`Error executing action ${req.params.action}:`, error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Get logs
        this.app.get('/api/logs', async (req, res) => {
            try {
                const { limit = 50, type } = req.query;
                const logs = await this.getLogs(parseInt(limit), type);
                res.json(logs);
            } catch (error) {
                console.error('Error getting logs:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }

    async getCommandsConfig() {
        try {
            const configPath = path.join(__dirname, '../../data/commands-config.json');
            const data = await fs.readFile(configPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return {}; // Return empty config if file doesn't exist
        }
    }

    async saveCommandsConfig(config) {
        try {
            const configPath = path.join(__dirname, '../../data/commands-config.json');
            const dataDir = path.dirname(configPath);
            
            // Ensure data directory exists
            await fs.mkdir(dataDir, { recursive: true });
            
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        } catch (error) {
            console.error('Error saving commands config:', error);
        }
    }

    async getGuildSettings(guildId) {
        try {
            const settingsPath = path.join(__dirname, `../../data/guilds/${guildId}/settings.json`);
            const data = await fs.readFile(settingsPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return {
                prefix: '!',
                automod: { enabled: true },
                logging: { enabled: true },
                tickets: { enabled: true }
            };
        }
    }

    async saveGuildSettings(guildId, settings) {
        try {
            const settingsPath = path.join(__dirname, `../../data/guilds/${guildId}/settings.json`);
            const settingsDir = path.dirname(settingsPath);
            
            await fs.mkdir(settingsDir, { recursive: true });
            await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
        } catch (error) {
            console.error('Error saving guild settings:', error);
        }
    }

    async getSecuritySettings() {
        try {
            const settingsPath = path.join(__dirname, '../../data/security-settings.json');
            const data = await fs.readFile(settingsPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return {
                antiRaid: {
                    enabled: true,
                    joinThreshold: 10,
                    timeWindow: 30,
                    autoKick: true
                },
                antiNuke: {
                    enabled: true,
                    channelDeleteLimit: 3,
                    autoResponse: true,
                    removePerms: true
                }
            };
        }
    }

    async saveSecuritySettings(settings) {
        try {
            const settingsPath = path.join(__dirname, '../../data/security-settings.json');
            const dataDir = path.dirname(settingsPath);
            
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
        } catch (error) {
            console.error('Error saving security settings:', error);
        }
    }

    getCommandCategory(command) {
        if (!command.data || !command.data.name) return 'Unknown';
        
        const categoryMap = {
            ban: 'Moderation',
            kick: 'Moderation', 
            warn: 'Moderation',
            mute: 'Moderation',
            timeout: 'Moderation',
            case: 'Moderation',
            lock: 'Security',
            log: 'Logging',
            panel: 'Tickets',
            ticket: 'Tickets',
            manage: 'Tickets',
            automod: 'AutoMod',
            ping: 'Utility',
            rank: 'Utility',
            leaderboard: 'Utility',
            userinfo: 'Utility'
        };
        
        return categoryMap[command.data.name] || 'Other';
    }

    async refreshBot() {
        // Refresh bot status, clear caches, etc.
        console.log('🔄 Dashboard: Bot refresh requested');
        
        // Clear command cooldowns, refresh caches, etc.
        this.client.cooldowns?.clear?.();
        
        return { message: 'Bot refreshed successfully' };
    }

    async deployCommands() {
        try {
            console.log('⚡ Dashboard: Deploying commands...');
            
            const commands = [];
            for (const command of this.client.commands.values()) {
                commands.push(command.data.toJSON());
            }
            
            // Deploy to all guilds
            for (const guild of this.client.guilds.cache.values()) {
                await guild.commands.set(commands);
            }
            
            return { message: `Deployed ${commands.length} commands to ${this.client.guilds.cache.size} guilds` };
        } catch (error) {
            console.error('Error deploying commands:', error);
            throw error;
        }
    }

    async generateBackup() {
        try {
            console.log('💾 Dashboard: Generating backup...');
            
            const backup = {
                timestamp: new Date().toISOString(),
                guilds: [],
                commands: Array.from(this.client.commands.keys()),
                settings: await this.getSecuritySettings()
            };
            
            for (const guild of this.client.guilds.cache.values()) {
                backup.guilds.push({
                    id: guild.id,
                    name: guild.name,
                    memberCount: guild.memberCount,
                    settings: await this.getGuildSettings(guild.id)
                });
            }
            
            const backupPath = path.join(__dirname, `../../backups/dashboard-backup-${Date.now()}.json`);
            const backupDir = path.dirname(backupPath);
            
            await fs.mkdir(backupDir, { recursive: true });
            await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
            
            return { message: 'Backup generated successfully', file: path.basename(backupPath) };
        } catch (error) {
            console.error('Error generating backup:', error);
            throw error;
        }
    }

    async getLogs(limit = 50, type = null) {
        try {
            // In a real implementation, you'd fetch from your logging system
            const logs = [];
            const logTypes = ['COMMAND_TOGGLE', 'SECURITY_CONFIG_UPDATE', 'DASHBOARD_ACTION'];
            
            for (let i = 0; i < Math.min(limit, 10); i++) {
                logs.push({
                    id: i,
                    type: logTypes[Math.floor(Math.random() * logTypes.length)],
                    message: `Sample log entry ${i}`,
                    timestamp: new Date(Date.now() - i * 60000).toISOString(),
                    user: 'Dashboard User'
                });
            }
            
            return logs;
        } catch (error) {
            console.error('Error getting logs:', error);
            return [];
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🌐 Dashboard API running on port ${this.port}`);
        });
    }

    // Method to check if user can access dashboard
    async canAccessDashboard(userId, guildId) {
        try {
            // Check if user is superuser
            if (isSuperuser(userId)) return true;
            
            // Check if user is admin in the guild
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) return false;
            
            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) return false;
            
            return member.permissions.has('Administrator') || 
                   member.permissions.has('ManageGuild');
        } catch (error) {
            console.error('Error checking dashboard access:', error);
            return false;
        }
    }
}

module.exports = DashboardAPI;
