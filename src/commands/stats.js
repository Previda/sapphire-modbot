const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View bot and server statistics'),

  async execute(interaction) {
    const { guild, client } = interaction;
    
    await interaction.deferReply();

    try {
      // Calculate bot uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const uptimeString = `${days}d ${hours}h ${minutes}m`;

      // Get member stats
      const totalMembers = guild.memberCount;
      const members = await guild.members.fetch();
      const humans = members.filter(m => !m.user.bot).size;
      const bots = members.filter(m => m.user.bot).size;
      const onlineMembers = members.filter(m => m.presence?.status !== 'offline').size;

      // Get channel stats
      const channels = guild.channels.cache;
      const textChannels = channels.filter(c => c.type === 0).size;
      const voiceChannels = channels.filter(c => c.type === 2).size;
      const categories = channels.filter(c => c.type === 4).size;

      // Get role stats
      const roles = guild.roles.cache.size;

      // Get emoji stats
      const emojis = guild.emojis.cache.size;

      // Get boost stats
      const boostLevel = guild.premiumTier;
      const boostCount = guild.premiumSubscriptionCount || 0;

      // Load logging config to check what's enabled
      const loggingConfig = loadLoggingConfig(guild.id);
      const ticketConfig = loadTicketConfig(guild.id);
      const automodConfig = loadAutomodConfig(guild.id);

      // Create main embed
      const mainEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 ${guild.name} Statistics`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
          {
            name: '👥 Members',
            value: [
              `**Total:** ${totalMembers.toLocaleString()}`,
              `**Humans:** ${humans.toLocaleString()}`,
              `**Bots:** ${bots.toLocaleString()}`,
              `**Online:** ${onlineMembers.toLocaleString()}`
            ].join('\n'),
            inline: true
          },
          {
            name: '📺 Channels',
            value: [
              `**Text:** ${textChannels}`,
              `**Voice:** ${voiceChannels}`,
              `**Categories:** ${categories}`,
              `**Total:** ${channels.size}`
            ].join('\n'),
            inline: true
          },
          {
            name: '🎭 Server Info',
            value: [
              `**Roles:** ${roles}`,
              `**Emojis:** ${emojis}`,
              `**Boost Level:** ${boostLevel}`,
              `**Boosts:** ${boostCount}`
            ].join('\n'),
            inline: true
          }
        )
        .setFooter({ text: `Server ID: ${guild.id}` })
        .setTimestamp();

      // Create bot stats embed
      const botEmbed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('🤖 Bot Statistics')
        .addFields(
          {
            name: '⚡ Performance',
            value: [
              `**Uptime:** ${uptimeString}`,
              `**Ping:** ${client.ws.ping}ms`,
              `**Memory:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
              `**Servers:** ${client.guilds.cache.size}`
            ].join('\n'),
            inline: true
          },
          {
            name: '📊 Features',
            value: [
              `**Logging:** ${loggingConfig.enabled ? '✅ Enabled' : '❌ Disabled'}`,
              `**Tickets:** ${ticketConfig.enabled ? '✅ Enabled' : '❌ Disabled'}`,
              `**AutoMod:** ${automodConfig.enabled ? '✅ Enabled' : '❌ Disabled'}`,
              `**Commands:** 60+`
            ].join('\n'),
            inline: true
          },
          {
            name: '🎯 Activity',
            value: [
              `**Total Users:** ${client.users.cache.size.toLocaleString()}`,
              `**Total Channels:** ${client.channels.cache.size.toLocaleString()}`,
              `**Cached Messages:** ${client.channels.cache.reduce((acc, c) => acc + (c.messages?.cache.size || 0), 0)}`,
              `**Node.js:** ${process.version}`
            ].join('\n'),
            inline: true
          }
        )
        .setTimestamp();

      // Create system status embed
      const systemEmbed = new EmbedBuilder()
        .setColor('#FEE75C')
        .setTitle('⚙️ System Status')
        .addFields(
          {
            name: '📋 Logging Channels',
            value: loggingConfig.enabled ? [
              loggingConfig.channels.moderation ? '✅ Moderation' : '❌ Moderation',
              loggingConfig.channels.messages ? '✅ Messages' : '❌ Messages',
              loggingConfig.channels.members ? '✅ Members' : '❌ Members',
              loggingConfig.channels.server ? '✅ Server' : '❌ Server',
              loggingConfig.channels.voice ? '✅ Voice' : '❌ Voice'
            ].join('\n') : '❌ Not configured',
            inline: true
          },
          {
            name: '🎫 Ticket System',
            value: ticketConfig.enabled ? [
              `✅ Category: ${ticketConfig.categoryId ? 'Set' : 'Not set'}`,
              `✅ Log Channel: ${ticketConfig.logChannelId ? 'Set' : 'Not set'}`,
              `✅ Max per user: ${ticketConfig.maxTicketsPerUser || 3}`,
              `✅ DM on close: ${ticketConfig.dmOnClose ? 'Yes' : 'No'}`
            ].join('\n') : '❌ Not configured',
            inline: true
          },
          {
            name: '🤖 AutoMod',
            value: automodConfig.enabled ? [
              `${automodConfig.spamEnabled ? '✅' : '❌'} Spam Protection`,
              `${automodConfig.linksEnabled ? '✅' : '❌'} Link Filter`,
              `${automodConfig.badwordsEnabled ? '✅' : '❌'} Bad Words`,
              `${automodConfig.capsEnabled ? '✅' : '❌'} Caps Lock`
            ].join('\n') : '❌ Not configured',
            inline: true
          }
        );

      await interaction.editReply({
        embeds: [mainEmbed, botEmbed, systemEmbed]
      });

    } catch (error) {
      console.error('Error in stats command:', error);
      await interaction.editReply({
        content: '❌ An error occurred while fetching statistics.',
        ephemeral: true
      });
    }
  }
};

// Helper functions to load configs
function loadLoggingConfig(guildId) {
  try {
    const file = path.join(__dirname, '../../data/logging-config.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      return data[guildId] || { enabled: false, channels: {} };
    }
  } catch (error) {
    console.error('Error loading logging config:', error);
  }
  return { enabled: false, channels: {} };
}

function loadTicketConfig(guildId) {
  try {
    const file = path.join(__dirname, '../../data/ticket-config.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      return data[guildId] || { enabled: false };
    }
  } catch (error) {
    console.error('Error loading ticket config:', error);
  }
  return { enabled: false };
}

function loadAutomodConfig(guildId) {
  try {
    const file = path.join(__dirname, '../../data/automod-config.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      return data[guildId] || { enabled: false };
    }
  } catch (error) {
    console.error('Error loading automod config:', error);
  }
  return { enabled: false };
}
