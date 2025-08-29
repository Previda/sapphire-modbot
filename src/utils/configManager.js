const fs = require('fs').promises;
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '../../data/configs');

// Ensure config directory exists
async function ensureConfigDir() {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating config directory:', error);
    }
}

// Load guild configuration
async function loadGuildConfig(guildId) {
    await ensureConfigDir();
    const configPath = path.join(CONFIG_DIR, `${guildId}.json`);
    
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return default config if file doesn't exist
        return {
            guildId: guildId,
            moderation: {
                logChannelId: null,
                automod: {
                    enabled: false,
                    antiSpam: false,
                    antiRaid: false,
                    antiNuke: false
                }
            },
            appeals: {
                enabled: true,
                categoryId: null,
                logChannelId: null
            },
            tickets: {
                enabled: false,
                categoryId: null,
                supportRoleIds: [],
                transcriptChannelId: null
            },
            xp: {
                enabled: false,
                multiplier: 1,
                roleRewards: [],
                ignoredChannels: []
            },
            welcome: {
                enabled: false,
                channelId: null,
                message: null,
                roleId: null
            },
            antiraid: {
                enabled: false,
                threshold: 10,
                timeWindow: 60,
                action: 'kick'
            },
            antinuke: {
                enabled: false,
                maxActionsPerMinute: 5,
                protectedRoles: [],
                protectedChannels: []
            }
        };
    }
}

// Save guild configuration
async function saveGuildConfig(guildId, config) {
    await ensureConfigDir();
    const configPath = path.join(CONFIG_DIR, `${guildId}.json`);
    
    try {
        config.lastUpdated = new Date().toISOString();
        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving guild config:', error);
        return false;
    }
}

// Get specific config section
async function getConfigSection(guildId, section) {
    const config = await loadGuildConfig(guildId);
    return config[section] || {};
}

// Update specific config section
async function updateConfigSection(guildId, section, data) {
    const config = await loadGuildConfig(guildId);
    config[section] = { ...config[section], ...data };
    return await saveGuildConfig(guildId, config);
}

// Delete guild configuration
async function deleteGuildConfig(guildId) {
    const configPath = path.join(CONFIG_DIR, `${guildId}.json`);
    
    try {
        await fs.unlink(configPath);
        return true;
    } catch (error) {
        console.error('Error deleting guild config:', error);
        return false;
    }
}

// List all guild configs
async function listGuildConfigs() {
    await ensureConfigDir();
    
    try {
        const files = await fs.readdir(CONFIG_DIR);
        return files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
    } catch (error) {
        console.error('Error listing guild configs:', error);
        return [];
    }
}

module.exports = {
    loadGuildConfig,
    saveGuildConfig,
    getConfigSection,
    updateConfigSection,
    deleteGuildConfig,
    listGuildConfigs
};
