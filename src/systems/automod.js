const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Database files
const AUTOMOD_DB = path.join(__dirname, '../../data/automod-config.json');
const WARNINGS_DB = path.join(__dirname, '../../data/automod-warnings.json');
const FILTERS_DB = path.join(__dirname, '../../data/automod-filters.json');

// Ensure directories exist
[AUTOMOD_DB, WARNINGS_DB, FILTERS_DB].forEach(file => {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Load/Save functions
function loadDB(file, defaultData = {}) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
  return defaultData;
}

function saveDB(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${file}:`, error);
  }
}

// Default config
const DEFAULT_CONFIG = {
  enabled: true,
  logChannelId: null,
  
  // Spam detection
  spamEnabled: true,
  spamMessages: 5,
  spamTime: 5000,
  spamAction: 'timeout',
  
  // Link filtering
  linksEnabled: true,
  linksAction: 'delete',
  allowedDomains: ['youtube.com', 'discord.gg'],
  
  // Caps detection
  capsEnabled: true,
  capsPercent: 70,
  capsAction: 'warn',
  
  // Mention spam
  mentionsEnabled: true,
  maxMentions: 5,
  mentionsAction: 'timeout',
  
  // Bad words filter
  badWordsEnabled: true,
  badWordsAction: 'delete',
  customBadWords: [],
  
  // Invite links
  invitesEnabled: true,
  invitesAction: 'delete',
  
  // Duplicate messages
  duplicateEnabled: true,
  duplicateAction: 'warn',
  
  // Auto-punishments
  warnings: {
    3: 'timeout',
    5: 'kick',
    7: 'ban'
  },
  
  // Whitelist
  whitelistedRoles: [],
  whitelistedChannels: []
};

// Default bad words list
const DEFAULT_BAD_WORDS = [
  'badword1', 'badword2', 'badword3' // Add your own
];

// Get guild config
function getConfig(guildId) {
  const configs = loadDB(AUTOMOD_DB, {});
  return configs[guildId] || DEFAULT_CONFIG;
}

// Save guild config
function saveConfig(guildId, config) {
  const configs = loadDB(AUTOMOD_DB, {});
  configs[guildId] = { ...DEFAULT_CONFIG, ...config };
  saveDB(AUTOMOD_DB, configs);
}

// User message tracking
const userMessages = new Map();

// Check if user is whitelisted
function isWhitelisted(member, channel, config) {
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (config.whitelistedRoles.some(roleId => member.roles.cache.has(roleId))) return true;
  if (config.whitelistedChannels.includes(channel.id)) return true;
  return false;
}

// Add warning
function addWarning(guildId, userId, reason) {
  const warnings = loadDB(WARNINGS_DB, {});
  if (!warnings[guildId]) warnings[guildId] = {};
  if (!warnings[guildId][userId]) warnings[guildId][userId] = [];
  
  warnings[guildId][userId].push({
    reason,
    timestamp: new Date().toISOString()
  });
  
  saveDB(WARNINGS_DB, warnings);
  return warnings[guildId][userId].length;
}

// Get warnings
function getWarnings(guildId, userId) {
  const warnings = loadDB(WARNINGS_DB, {});
  return warnings[guildId]?.[userId] || [];
}

// Auto-moderate message
async function moderateMessage(message) {
  if (message.author.bot) return;
  if (!message.guild) return;
  
  const config = getConfig(message.guild.id);
  if (!config.enabled) return;
  
  const { member, channel, content, guild } = message;
  
  // Check whitelist
  if (isWhitelisted(member, channel, config)) return;
  
  let violated = false;
  let reason = '';
  let action = 'warn';
  
  // Spam detection
  if (config.spamEnabled) {
    const userId = message.author.id;
    if (!userMessages.has(userId)) {
      userMessages.set(userId, []);
    }
    
    const messages = userMessages.get(userId);
    messages.push(Date.now());
    
    // Remove old messages
    const recent = messages.filter(time => Date.now() - time < config.spamTime);
    userMessages.set(userId, recent);
    
    if (recent.length >= config.spamMessages) {
      violated = true;
      reason = 'Spam detected';
      action = config.spamAction;
      userMessages.delete(userId);
    }
  }
  
  // Link filtering
  if (config.linksEnabled && !violated) {
    const linkRegex = /(https?:\/\/[^\s]+)/gi;
    const links = content.match(linkRegex);
    
    if (links) {
      const allowed = links.every(link => 
        config.allowedDomains.some(domain => link.includes(domain))
      );
      
      if (!allowed) {
        violated = true;
        reason = 'Unauthorized link';
        action = config.linksAction;
      }
    }
  }
  
  // Caps detection
  if (config.capsEnabled && !violated && content.length > 10) {
    const caps = content.replace(/[^A-Z]/g, '').length;
    const total = content.replace(/[^A-Za-z]/g, '').length;
    
    if (total > 0 && (caps / total) * 100 >= config.capsPercent) {
      violated = true;
      reason = 'Excessive caps';
      action = config.capsAction;
    }
  }
  
  // Mention spam
  if (config.mentionsEnabled && !violated) {
    const mentions = message.mentions.users.size + message.mentions.roles.size;
    
    if (mentions > config.maxMentions) {
      violated = true;
      reason = 'Mention spam';
      action = config.mentionsAction;
    }
  }
  
  // Bad words filter
  if (config.badWordsEnabled && !violated) {
    const allBadWords = [...DEFAULT_BAD_WORDS, ...config.customBadWords];
    const lowerContent = content.toLowerCase();
    
    if (allBadWords.some(word => lowerContent.includes(word.toLowerCase()))) {
      violated = true;
      reason = 'Inappropriate language';
      action = config.badWordsAction;
    }
  }
  
  // Invite links
  if (config.invitesEnabled && !violated) {
    const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+/gi;
    
    if (inviteRegex.test(content)) {
      violated = true;
      reason = 'Unauthorized invite link';
      action = config.invitesAction;
    }
  }
  
  // Duplicate messages
  if (config.duplicateEnabled && !violated) {
    const userId = message.author.id;
    const key = `${userId}_last_message`;
    
    if (userMessages.has(key)) {
      const lastMessage = userMessages.get(key);
      if (lastMessage === content) {
        violated = true;
        reason = 'Duplicate message';
        action = config.duplicateAction;
      }
    }
    
    userMessages.set(key, content);
  }
  
  // Take action if violated
  if (violated) {
    await takeAction(message, action, reason, config);
  }
}

// Take moderation action
async function takeAction(message, action, reason, config) {
  const { member, guild, channel } = message;
  
  try {
    // Delete message
    if (['delete', 'warn', 'timeout', 'kick', 'ban'].includes(action)) {
      await message.delete().catch(() => {});
    }
    
    // Add warning
    if (action === 'warn' || action === 'timeout' || action === 'kick' || action === 'ban') {
      const warningCount = addWarning(guild.id, member.id, reason);
      
      // Send DM
      try {
        await member.send({
          embeds: [new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('⚠️ AutoMod Warning')
            .setDescription(
              `You have been warned in **${guild.name}**\n\n` +
              `**Reason:** ${reason}\n` +
              `**Warnings:** ${warningCount}\n\n` +
              `Please follow the server rules.`
            )
            .setTimestamp()
          ]
        });
      } catch (error) {
        // User has DMs disabled
      }
      
      // Check auto-punishments
      const punishments = config.warnings;
      for (const [count, punishment] of Object.entries(punishments)) {
        if (warningCount >= parseInt(count)) {
          action = punishment;
          break;
        }
      }
    }
    
    // Timeout
    if (action === 'timeout') {
      await member.timeout(10 * 60 * 1000, `AutoMod: ${reason}`);
    }
    
    // Kick
    if (action === 'kick') {
      await member.kick(`AutoMod: ${reason}`);
    }
    
    // Ban
    if (action === 'ban') {
      await member.ban({ reason: `AutoMod: ${reason}` });
    }
    
    // Log to channel
    if (config.logChannelId) {
      const logChannel = guild.channels.cache.get(config.logChannelId);
      if (logChannel) {
        await logChannel.send({
          embeds: [new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🛡️ AutoMod Action')
            .addFields(
              { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
              { name: 'Action', value: action.toUpperCase(), inline: true },
              { name: 'Reason', value: reason, inline: true },
              { name: 'Channel', value: channel.toString(), inline: true },
              { name: 'Message', value: message.content.slice(0, 1000) || 'No content', inline: false }
            )
            .setTimestamp()
          ]
        });
      }
    }
    
    console.log(`🛡️ AutoMod: ${action} ${member.user.tag} for ${reason}`);
  } catch (error) {
    console.error('AutoMod action error:', error);
  }
}

// Setup automod
async function setupAutomod(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permission!',
      flags: 64
    });
  }
  
  const config = getConfig(interaction.guild.id);
  
  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🛡️ AutoMod Configuration')
    .setDescription('Current automod settings:')
    .addFields(
      { name: 'Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
      { name: 'Spam Protection', value: config.spamEnabled ? '✅ On' : '❌ Off', inline: true },
      { name: 'Link Filter', value: config.linksEnabled ? '✅ On' : '❌ Off', inline: true },
      { name: 'Caps Filter', value: config.capsEnabled ? '✅ On' : '❌ Off', inline: true },
      { name: 'Mention Spam', value: config.mentionsEnabled ? '✅ On' : '❌ Off', inline: true },
      { name: 'Bad Words', value: config.badWordsEnabled ? '✅ On' : '❌ Off', inline: true },
      { name: 'Invite Filter', value: config.invitesEnabled ? '✅ On' : '❌ Off', inline: true },
      { name: 'Duplicate Filter', value: config.duplicateEnabled ? '✅ On' : '❌ Off', inline: true }
    )
    .setFooter({ text: 'Use /automod config to change settings' });
  
  await interaction.reply({
    embeds: [embed],
    flags: 64
  });
}

module.exports = {
  moderateMessage,
  setupAutomod,
  getConfig,
  saveConfig,
  getWarnings,
  addWarning
};
