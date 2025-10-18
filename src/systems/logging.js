const { EmbedBuilder, PermissionFlagsBits, ChannelType, AuditLogEvent } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Database for logging configuration
const CONFIG_FILE = path.join(__dirname, '../../data/logging-config.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(CONFIG_FILE))) {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
}

// Load logging config
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading logging config:', error);
  }
  return {};
}

// Save logging config
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving logging config:', error);
  }
}

// Get guild config
function getGuildConfig(guildId) {
  const config = loadConfig();
  return config[guildId] || {
    enabled: false,
    channels: {
      moderation: null,
      messages: null,
      members: null,
      server: null,
      voice: null
    }
  };
}

// Setup logging command
async function setupLogging(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permission!',
      ephemeral: true
    });
  }

  const { guild } = interaction;
  
  await interaction.deferReply({ ephemeral: true });

  try {
    // Create logging category
    let category = guild.channels.cache.find(c => c.name === '📋 Logs' && c.type === ChannelType.GuildCategory);
    if (!category) {
      category = await guild.channels.create({
        name: '📋 Logs',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });
    }

    // Create log channels
    const channels = {};
    
    const channelConfigs = [
      { key: 'moderation', name: 'mod-logs', emoji: '🔨' },
      { key: 'messages', name: 'message-logs', emoji: '💬' },
      { key: 'members', name: 'member-logs', emoji: '👥' },
      { key: 'server', name: 'server-logs', emoji: '⚙️' },
      { key: 'voice', name: 'voice-logs', emoji: '🔊' }
    ];

    for (const config of channelConfigs) {
      let channel = guild.channels.cache.find(c => c.name === config.name && c.parentId === category.id);
      if (!channel) {
        channel = await guild.channels.create({
          name: config.name,
          type: ChannelType.GuildText,
          parent: category.id,
          topic: `${config.emoji} Automated logging for ${config.key}`,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.ViewChannel]
            }
          ]
        });
      }
      channels[config.key] = channel.id;
    }

    // Save configuration
    const allConfig = loadConfig();
    allConfig[guild.id] = {
      enabled: true,
      channels
    };
    saveConfig(allConfig);

    // Send success message
    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Logging System Setup Complete!')
      .setDescription('All logging channels have been created and configured.')
      .addFields(
        { name: '🔨 Moderation Logs', value: `<#${channels.moderation}>`, inline: true },
        { name: '💬 Message Logs', value: `<#${channels.messages}>`, inline: true },
        { name: '👥 Member Logs', value: `<#${channels.members}>`, inline: true },
        { name: '⚙️ Server Logs', value: `<#${channels.server}>`, inline: true },
        { name: '🔊 Voice Logs', value: `<#${channels.voice}>`, inline: true },
        { name: '\u200b', value: '\u200b', inline: true }
      )
      .setFooter({ text: 'Logging is now active' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // Send initial message to each log channel
    for (const [type, channelId] of Object.entries(channels)) {
      const channel = guild.channels.cache.get(channelId);
      if (channel) {
        await channel.send({
          embeds: [new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`📋 ${type.charAt(0).toUpperCase() + type.slice(1)} Logging Active`)
            .setDescription(`This channel will log all ${type} events.`)
            .setTimestamp()
          ]
        });
      }
    }

  } catch (error) {
    console.error('Error setting up logging:', error);
    await interaction.editReply({
      content: '❌ An error occurred while setting up logging. Please try again.'
    });
  }
}

// Log moderation action
async function logModeration(guild, action, moderator, target, reason, duration = null) {
  const config = getGuildConfig(guild.id);
  if (!config.enabled || !config.channels.moderation) return;

  const channel = guild.channels.cache.get(config.channels.moderation);
  if (!channel) return;

  const colors = {
    ban: '#ED4245',
    kick: '#FEE75C',
    mute: '#F26522',
    unmute: '#57F287',
    warn: '#FEE75C',
    timeout: '#F26522',
    untimeout: '#57F287'
  };

  const embed = new EmbedBuilder()
    .setColor(colors[action.toLowerCase()] || '#5865F2')
    .setTitle(`🔨 ${action.toUpperCase()}`)
    .addFields(
      { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
      { name: '👮 Moderator', value: `${moderator.tag}`, inline: true },
      { name: '📝 Reason', value: reason || 'No reason provided', inline: false }
    )
    .setThumbnail(target.displayAvatarURL())
    .setTimestamp();

  if (duration) {
    embed.addFields({ name: '⏱️ Duration', value: duration, inline: true });
  }

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging moderation action:', error);
  }
}

// Log message deletion
async function logMessageDelete(message) {
  if (!message.guild || message.author.bot) return;
  
  const config = getGuildConfig(message.guild.id);
  if (!config.enabled || !config.channels.messages) return;

  const channel = message.guild.channels.cache.get(config.channels.messages);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#ED4245')
    .setTitle('🗑️ Message Deleted')
    .addFields(
      { name: '👤 Author', value: `${message.author.tag}`, inline: true },
      { name: '📍 Channel', value: `<#${message.channel.id}>`, inline: true },
      { name: '💬 Content', value: message.content || '*No text content*', inline: false }
    )
    .setTimestamp();

  if (message.attachments.size > 0) {
    embed.addFields({
      name: '📎 Attachments',
      value: message.attachments.map(a => a.name).join(', ')
    });
  }

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging message deletion:', error);
  }
}

// Log message edit
async function logMessageEdit(oldMessage, newMessage) {
  if (!newMessage.guild || newMessage.author.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const config = getGuildConfig(newMessage.guild.id);
  if (!config.enabled || !config.channels.messages) return;

  const channel = newMessage.guild.channels.cache.get(config.channels.messages);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#FEE75C')
    .setTitle('✏️ Message Edited')
    .addFields(
      { name: '👤 Author', value: `${newMessage.author.tag}`, inline: true },
      { name: '📍 Channel', value: `<#${newMessage.channel.id}>`, inline: true },
      { name: '📝 Before', value: oldMessage.content || '*No text content*', inline: false },
      { name: '📝 After', value: newMessage.content || '*No text content*', inline: false },
      { name: '🔗 Jump', value: `[Go to message](${newMessage.url})`, inline: false }
    )
    .setTimestamp();

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging message edit:', error);
  }
}

// Log member join
async function logMemberJoin(member) {
  const config = getGuildConfig(member.guild.id);
  if (!config.enabled || !config.channels.members) return;

  const channel = member.guild.channels.cache.get(config.channels.members);
  if (!channel) return;

  const accountAge = Date.now() - member.user.createdTimestamp;
  const days = Math.floor(accountAge / (1000 * 60 * 60 * 24));

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('📥 Member Joined')
    .setDescription(`${member.user.tag} joined the server`)
    .addFields(
      { name: '👤 User', value: `${member.user.tag}`, inline: true },
      { name: '🆔 ID', value: member.id, inline: true },
      { name: '📅 Account Age', value: `${days} days`, inline: true },
      { name: '👥 Member Count', value: `${member.guild.memberCount}`, inline: true }
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  if (days < 7) {
    embed.setColor('#FEE75C');
    embed.addFields({ name: '⚠️ Warning', value: 'New account (less than 7 days old)' });
  }

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging member join:', error);
  }
}

// Log member leave
async function logMemberLeave(member) {
  const config = getGuildConfig(member.guild.id);
  if (!config.enabled || !config.channels.members) return;

  const channel = member.guild.channels.cache.get(config.channels.members);
  if (!channel) return;

  const roles = member.roles.cache
    .filter(r => r.id !== member.guild.id)
    .map(r => r.name)
    .join(', ') || 'None';

  const embed = new EmbedBuilder()
    .setColor('#ED4245')
    .setTitle('📤 Member Left')
    .setDescription(`${member.user.tag} left the server`)
    .addFields(
      { name: '👤 User', value: `${member.user.tag}`, inline: true },
      { name: '🆔 ID', value: member.id, inline: true },
      { name: '👥 Member Count', value: `${member.guild.memberCount}`, inline: true },
      { name: '🎭 Roles', value: roles, inline: false }
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging member leave:', error);
  }
}

// Log voice state change
async function logVoiceStateUpdate(oldState, newState) {
  const config = getGuildConfig(newState.guild.id);
  if (!config.enabled || !config.channels.voice) return;

  const channel = newState.guild.channels.cache.get(config.channels.voice);
  if (!channel) return;

  let action, color;
  if (!oldState.channelId && newState.channelId) {
    action = `📞 Joined <#${newState.channelId}>`;
    color = '#57F287';
  } else if (oldState.channelId && !newState.channelId) {
    action = `📴 Left <#${oldState.channelId}>`;
    color = '#ED4245';
  } else if (oldState.channelId !== newState.channelId) {
    action = `🔄 Moved from <#${oldState.channelId}> to <#${newState.channelId}>`;
    color = '#5865F2';
  } else {
    return; // Mute/deafen changes, skip
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setDescription(`${newState.member.user.tag} ${action}`)
    .setTimestamp();

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging voice state:', error);
  }
}

module.exports = {
  setupLogging,
  logModeration,
  logMessageDelete,
  logMessageEdit,
  logMemberJoin,
  logMemberLeave,
  logVoiceStateUpdate,
  getGuildConfig
};
