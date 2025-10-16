const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Sync database
const SYNC_DB = path.join(__dirname, '../../data/websync.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(SYNC_DB))) {
  fs.mkdirSync(path.dirname(SYNC_DB), { recursive: true });
}

// Load sync data
function loadSyncData() {
  try {
    if (fs.existsSync(SYNC_DB)) {
      return JSON.parse(fs.readFileSync(SYNC_DB, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading sync data:', error);
  }
  return {
    lastSync: null,
    guilds: {},
    commands: {},
    users: {},
    stats: {}
  };
}

// Save sync data
function saveSyncData(data) {
  try {
    fs.writeFileSync(SYNC_DB, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving sync data:', error);
  }
}

// Initialize WebSync
class WebSync {
  constructor(client, apiUrl) {
    this.client = client;
    this.apiUrl = apiUrl;
    this.syncInterval = null;
    this.syncData = loadSyncData();
  }

  // Start automatic syncing
  start() {
    console.log('🔄 WebSync: Starting automatic sync...');
    
    // Initial sync
    this.syncAll();
    
    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncAll();
    }, 30000);
  }

  // Stop syncing
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      console.log('🛑 WebSync: Stopped');
    }
  }

  // Sync all data
  async syncAll() {
    try {
      await Promise.all([
        this.syncGuilds(),
        this.syncCommands(),
        this.syncUsers(),
        this.syncStats()
      ]);
      
      this.syncData.lastSync = new Date().toISOString();
      saveSyncData(this.syncData);
      
      console.log('✅ WebSync: Complete');
    } catch (error) {
      console.error('❌ WebSync error:', error.message);
    }
  }

  // Sync guild data
  async syncGuilds() {
    const guilds = this.client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      memberCount: guild.memberCount,
      onlineMembers: guild.members.cache.filter(m => m.presence?.status !== 'offline').size,
      boostLevel: guild.premiumTier,
      boostCount: guild.premiumSubscriptionCount || 0,
      ownerId: guild.ownerId,
      features: guild.features,
      channels: guild.channels.cache.size,
      roles: guild.roles.cache.size,
      emojis: guild.emojis.cache.size
    }));

    this.syncData.guilds = guilds.reduce((acc, guild) => {
      acc[guild.id] = guild;
      return acc;
    }, {});

    // Send to API
    try {
      await axios.post(`${this.apiUrl}/api/internal/sync-guilds`, {
        guilds,
        timestamp: Date.now()
      }, { timeout: 5000 });
    } catch (error) {
      // Silent fail - data still saved locally
    }
  }

  // Sync command data
  async syncCommands() {
    const commands = this.client.application.commands.cache.map(cmd => ({
      id: cmd.id,
      name: cmd.name,
      description: cmd.description,
      options: cmd.options,
      defaultMemberPermissions: cmd.defaultMemberPermissions,
      dmPermission: cmd.dmPermission
    }));

    this.syncData.commands = commands.reduce((acc, cmd) => {
      acc[cmd.name] = cmd;
      return acc;
    }, {});

    // Send to API
    try {
      await axios.post(`${this.apiUrl}/api/internal/sync-commands`, {
        commands,
        timestamp: Date.now()
      }, { timeout: 5000 });
    } catch (error) {
      // Silent fail
    }
  }

  // Sync user data
  async syncUsers() {
    const users = {};
    
    this.client.guilds.cache.forEach(guild => {
      guild.members.cache.forEach(member => {
        if (!users[member.id]) {
          users[member.id] = {
            id: member.user.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            avatar: member.user.displayAvatarURL(),
            bot: member.user.bot,
            guilds: []
          };
        }
        users[member.id].guilds.push({
          guildId: guild.id,
          guildName: guild.name,
          joinedAt: member.joinedTimestamp,
          roles: member.roles.cache.map(r => r.name)
        });
      });
    });

    this.syncData.users = users;

    // Send to API
    try {
      await axios.post(`${this.apiUrl}/api/internal/sync-users`, {
        userCount: Object.keys(users).length,
        timestamp: Date.now()
      }, { timeout: 5000 });
    } catch (error) {
      // Silent fail
    }
  }

  // Sync statistics
  async syncStats() {
    const stats = {
      totalGuilds: this.client.guilds.cache.size,
      totalUsers: this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
      totalCommands: this.client.application.commands.cache.size,
      uptime: this.client.uptime,
      ping: this.client.ws.ping,
      memoryUsage: process.memoryUsage(),
      timestamp: Date.now()
    };

    this.syncData.stats = stats;

    // Send to API
    try {
      await axios.post(`${this.apiUrl}/api/internal/sync-stats`, stats, { timeout: 5000 });
    } catch (error) {
      // Silent fail
    }
  }

  // Get sync status
  getStatus() {
    return {
      lastSync: this.syncData.lastSync,
      guilds: Object.keys(this.syncData.guilds).length,
      commands: Object.keys(this.syncData.commands).length,
      users: Object.keys(this.syncData.users).length,
      isRunning: this.syncInterval !== null
    };
  }

  // Manual sync trigger
  async triggerSync() {
    console.log('🔄 WebSync: Manual sync triggered');
    await this.syncAll();
  }
}

module.exports = WebSync;
