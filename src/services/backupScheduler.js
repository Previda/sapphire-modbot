const { connectToMongoDB, isConnected, getConnection } = require('../models/database');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;

/**
 * Automatic Backup Scheduler Service
 * Handles scheduled backups and disaster recovery
 */

class BackupScheduler {
    constructor(client) {
        this.client = client;
        this.isRunning = false;
        this.interval = null;
    }

    start() {
        if (this.isRunning) return;
        
        console.log('🔄 Starting backup scheduler...');
        this.isRunning = true;
        
        // Check for due backups every 5 minutes
        this.interval = setInterval(() => {
            this.checkDueBackups();
        }, 5 * 60 * 1000);

        // Initial check
        this.checkDueBackups();
    }

    stop() {
        if (!this.isRunning) return;
        
        console.log('⏹️ Stopping backup scheduler...');
        this.isRunning = false;
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    async checkDueBackups() {
        try {
            // Skip if using local storage fallback
            if (!isConnected()) {
                console.log('📦 Backup scheduler: Using local storage, skipping database backups');
                return;
            }

            // TODO: Implement MongoDB backup schedules when needed
            // For now, skip scheduled backups in MongoDB mode
            console.log('📦 Backup scheduler: MongoDB mode - scheduled backups not yet implemented');
            
        } catch (error) {
            console.error('Error checking due backups:', error);
        }
    }

    async performScheduledBackup(schedule) {
        try {
            console.log(`📦 Creating scheduled backup for guild ${schedule.guildID}`);

            const guild = this.client.guilds.cache.get(schedule.guildID);
            if (!guild) {
                console.warn(`Guild ${schedule.guildID} not found, skipping backup`);
                return;
            }

            // Create backup data
            const backupData = await this.collectBackupData(schedule.guildID);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupId = `auto_backup_${schedule.guildID}_${timestamp}`;

            const backup = {
                metadata: {
                    backupId,
                    serverName: guild.name,
                    serverId: schedule.guildID,
                    timestamp,
                    type: 'scheduled',
                    frequency: schedule.frequency,
                    version: '1.0'
                },
                data: backupData
            };

            const backupJson = JSON.stringify(backup, null, 2);
            const buffer = Buffer.from(backupJson, 'utf8');
            const filename = `${backupId}.json`;

            // Store backup info
            await this.storeBackupInfo(backupId, schedule.guildID, 'scheduled', filename, buffer.length);

            // Send to backup channel
            await this.sendBackupToChannel(schedule, backup, buffer, filename);

            // Update next backup time
            await this.updateNextBackup(schedule);

            console.log(`✅ Scheduled backup completed for guild ${schedule.guildID}`);

        } catch (error) {
            console.error(`Error performing scheduled backup for guild ${schedule.guildID}:`, error);
            
            // Log the failure
            await this.logDisasterRecoveryEvent(schedule.guildID, 'backup_failed', {
                error: error.message,
                schedule_id: schedule.id
            });
        }
    }

    async collectBackupData(guildID) {
        const data = {};
        
        // For local storage fallback, create empty backup data structure
        if (!isConnected()) {
            console.log('📦 Creating backup with local storage data structure');
            const collections = [
                'tickets', 'notes', 'strikes', 'invites', 'threat_scores',
                'automod_configs', 'appeal_questions', 'appeals', 'pi_runners',
                'punishments', 'verifications', 'guild_configs', 'user_economy'
            ];
            
            collections.forEach(collection => {
                data[collection] = []; // Empty for now - TODO: implement local storage backup
            });
        }

        return data;
    }

    async sendBackupToChannel(schedule, backup, buffer, filename) {
        try {
            if (!schedule.channelID) return;

            const channel = await this.client.channels.fetch(schedule.channelID);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setTitle('📦 Scheduled Backup Created')
                .setColor('#00ff00')
                .addFields(
                    { name: 'Backup ID', value: backup.metadata.backupId, inline: true },
                    { name: 'Server', value: backup.metadata.serverName, inline: true },
                    { name: 'Frequency', value: schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1), inline: true },
                    { name: 'Size', value: `${(buffer.length / 1024).toFixed(2)} KB`, inline: true },
                    { name: 'Tables', value: `${Object.keys(backup.data).length}`, inline: true },
                    { name: 'Status', value: '✅ Backup Complete', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Automatic Backup System' });

            await channel.send({
                embeds: [embed],
                files: [{
                    attachment: buffer,
                    name: filename
                }]
            });

        } catch (error) {
            console.error('Error sending backup to channel:', error);
        }
    }

    async updateNextBackup(schedule) {
        // Skip if using local storage fallback
        if (!isConnected()) {
            console.log('📦 Backup scheduler: Local storage mode - skipping next backup update');
            return;
        }

        // TODO: Implement MongoDB backup schedule updates when needed
        console.log('📦 MongoDB backup schedule update - not yet implemented');
    }

    async storeBackupInfo(backupId, guildID, type, filename, size) {
        try {
            // Skip if using local storage fallback
            if (!isConnected()) {
                console.log('📦 Backup info stored locally (not implemented yet)');
                return;
            }

            // TODO: Implement MongoDB backup history storage
            console.log('📦 MongoDB backup history - not yet implemented');
            
            await this.logDisasterRecoveryEvent(guildID, 'backup_created', {
                backup_id: backupId,
                type,
                size
            });
        } catch (error) {
            console.warn('Failed to store backup info:', error.message);
        }
    }

    async logDisasterRecoveryEvent(guildID, eventType, details, performedBy = 'system') {
        try {
            // Skip if using local storage fallback
            if (!isConnected()) {
                console.log(`📦 Disaster recovery event logged locally: ${eventType}`);
                return;
            }

            // TODO: Implement MongoDB disaster recovery logging
            console.log(`📦 MongoDB disaster recovery log - not yet implemented: ${eventType}`);
        } catch (error) {
            console.warn('Failed to log disaster recovery event:', error.message);
        }
    }

    // Emergency backup creation (triggered by critical events)
    async createEmergencyBackup(guildID, reason = 'Emergency backup') {
        try {
            console.log(`🚨 Creating emergency backup for guild ${guildID}: ${reason}`);

            const guild = this.client.guilds.cache.get(guildID);
            if (!guild) return null;

            const backupData = await this.collectCriticalData(guildID);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupId = `emergency_backup_${guildID}_${timestamp}`;

            const backup = {
                metadata: {
                    backupId,
                    serverName: guild.name,
                    serverId: guildID,
                    timestamp,
                    type: 'emergency',
                    reason,
                    version: '1.0'
                },
                data: backupData
            };

            const backupJson = JSON.stringify(backup, null, 2);
            const buffer = Buffer.from(backupJson, 'utf8');
            const filename = `${backupId}.json`;

            await this.storeBackupInfo(backupId, guildID, 'emergency', filename, buffer.length);

            // Try to send to backup channel or admin
            await this.sendEmergencyBackup(guildID, backup, buffer, filename);

            await this.logDisasterRecoveryEvent(guildID, 'emergency_backup', {
                backup_id: backupId,
                reason,
                size: buffer.length
            });

            return { backup, buffer, filename };

        } catch (error) {
            console.error(`Error creating emergency backup for guild ${guildID}:`, error);
            return null;
        }
    }

    async collectCriticalData(guildID) {
        const data = {};
        const criticalTables = ['guild_configs', 'punishments', 'tickets', 'user_economy', 'automod_configs'];
        
        // For local storage fallback, create empty data structure
        if (!isConnected()) {
            console.log('📦 Creating critical backup with local storage data structure');
            criticalTables.forEach(table => {
                data[table] = []; // Empty for now - TODO: implement local storage backup
            });
        }
        
        return data;
    }

    async sendEmergencyBackup(guildID, backup, buffer, filename) {
        try {
            let channel = null;
            
            // Skip database lookup if using local storage fallback
            if (!isConnected()) {
                console.log('📦 Emergency backup: Local storage mode - skipping backup channel lookup');
            }

            // If no backup channel, try to find admin or owner
            if (!channel) {
                const guild = this.client.guilds.cache.get(guildID);
                if (guild) {
                    const owner = await guild.fetchOwner().catch(() => null);
                    if (owner) {
                        channel = await owner.createDM().catch(() => null);
                    }
                }
            }

            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle('🚨 Emergency Backup Created')
                    .setColor('#ff0000')
                    .addFields(
                        { name: 'Backup ID', value: backup.metadata.backupId, inline: true },
                        { name: 'Server', value: backup.metadata.serverName, inline: true },
                        { name: 'Reason', value: backup.metadata.reason, inline: true },
                        { name: 'Size', value: `${(buffer.length / 1024).toFixed(2)} KB`, inline: true },
                        { name: 'Critical Data', value: `${Object.keys(backup.data).length} tables`, inline: true },
                        { name: 'Status', value: '⚠️ Emergency Backup', inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Emergency Backup System' });

                await channel.send({
                    content: '🚨 **EMERGENCY BACKUP CREATED** - Please save this file immediately!',
                    embeds: [embed],
                    files: [{
                        attachment: buffer,
                        name: filename
                    }]
                });
            }

        } catch (error) {
            console.error('Error sending emergency backup:', error);
        }
    }

    // Cleanup old backups
    async cleanupOldBackups() {
        try {
            // Skip if using local storage fallback
            if (!isConnected()) {
                console.log('🧹 Backup cleanup: Local storage mode - skipping database cleanup');
                return;
            }

            // TODO: Implement MongoDB backup cleanup when needed
            console.log('🧹 MongoDB backup cleanup - not yet implemented');

        } catch (error) {
            console.error('Error cleaning up old backups:', error);
        }
    }

    // Health check for backup system
    async healthCheck() {
        try {
            // Return basic health check for local storage mode
            if (!isConnected()) {
                return {
                    isHealthy: this.isRunning,
                    activeSchedules: 0,
                    recentBackups: 0,
                    failedBackups: 0,
                    mode: 'local_storage',
                    lastCheck: new Date()
                };
            }

            // TODO: Implement MongoDB backup health check when needed
            return {
                isHealthy: this.isRunning,
                activeSchedules: 0,
                recentBackups: 0,
                failedBackups: 0,
                mode: 'mongodb_not_implemented',
                lastCheck: new Date()
            };

        } catch (error) {
            console.error('Error performing backup health check:', error);
            return {
                isHealthy: false,
                error: error.message,
                lastCheck: new Date()
            };
        }
    }
}

module.exports = BackupScheduler;
