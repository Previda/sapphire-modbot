const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

async function handleButtonInteraction(interaction) {
  const { customId, guild, member, user } = interaction;

  // Handle verification button
  if (customId === 'verify_button') {
    const verifiedRole = guild.roles.cache.find(r => r.name === 'Verified') || 
                         await guild.roles.create({ name: 'Verified', color: '#00ff00' });

    if (member.roles.cache.has(verifiedRole.id)) {
      return interaction.reply({
        content: '✅ You are already verified!',
        ephemeral: true
      });
    }

    await member.roles.add(verifiedRole);
    
    return interaction.reply({
      content: '✅ You have been verified! Welcome to the server!',
      ephemeral: true
    });
  }

  // Handle ticket creation
  if (customId.startsWith('create_ticket_')) {
    const categoryId = customId.split('_')[2];
    const category = guild.channels.cache.get(categoryId);

    // Check if user already has a ticket
    const existingTicket = guild.channels.cache.find(
      c => c.name === `ticket-${user.username.toLowerCase()}` && c.type === ChannelType.GuildText
    );

    if (existingTicket) {
      return interaction.reply({
        content: `❌ You already have an open ticket: ${existingTicket}`,
        ephemeral: true
      });
    }

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: guild.roles.cache.find(r => r.permissions.has(PermissionFlagsBits.Administrator))?.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎫 Support Ticket')
      .setDescription(
        `Welcome ${user}!\n\n` +
        'Please describe your issue in detail.\n' +
        'A staff member will be with you shortly.\n\n' +
        '**To close this ticket, use:** `/ticket close`'
      )
      .setFooter({ text: `Ticket created by ${user.tag}` })
      .setTimestamp();

    await ticketChannel.send({
      content: `${user} | Staff will be notified`,
      embeds: [ticketEmbed]
    });

    return interaction.reply({
      content: `✅ Ticket created! ${ticketChannel}`,
      ephemeral: true
    });
  }
}

module.exports = { handleButtonInteraction };
