const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Database files
const TICKETS_DB = path.join(__dirname, '../../data/tickets.json');
const CONFIG_DB = path.join(__dirname, '../../data/ticket-config.json');
const TRANSCRIPTS_DIR = path.join(__dirname, '../../data/transcripts');

// Ensure directories exist
[path.dirname(TICKETS_DB), path.dirname(CONFIG_DB), TRANSCRIPTS_DIR].forEach(dir => {
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
  categoryId: null,
  setupChannelId: null,
  logChannelId: null,
  supportRoleId: null,
  maxTicketsPerUser: 3,
  dmOnClose: true,
  dmTranscript: true,
  allowPause: true,
  categories: ['General Support', 'Technical Issue', 'Bug Report', 'Feature Request', 'Other']
};

// Get guild config
function getConfig(guildId) {
  const configs = loadDB(CONFIG_DB, {});
  return configs[guildId] || DEFAULT_CONFIG;
}

// Save guild config
function saveConfig(guildId, config) {
  const configs = loadDB(CONFIG_DB, {});
  configs[guildId] = { ...DEFAULT_CONFIG, ...config };
  saveDB(CONFIG_DB, configs);
}

// Setup ticket system
async function setupTicketSystem(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permission!',
      flags: 64
    });
  }

  const { guild, channel } = interaction;
  const config = getConfig(guild.id);

  // Create or find category
  let category = guild.channels.cache.get(config.categoryId);
  if (!category || category.type !== ChannelType.GuildCategory) {
    category = await guild.channels.create({
      name: '🎫 Tickets',
      type: ChannelType.GuildCategory
    });
    config.categoryId = category.id;
  }

  // Create log channel if doesn't exist
  if (!config.logChannelId) {
    const logChannel = await guild.channels.create({
      name: 'ticket-logs',
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        }
      ]
    });
    config.logChannelId = logChannel.id;
  }

  config.setupChannelId = channel.id;
  saveConfig(guild.id, config);

  // Create ticket panel
  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🎫 Support Ticket System')
    .setDescription(
      '**Need help? Create a support ticket!**\n\n' +
      '📝 **How it works:**\n' +
      '1. Click "Create Ticket" below\n' +
      '2. Select your issue category\n' +
      '3. A private channel will be created\n' +
      '4. Explain your issue to our staff\n' +
      '5. Staff will help you resolve it\n\n' +
      '⚙️ **Features:**\n' +
      '• Private channels\n' +
      '• Staff can claim tickets\n' +
      '• Pause/Resume support\n' +
      '• Full transcripts\n' +
      '• DM notifications\n\n' +
      '⚠️ **Rules:**\n' +
      '• Be respectful to staff\n' +
      '• Provide clear information\n' +
      '• Don\'t spam tickets\n' +
      '• Max 3 open tickets per user'
    )
    .setFooter({ text: 'Click the button below to create a ticket' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_create')
        .setLabel('📝 Create Ticket')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('ticket_config')
        .setLabel('⚙️ Configure')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({
    content: '✅ Ticket system setup complete!',
    flags: 64
  });

  await channel.send({
    embeds: [embed],
    components: [row]
  });
}

// Create ticket
async function createTicket(interaction) {
  const { guild, user, member } = interaction;
  const config = getConfig(guild.id);

  if (!config.enabled) {
    return interaction.reply({
      content: '❌ Ticket system is currently disabled!',
      flags: 64
    });
  }

  // Check existing tickets
  const tickets = loadDB(TICKETS_DB, {});
  const guildTickets = tickets[guild.id] || {};
  
  const userTickets = Object.values(guildTickets).filter(
    t => t.userId === user.id && t.status === 'open'
  );

  if (userTickets.length >= config.maxTicketsPerUser) {
    return interaction.reply({
      content: `❌ You already have ${userTickets.length} open tickets! (Max: ${config.maxTicketsPerUser})`,
      flags: 64
    });
  }

  // Show category selection
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('ticket_category')
    .setPlaceholder('Select your issue category')
    .addOptions(
      config.categories.map((cat, index) => ({
        label: cat,
        value: cat.toLowerCase().replace(/\s+/g, '-'),
        description: `Create a ticket for ${cat}`,
        emoji: ['🔧', '🐛', '💡', '📝', '❓'][index] || '📝'
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: '**Select your issue category:**',
    components: [row],
    flags: 64
  });
}

// Handle category selection and create channel
async function handleCategorySelection(interaction, category) {
  const { guild, user, member } = interaction;
  const config = getConfig(guild.id);

  await interaction.deferUpdate();

  try {
    const tickets = loadDB(TICKETS_DB, {});
    if (!tickets[guild.id]) tickets[guild.id] = {};

    const ticketNumber = Object.keys(tickets[guild.id]).length + 1;
    const ticketId = `ticket-${Date.now()}`;

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${ticketNumber}`,
      type: ChannelType.GuildText,
      parent: config.categoryId,
      topic: `Ticket #${ticketNumber} | User: ${user.tag} | Category: ${category}`,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles
          ]
        },
        ...(config.supportRoleId ? [{
          id: config.supportRoleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }] : [])
      ]
    });

    // Save ticket
    tickets[guild.id][ticketId] = {
      ticketNumber,
      channelId: ticketChannel.id,
      userId: user.id,
      username: user.tag,
      category,
      createdAt: new Date().toISOString(),
      status: 'open',
      priority: 'normal',
      claimedBy: null,
      pausedAt: null,
      messages: []
    };
    saveDB(TICKETS_DB, tickets);

    // Create ticket embed
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🎫 Ticket #${ticketNumber}`)
      .setDescription(
        `**Welcome ${user}!**\n\n` +
        `Thank you for creating a ticket.\n` +
        `Please describe your issue in detail below.\n\n` +
        `**Ticket Information:**\n` +
        `• Category: ${category}\n` +
        `• Status: 🟢 Open\n` +
        `• Priority: 🔵 Normal\n` +
        `• Created: <t:${Math.floor(Date.now() / 1000)}:R>\n\n` +
        `A staff member will be with you shortly.`
      )
      .setFooter({ text: `Ticket ID: ${ticketId}` })
      .setTimestamp();

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_claim_${ticketId}`)
          .setLabel('👋 Claim')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`ticket_pause_${ticketId}`)
          .setLabel('⏸️ Pause')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`ticket_close_${ticketId}`)
          .setLabel('🔒 Close')
          .setStyle(ButtonStyle.Danger)
      );

    await ticketChannel.send({
      content: `${user}${config.supportRoleId ? ` <@&${config.supportRoleId}>` : ''}`,
      embeds: [embed],
      components: [buttons]
    });

    // Update original message
    await interaction.editReply({
      content: `✅ Ticket created! Go to ${ticketChannel}`,
      components: []
    });

    // Log
    if (config.logChannelId) {
      const logChannel = guild.channels.cache.get(config.logChannelId);
      if (logChannel) {
        await logChannel.send({
          embeds: [new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('🎫 Ticket Created')
            .addFields(
              { name: 'Ticket', value: `#${ticketNumber}`, inline: true },
              { name: 'User', value: `${user.tag}`, inline: true },
              { name: 'Category', value: category, inline: true }
            )
            .setTimestamp()
          ]
        });
      }
    }

    console.log(`✅ Created ticket #${ticketNumber} for ${user.tag}`);
  } catch (error) {
    console.error('Error creating ticket:', error);
    await interaction.editReply({
      content: '❌ An error occurred while creating your ticket.',
      components: []
    });
  }
}

// Claim ticket
async function claimTicket(interaction, ticketId) {
  const { guild, user } = interaction;
  const tickets = loadDB(TICKETS_DB, {});
  const ticket = tickets[guild.id]?.[ticketId];

  if (!ticket) {
    return interaction.reply({ content: '❌ Ticket not found!', flags: 64 });
  }

  if (ticket.claimedBy) {
    return interaction.reply({
      content: `❌ This ticket is already claimed by <@${ticket.claimedBy}>!`,
      flags: 64
    });
  }

  ticket.claimedBy = user.id;
  ticket.claimedAt = new Date().toISOString();
  saveDB(TICKETS_DB, tickets);

  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Ticket Claimed')
      .setDescription(`${user} has claimed this ticket and will assist you.`)
      .setTimestamp()
    ]
  });
}

// Pause ticket
async function pauseTicket(interaction, ticketId) {
  const { guild } = interaction;
  const tickets = loadDB(TICKETS_DB, {});
  const ticket = tickets[guild.id]?.[ticketId];

  if (!ticket) {
    return interaction.reply({ content: '❌ Ticket not found!', flags: 64 });
  }

  if (ticket.status === 'paused') {
    // Resume
    ticket.status = 'open';
    ticket.pausedAt = null;
    saveDB(TICKETS_DB, tickets);

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('▶️ Ticket Resumed')
        .setDescription('This ticket has been resumed.')
        .setTimestamp()
      ]
    });
  } else {
    // Pause
    ticket.status = 'paused';
    ticket.pausedAt = new Date().toISOString();
    saveDB(TICKETS_DB, tickets);

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor('#FEE75C')
        .setTitle('⏸️ Ticket Paused')
        .setDescription('This ticket has been paused. Click again to resume.')
        .setTimestamp()
      ]
    });
  }
}

// Close ticket
async function closeTicket(interaction, ticketId) {
  const { guild, user, channel } = interaction;
  const config = getConfig(guild.id);
  const tickets = loadDB(TICKETS_DB, {});
  const ticket = tickets[guild.id]?.[ticketId];

  if (!ticket) {
    return interaction.reply({ content: '❌ Ticket not found!', flags: 64 });
  }

  await interaction.deferReply();

  try {
    // Fetch messages for transcript
    const messages = await channel.messages.fetch({ limit: 100 });
    const transcript = [];

    messages.reverse().forEach(msg => {
      transcript.push({
        author: msg.author.tag,
        authorId: msg.author.id,
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
        attachments: msg.attachments.map(a => a.url),
        embeds: msg.embeds.length
      });
    });

    // Save transcript
    const transcriptFile = path.join(TRANSCRIPTS_DIR, `${ticketId}.json`);
    const transcriptData = {
      ticketId,
      ticketNumber: ticket.ticketNumber,
      user: ticket.username,
      userId: ticket.userId,
      category: ticket.category,
      createdAt: ticket.createdAt,
      closedAt: new Date().toISOString(),
      closedBy: user.tag,
      claimedBy: ticket.claimedBy,
      messages: transcript
    };
    fs.writeFileSync(transcriptFile, JSON.stringify(transcriptData, null, 2));

    // Update ticket
    ticket.status = 'closed';
    ticket.closedAt = new Date().toISOString();
    ticket.closedBy = user.id;
    ticket.transcriptFile = transcriptFile;
    saveDB(TICKETS_DB, tickets);

    // DM user if enabled
    if (config.dmOnClose) {
      try {
        const ticketUser = await guild.members.fetch(ticket.userId);
        const dmEmbed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle(`🎫 Ticket #${ticket.ticketNumber} Closed`)
          .setDescription(
            `Your ticket in **${guild.name}** has been closed.\n\n` +
            `**Category:** ${ticket.category}\n` +
            `**Closed by:** ${user.tag}\n` +
            `**Duration:** <t:${Math.floor(new Date(ticket.createdAt).getTime() / 1000)}:R> - <t:${Math.floor(Date.now() / 1000)}:R>`
          )
          .setTimestamp();

        if (config.dmTranscript && transcript.length > 0) {
          const transcriptText = transcript.map(m => 
            `[${new Date(m.timestamp).toLocaleString()}] ${m.author}: ${m.content}`
          ).join('\n');
          
          dmEmbed.addFields({
            name: '📝 Transcript',
            value: `\`\`\`${transcriptText.slice(0, 1000)}${transcriptText.length > 1000 ? '...' : ''}\`\`\``
          });
        }

        await ticketUser.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log('Could not DM user:', error.message);
      }
    }

    // Send closing message
    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('🔒 Ticket Closed')
        .setDescription(
          `This ticket has been closed by ${user}.\n\n` +
          `**Transcript saved:** \`${ticketId}.json\`\n` +
          `${config.dmOnClose ? '**User notified via DM**\n' : ''}` +
          `Channel will be deleted in 5 seconds...`
        )
        .setTimestamp()
      ]
    });

    // Log
    if (config.logChannelId) {
      const logChannel = guild.channels.cache.get(config.logChannelId);
      if (logChannel) {
        await logChannel.send({
          embeds: [new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🔒 Ticket Closed')
            .addFields(
              { name: 'Ticket', value: `#${ticket.ticketNumber}`, inline: true },
              { name: 'User', value: `${ticket.username}`, inline: true },
              { name: 'Closed By', value: `${user.tag}`, inline: true },
              { name: 'Category', value: ticket.category, inline: true },
              { name: 'Messages', value: `${transcript.length}`, inline: true }
            )
            .setTimestamp()
          ]
        });
      }
    }

    // Delete channel after 5 seconds
    setTimeout(async () => {
      try {
        await channel.delete();
        console.log(`✅ Closed and deleted ticket #${ticket.ticketNumber}`);
      } catch (error) {
        console.error('Error deleting ticket channel:', error);
      }
    }, 5000);

  } catch (error) {
    console.error('Error closing ticket:', error);
    await interaction.editReply({
      content: '❌ An error occurred while closing the ticket.'
    });
  }
}

module.exports = {
  setupTicketSystem,
  createTicket,
  handleCategorySelection,
  claimTicket,
  pauseTicket,
  closeTicket,
  getConfig,
  saveConfig
};
