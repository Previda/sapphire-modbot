const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Database files
const TICKETS_DB = path.join(__dirname, '../../data/tickets.json');
const TRANSCRIPTS_DIR = path.join(__dirname, '../../data/transcripts');

// Ensure directories exist
[path.dirname(TICKETS_DB), TRANSCRIPTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Load tickets database
function loadTickets() {
  try {
    if (fs.existsSync(TICKETS_DB)) {
      return JSON.parse(fs.readFileSync(TICKETS_DB, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading tickets:', error);
  }
  return {};
}

// Save tickets database
function saveTickets(data) {
  try {
    fs.writeFileSync(TICKETS_DB, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving tickets:', error);
  }
}

// Setup ticket system
async function setupTicketSystem(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permission to setup tickets!',
      flags: 64
    });
  }

  const ticketEmbed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🎫 Support Tickets')
    .setDescription(
      '**Need help? Create a support ticket!**\n\n' +
      '📝 **How it works:**\n' +
      '1. Click the button below\n' +
      '2. A private channel will be created for you\n' +
      '3. Explain your issue to our staff\n' +
      '4. Staff will help you resolve it\n\n' +
      '⚠️ **Rules:**\n' +
      '• Be respectful to staff\n' +
      '• Provide clear information\n' +
      '• Don\'t spam tickets\n' +
      '• Wait for staff response'
    )
    .setFooter({ text: 'Click the button below to create a ticket' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('📝 Create Ticket')
        .setStyle(ButtonStyle.Primary)
    );

  await interaction.reply({
    content: '✅ Ticket system setup complete!',
    flags: 64
  });

  await interaction.channel.send({
    embeds: [ticketEmbed],
    components: [row]
  });
}

// Create a new ticket
async function createTicket(interaction) {
  const { guild, user, member } = interaction;

  // Check if user already has an open ticket
  const tickets = loadTickets();
  const guildTickets = tickets[guild.id] || {};
  
  const existingTicket = Object.values(guildTickets).find(
    ticket => ticket.userId === user.id && ticket.status === 'open'
  );

  if (existingTicket) {
    return interaction.reply({
      content: `❌ You already have an open ticket: <#${existingTicket.channelId}>`,
      flags: 64
    });
  }

  await interaction.deferReply({ flags: 64 });

  try {
    // Find or create Tickets category
    let category = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name === 'Tickets'
    );

    if (!category) {
      category = await guild.channels.create({
        name: 'Tickets',
        type: ChannelType.GuildCategory
      });
    }

    // Generate ticket number
    const ticketNumber = Object.keys(guildTickets).length + 1;
    const ticketId = `ticket-${Date.now()}`;

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${ticketNumber}`,
      type: ChannelType.GuildText,
      parent: category.id,
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
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel]
        }
      ]
    });

    // Save ticket to database
    if (!tickets[guild.id]) tickets[guild.id] = {};
    tickets[guild.id][ticketId] = {
      ticketNumber,
      channelId: ticketChannel.id,
      userId: user.id,
      username: user.tag,
      createdAt: new Date().toISOString(),
      status: 'open',
      messages: []
    };
    saveTickets(tickets);

    // Send welcome message in ticket
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🎫 Ticket #${ticketNumber}`)
      .setDescription(
        `**Welcome ${user}!**\n\n` +
        `Thank you for creating a ticket. Please describe your issue below.\n` +
        `A staff member will be with you shortly.\n\n` +
        `**Ticket Information:**\n` +
        `• Ticket ID: \`${ticketId}\`\n` +
        `• Created: <t:${Math.floor(Date.now() / 1000)}:R>\n` +
        `• Status: 🟢 Open`
      )
      .setFooter({ text: 'Use the button below to close this ticket' })
      .setTimestamp();

    const closeRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`close_ticket_${ticketId}`)
          .setLabel('🔒 Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );

    await ticketChannel.send({
      content: `${user}`,
      embeds: [welcomeEmbed],
      components: [closeRow]
    });

    await interaction.editReply({
      content: `✅ Ticket created! Go to ${ticketChannel}`
    });

    console.log(`✅ Created ticket #${ticketNumber} for ${user.tag}`);
  } catch (error) {
    console.error('Error creating ticket:', error);
    await interaction.editReply({
      content: '❌ An error occurred while creating your ticket. Please contact an administrator.'
    });
  }
}

// Close a ticket
async function closeTicket(interaction, ticketId) {
  const { guild, user, channel } = interaction;

  await interaction.deferReply();

  try {
    const tickets = loadTickets();
    const ticket = tickets[guild.id]?.[ticketId];

    if (!ticket) {
      return interaction.editReply({
        content: '❌ Ticket not found!'
      });
    }

    // Generate transcript
    const messages = await channel.messages.fetch({ limit: 100 });
    const transcript = [];

    messages.reverse().forEach(msg => {
      transcript.push({
        author: msg.author.tag,
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
        attachments: msg.attachments.map(a => a.url)
      });
    });

    // Save transcript
    const transcriptFile = path.join(TRANSCRIPTS_DIR, `${ticketId}.json`);
    fs.writeFileSync(transcriptFile, JSON.stringify({
      ticketId,
      ticketNumber: ticket.ticketNumber,
      user: ticket.username,
      createdAt: ticket.createdAt,
      closedAt: new Date().toISOString(),
      closedBy: user.tag,
      messages: transcript
    }, null, 2));

    // Update ticket status
    ticket.status = 'closed';
    ticket.closedAt = new Date().toISOString();
    ticket.closedBy = user.tag;
    ticket.transcriptFile = transcriptFile;
    saveTickets(tickets);

    // Send closing message
    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Ticket Closed')
        .setDescription(
          `This ticket has been closed by ${user}.\n\n` +
          `**Transcript saved:** \`${ticketId}.json\`\n` +
          `Channel will be deleted in 5 seconds...`
        )
        .setTimestamp()
      ]
    });

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

// Get ticket stats
function getTicketStats(guildId) {
  const tickets = loadTickets();
  const guildTickets = tickets[guildId] || {};
  
  const open = Object.values(guildTickets).filter(t => t.status === 'open').length;
  const closed = Object.values(guildTickets).filter(t => t.status === 'closed').length;
  
  return {
    total: Object.keys(guildTickets).length,
    open,
    closed,
    tickets: guildTickets
  };
}

// Get transcript
function getTranscript(ticketId) {
  try {
    const transcriptFile = path.join(TRANSCRIPTS_DIR, `${ticketId}.json`);
    if (fs.existsSync(transcriptFile)) {
      return JSON.parse(fs.readFileSync(transcriptFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading transcript:', error);
  }
  return null;
}

module.exports = {
  setupTicketSystem,
  createTicket,
  closeTicket,
  getTicketStats,
  getTranscript
};
