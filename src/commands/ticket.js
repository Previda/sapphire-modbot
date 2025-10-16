const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: {
    name: 'ticket',
    description: 'Ticket system commands',
    options: [
      {
        name: 'setup',
        type: 1,
        description: 'Setup ticket system',
        options: [
          {
            name: 'category',
            type: 7,
            description: 'Category for tickets',
            required: true
          }
        ]
      },
      {
        name: 'close',
        type: 1,
        description: 'Close current ticket'
      },
      {
        name: 'add',
        type: 1,
        description: 'Add user to ticket',
        options: [
          {
            name: 'user',
            type: 6,
            description: 'User to add',
            required: true
          }
        ]
      },
      {
        name: 'remove',
        type: 1,
        description: 'Remove user from ticket',
        options: [
          {
            name: 'user',
            type: 6,
            description: 'User to remove',
            required: true
          }
        ]
      }
    ]
  },
  category: 'admin',
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ You need Administrator permission!', ephemeral: true });
      }

      const category = interaction.options.getChannel('category');

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎫 Support Tickets')
        .setDescription(
          '**Need help? Create a ticket!**\n\n' +
          'Click the button below to open a support ticket.\n' +
          'Our staff will assist you as soon as possible.\n\n' +
          '📝 **What to include:**\n' +
          '• Detailed description of your issue\n' +
          '• Screenshots if applicable\n' +
          '• Any relevant information'
        )
        .setFooter({ text: 'Click the button below to create a ticket' })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`create_ticket_${category.id}`)
            .setLabel('📩 Create Ticket')
            .setStyle(ButtonStyle.Primary)
        );

      await interaction.reply({ content: '✅ Ticket system setup!', ephemeral: true });
      await interaction.channel.send({ embeds: [embed], components: [row] });

    } else if (subcommand === 'close') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: '❌ This is not a ticket channel!', ephemeral: true });
      }

      // Create transcript
      const transcript = await createTranscript(interaction.channel);
      
      const closeEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Ticket Closed')
        .setDescription(`Ticket closed by ${interaction.user.tag}`)
        .addFields(
          { name: 'Ticket', value: interaction.channel.name, inline: true },
          { name: 'Closed at', value: new Date().toLocaleString(), inline: true }
        )
        .setTimestamp();

      // Try to send transcript to user
      const ticketOwner = interaction.guild.members.cache.find(m => 
        interaction.channel.name.includes(m.user.username.toLowerCase())
      );

      if (ticketOwner) {
        try {
          await ticketOwner.send({
            content: '📋 Your ticket has been closed. Here is the transcript:',
            embeds: [closeEmbed],
            files: [{ attachment: Buffer.from(transcript), name: `transcript-${interaction.channel.name}.txt` }]
          });
        } catch (error) {
          console.log('Could not DM user transcript');
        }
      }

      await interaction.reply({ embeds: [closeEmbed] });
      
      setTimeout(() => {
        interaction.channel.delete();
      }, 5000);

    } else if (subcommand === 'add') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: '❌ This is not a ticket channel!', ephemeral: true });
      }

      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.create(user, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      await interaction.reply({ content: `✅ Added ${user} to the ticket!` });

    } else if (subcommand === 'remove') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: '❌ This is not a ticket channel!', ephemeral: true });
      }

      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.delete(user);

      await interaction.reply({ content: `✅ Removed ${user} from the ticket!` });
    }
  }
};

async function createTranscript(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  let transcript = `Ticket Transcript: ${channel.name}\n`;
  transcript += `Created: ${channel.createdAt.toLocaleString()}\n`;
  transcript += `Closed: ${new Date().toLocaleString()}\n`;
  transcript += `\n${'='.repeat(50)}\n\n`;

  messages.reverse().forEach(msg => {
    transcript += `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}:\n`;
    transcript += `${msg.content}\n`;
    if (msg.attachments.size > 0) {
      msg.attachments.forEach(att => {
        transcript += `[Attachment: ${att.url}]\n`;
      });
    }
    transcript += `\n`;
  });

  return transcript;
}
