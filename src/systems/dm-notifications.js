const { EmbedBuilder } = require('discord.js');

// Send DM notification for moderation action
async function sendModerationDM(user, guild, action, reason, moderator, duration = null) {
  try {
    const colors = {
      ban: '#ED4245',
      kick: '#FEE75C',
      mute: '#F26522',
      unmute: '#57F287',
      warn: '#FEE75C',
      timeout: '#F26522'
    };

    const embed = new EmbedBuilder()
      .setColor(colors[action.toLowerCase()] || '#5865F2')
      .setTitle(`${getActionEmoji(action)} You have been ${action}ed in ${guild.name}`)
      .addFields(
        { name: '📝 Reason', value: reason || 'No reason provided', inline: false },
        { name: '👮 Moderator', value: moderator.tag, inline: true }
      )
      .setThumbnail(guild.iconURL())
      .setTimestamp();

    if (duration) {
      embed.addFields({ name: '⏱️ Duration', value: duration, inline: true });
    }

    // Add appeal information for bans
    if (action.toLowerCase() === 'ban') {
      embed.addFields({
        name: '⚖️ Appeal',
        value: 'You can submit an appeal by using `/appeal` in our support server or website.',
        inline: false
      });
    }

    await user.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error(`Failed to send DM to ${user.tag}:`, error.message);
    return false;
  }
}

// Send DM for ticket creation
async function sendTicketCreatedDM(user, guild, ticketChannel, category) {
  try {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎫 Support Ticket Created')
      .setDescription(`Your support ticket has been created in **${guild.name}**`)
      .addFields(
        { name: '📍 Channel', value: `<#${ticketChannel.id}>`, inline: true },
        { name: '📂 Category', value: category, inline: true },
        { name: '💡 Next Steps', value: 'Please describe your issue in the ticket channel. A staff member will assist you shortly.', inline: false }
      )
      .setThumbnail(guild.iconURL())
      .setTimestamp();

    await user.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error(`Failed to send ticket DM to ${user.tag}:`, error.message);
    return false;
  }
}

// Send DM for ticket closure
async function sendTicketClosedDM(user, guild, reason, transcript = null) {
  try {
    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🎫 Support Ticket Closed')
      .setDescription(`Your support ticket in **${guild.name}** has been closed.`)
      .addFields(
        { name: '📝 Reason', value: reason || 'No reason provided', inline: false }
      )
      .setThumbnail(guild.iconURL())
      .setTimestamp();

    if (transcript) {
      embed.addFields({
        name: '📄 Transcript',
        value: 'A transcript of your ticket has been attached.',
        inline: false
      });
    }

    const messageOptions = { embeds: [embed] };
    
    if (transcript) {
      messageOptions.files = [{
        attachment: Buffer.from(transcript, 'utf-8'),
        name: `ticket-transcript-${Date.now()}.txt`
      }];
    }

    await user.send(messageOptions);
    return true;
  } catch (error) {
    console.error(`Failed to send ticket closure DM to ${user.tag}:`, error.message);
    return false;
  }
}

// Send DM for verification
async function sendVerificationDM(user, guild) {
  try {
    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Verification Successful')
      .setDescription(`You have been successfully verified in **${guild.name}**!`)
      .addFields(
        { name: '🎉 Welcome!', value: 'You now have access to all channels. Enjoy your stay!', inline: false }
      )
      .setThumbnail(guild.iconURL())
      .setTimestamp();

    await user.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error(`Failed to send verification DM to ${user.tag}:`, error.message);
    return false;
  }
}

// Send DM for appeal status
async function sendAppealStatusDM(user, guild, status, reason = null) {
  try {
    const colors = {
      accepted: '#57F287',
      denied: '#ED4245',
      pending: '#FEE75C'
    };

    const embed = new EmbedBuilder()
      .setColor(colors[status] || '#5865F2')
      .setTitle(`⚖️ Appeal ${status.charAt(0).toUpperCase() + status.slice(1)}`)
      .setDescription(`Your ban appeal for **${guild.name}** has been ${status}.`)
      .setThumbnail(guild.iconURL())
      .setTimestamp();

    if (reason) {
      embed.addFields({ name: '📝 Reason', value: reason, inline: false });
    }

    if (status === 'accepted') {
      embed.addFields({
        name: '🎉 Next Steps',
        value: 'You can now rejoin the server. Please follow the rules.',
        inline: false
      });
    }

    await user.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error(`Failed to send appeal DM to ${user.tag}:`, error.message);
    return false;
  }
}

// Send welcome DM to new members
async function sendWelcomeDM(member, guild) {
  try {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`👋 Welcome to ${guild.name}!`)
      .setDescription('Thank you for joining our community!')
      .addFields(
        { name: '📜 Rules', value: 'Please read the rules in the rules channel.', inline: false },
        { name: '✅ Verification', value: 'Make sure to verify yourself to access all channels.', inline: false },
        { name: '🎫 Support', value: 'Need help? Create a support ticket!', inline: false }
      )
      .setThumbnail(guild.iconURL())
      .setTimestamp();

    await member.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error(`Failed to send welcome DM to ${member.user.tag}:`, error.message);
    return false;
  }
}

// Helper function to get action emoji
function getActionEmoji(action) {
  const emojis = {
    ban: '🔨',
    kick: '👢',
    mute: '🔇',
    unmute: '🔊',
    warn: '⚠️',
    timeout: '⏱️',
    untimeout: '✅'
  };
  return emojis[action.toLowerCase()] || '📋';
}

module.exports = {
  sendModerationDM,
  sendTicketCreatedDM,
  sendTicketClosedDM,
  sendVerificationDM,
  sendAppealStatusDM,
  sendWelcomeDM
};
