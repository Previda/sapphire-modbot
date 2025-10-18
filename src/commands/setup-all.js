const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Complete server setup wizard')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🛠️ Server Setup Wizard')
      .setDescription('Welcome to the Skyfall Bot setup wizard! Choose what you want to configure:')
      .addFields(
        { name: '📋 Logging', value: 'Setup logging channels for moderation, messages, members, etc.', inline: false },
        { name: '🎫 Tickets', value: 'Setup support ticket system with categories', inline: false },
        { name: '🛡️ Verification', value: 'Setup member verification system', inline: false },
        { name: '⚖️ Appeals', value: 'Setup ban appeal system', inline: false },
        { name: '🤖 AutoMod', value: 'Setup automatic moderation (spam, links, etc.)', inline: false }
      )
      .setFooter({ text: 'Use the buttons below or individual commands' });

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('setup_logging')
          .setLabel('📋 Logging')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('setup_tickets')
          .setLabel('🎫 Tickets')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('setup_verification')
          .setLabel('🛡️ Verification')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('setup_appeals')
          .setLabel('⚖️ Appeals')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('setup_automod')
          .setLabel('🤖 AutoMod')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('setup_all_systems')
          .setLabel('✨ Setup All')
          .setStyle(ButtonStyle.Success)
      );

    await interaction.editReply({
      embeds: [embed],
      components: [row1, row2]
    });
  }
};
