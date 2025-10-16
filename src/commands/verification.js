const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: {
    name: 'verify',
    description: 'Setup verification system for the server',
  },
  category: 'admin',
  async execute(interaction) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: '❌ You need Administrator permission to use this command!',
        ephemeral: true
      });
    }

    // Create verification embed
    const verifyEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🔐 Server Verification')
      .setDescription(
        '**Welcome to the server!**\n\n' +
        'To gain access to all channels, please verify yourself by clicking the button below.\n\n' +
        '✅ This helps us keep the server safe and spam-free!'
      )
      .setFooter({ text: 'Click the button below to verify' })
      .setTimestamp();

    // Create verify button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_button')
          .setLabel('✅ Verify')
          .setStyle(ButtonStyle.Success)
      );

    // Send verification message
    await interaction.reply({
      content: '✅ Verification system setup! Sending verification message...',
      ephemeral: true
    });

    await interaction.channel.send({
      embeds: [verifyEmbed],
      components: [row]
    });
  }
};
