const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Database files
const APPEALS_DB = path.join(__dirname, '../../data/appeals.json');
const BANS_DB = path.join(__dirname, '../../data/bans.json');
const CONFIG_DB = path.join(__dirname, '../../data/appeals-config.json');

// Ensure directories exist
[APPEALS_DB, BANS_DB, CONFIG_DB].forEach(file => {
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
  appealChannelId: null,
  reviewChannelId: null,
  logChannelId: null,
  allowedAfterDays: 7,
  requireReason: true,
  dmOnDecision: true
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

// Setup appeals system
async function setupAppealsSystem(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permission!',
      flags: 64
    });
  }

  const { guild, channel } = interaction;
  const config = getConfig(guild.id);

  // Create review channel if doesn't exist
  if (!config.reviewChannelId) {
    const reviewChannel = await guild.channels.create({
      name: 'appeal-reviews',
      type: 0,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        }
      ]
    });
    config.reviewChannelId = reviewChannel.id;
  }

  config.appealChannelId = channel.id;
  saveConfig(guild.id, config);

  // Create appeal panel
  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('⚖️ Ban Appeal System')
    .setDescription(
      '**Have you been banned? Submit an appeal!**\n\n' +
      '📝 **How it works:**\n' +
      '1. Click "Submit Appeal" below\n' +
      '2. Fill out the appeal form\n' +
      '3. Staff will review your appeal\n' +
      '4. You\'ll be notified of the decision\n\n' +
      '⚠️ **Requirements:**\n' +
      `• Must wait ${config.allowedAfterDays} days after ban\n` +
      '• Be honest and respectful\n' +
      '• Provide detailed information\n' +
      '• Only one appeal per ban\n\n' +
      '✅ **What to include:**\n' +
      '• Why you were banned\n' +
      '• Why you should be unbanned\n' +
      '• What you\'ll do differently'
    )
    .setFooter({ text: 'Appeals are reviewed by staff' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('appeal_submit')
        .setLabel('📝 Submit Appeal')
        .setStyle(ButtonStyle.Primary)
    );

  await interaction.reply({
    content: '✅ Appeals system setup complete!',
    flags: 64
  });

  await channel.send({
    embeds: [embed],
    components: [row]
  });
}

// Show appeal modal
async function showAppealModal(interaction) {
  const { guild, user } = interaction;
  const config = getConfig(guild.id);

  if (!config.enabled) {
    return interaction.reply({
      content: '❌ Appeals system is currently disabled!',
      flags: 64
    });
  }

  // Check if already appealed (skip ban check as banned users can't interact in guild)
  const appeals = loadDB(APPEALS_DB, {});
  const guildAppeals = appeals[guild.id] || {};
  const existingAppeal = Object.values(guildAppeals).find(
    a => a.userId === user.id && a.status === 'pending'
  );

  if (existingAppeal) {
    return interaction.reply({
      content: '❌ You already have a pending appeal!',
      flags: 64
    });
  }

  // Show modal
  const modal = new ModalBuilder()
    .setCustomId('appeal_modal')
    .setTitle('Ban Appeal Form');

  const reasonInput = new TextInputBuilder()
    .setCustomId('appeal_reason')
    .setLabel('Why were you banned?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Explain what happened...')
    .setRequired(true)
    .setMaxLength(1000);

  const whyUnbanInput = new TextInputBuilder()
    .setCustomId('appeal_why_unban')
    .setLabel('Why should you be unbanned?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Explain why you deserve another chance...')
    .setRequired(true)
    .setMaxLength(1000);

  const changeInput = new TextInputBuilder()
    .setCustomId('appeal_change')
    .setLabel('What will you do differently?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('How will you prevent this from happening again?')
    .setRequired(true)
    .setMaxLength(1000);

  const row1 = new ActionRowBuilder().addComponents(reasonInput);
  const row2 = new ActionRowBuilder().addComponents(whyUnbanInput);
  const row3 = new ActionRowBuilder().addComponents(changeInput);

  modal.addComponents(row1, row2, row3);

  await interaction.showModal(modal);
}

// Handle appeal submission
async function handleAppealSubmission(interaction) {
  const { guild, user } = interaction;
  const config = getConfig(guild.id);

  const reason = interaction.fields.getTextInputValue('appeal_reason');
  const whyUnban = interaction.fields.getTextInputValue('appeal_why_unban');
  const change = interaction.fields.getTextInputValue('appeal_change');

  await interaction.deferReply({ flags: 64 });

  try {
    const appeals = loadDB(APPEALS_DB, {});
    if (!appeals[guild.id]) appeals[guild.id] = {};

    // Generate consistent 8-character appeal ID
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let appealId = '';
    do {
      appealId = '';
      for (let i = 0; i < 8; i++) {
        appealId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (appeals[guild.id][appealId]); // Ensure uniqueness

    const appealData = {
      appealId,
      userId: user.id,
      username: user.tag,
      reason,
      whyUnban,
      change,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      decision: null,
      reviewNotes: null
    };

    appeals[guild.id][appealId] = appealData;
    saveDB(APPEALS_DB, appeals);

    // Send to review channel
    if (config.reviewChannelId) {
      const reviewChannel = guild.channels.cache.get(config.reviewChannelId);
      if (reviewChannel) {
        const reviewEmbed = new EmbedBuilder()
          .setColor('#FEE75C')
          .setTitle('⚖️ New Ban Appeal')
          .setThumbnail(user.displayAvatarURL())
          .addFields(
            { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
            { name: 'Why were they banned?', value: reason.slice(0, 1024), inline: false },
            { name: 'Why should they be unbanned?', value: whyUnban.slice(0, 1024), inline: false },
            { name: 'What will they do differently?', value: change.slice(0, 1024), inline: false },
            { name: 'Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
          )
          .setFooter({ text: `Appeal ID: ${appealId}` })
          .setTimestamp();

        const buttons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`appeal_accept_${appealId}`)
              .setLabel('✅ Accept')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`appeal_deny_${appealId}`)
              .setLabel('❌ Deny')
              .setStyle(ButtonStyle.Danger)
          );

        await reviewChannel.send({
          embeds: [reviewEmbed],
          components: [buttons]
        });
      }
    }

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Appeal Submitted')
        .setDescription(
          'Your ban appeal has been submitted successfully!\n\n' +
          '**What happens next:**\n' +
          '• Staff will review your appeal\n' +
          '• This may take a few days\n' +
          '• You\'ll be notified of the decision\n\n' +
          `**Appeal ID:** \`${appealId}\``
        )
        .setTimestamp()
      ]
    });

    console.log(`✅ Appeal submitted by ${user.tag} in ${guild.name}`);
  } catch (error) {
    console.error('Error submitting appeal:', error);
    await interaction.editReply({
      content: '❌ An error occurred while submitting your appeal.'
    });
  }
}

// Accept appeal
async function acceptAppeal(interaction, appealId) {
  const { guild, user } = interaction;
  const config = getConfig(guild.id);

  if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return interaction.reply({
      content: '❌ You need Ban Members permission!',
      flags: 64
    });
  }

  const appeals = loadDB(APPEALS_DB, {});
  const appeal = appeals[guild.id]?.[appealId];

  if (!appeal) {
    return interaction.reply({
      content: '❌ Appeal not found!',
      flags: 64
    });
  }

  if (appeal.status !== 'pending') {
    return interaction.reply({
      content: '❌ This appeal has already been reviewed!',
      flags: 64
    });
  }

  await interaction.deferReply();

  try {
    // Unban user
    await guild.bans.remove(appeal.userId, `Appeal accepted by ${user.tag}`);

    // Update appeal
    appeal.status = 'accepted';
    appeal.reviewedBy = user.id;
    appeal.reviewedAt = new Date().toISOString();
    appeal.decision = 'accepted';
    saveDB(APPEALS_DB, appeals);

    // DM user if enabled
    if (config.dmOnDecision) {
      try {
        const appealUser = await guild.client.users.fetch(appeal.userId);
        await appealUser.send({
          embeds: [new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Appeal Accepted')
            .setDescription(
              `Your ban appeal for **${guild.name}** has been accepted!\n\n` +
              `You have been unbanned and can rejoin the server.\n\n` +
              `**Reviewed by:** ${user.tag}\n` +
              `**Date:** <t:${Math.floor(Date.now() / 1000)}:F>`
            )
            .setTimestamp()
          ]
        });
      } catch (error) {
        console.log('Could not DM user:', error.message);
      }
    }

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Appeal Accepted')
        .setDescription(
          `**User:** ${appeal.username}\n` +
          `**Reviewed by:** ${user.tag}\n` +
          `**Decision:** Accepted\n\n` +
          `User has been unbanned and notified.`
        )
        .setTimestamp()
      ],
      components: []
    });

    console.log(`✅ Appeal accepted for ${appeal.username} by ${user.tag}`);
  } catch (error) {
    console.error('Error accepting appeal:', error);
    await interaction.editReply({
      content: '❌ An error occurred while accepting the appeal.'
    });
  }
}

// Deny appeal
async function denyAppeal(interaction, appealId) {
  const { guild, user } = interaction;
  const config = getConfig(guild.id);

  if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return interaction.reply({
      content: '❌ You need Ban Members permission!',
      flags: 64
    });
  }

  const appeals = loadDB(APPEALS_DB, {});
  const appeal = appeals[guild.id]?.[appealId];

  if (!appeal) {
    return interaction.reply({
      content: '❌ Appeal not found!',
      flags: 64
    });
  }

  if (appeal.status !== 'pending') {
    return interaction.reply({
      content: '❌ This appeal has already been reviewed!',
      flags: 64
    });
  }

  await interaction.deferReply();

  try {
    // Update appeal
    appeal.status = 'denied';
    appeal.reviewedBy = user.id;
    appeal.reviewedAt = new Date().toISOString();
    appeal.decision = 'denied';
    saveDB(APPEALS_DB, appeals);

    // DM user if enabled
    if (config.dmOnDecision) {
      try {
        const appealUser = await guild.client.users.fetch(appeal.userId);
        await appealUser.send({
          embeds: [new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('❌ Appeal Denied')
            .setDescription(
              `Your ban appeal for **${guild.name}** has been denied.\n\n` +
              `Your ban will remain in effect.\n\n` +
              `**Reviewed by:** ${user.tag}\n` +
              `**Date:** <t:${Math.floor(Date.now() / 1000)}:F>`
            )
            .setTimestamp()
          ]
        });
      } catch (error) {
        console.log('Could not DM user:', error.message);
      }
    }

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('❌ Appeal Denied')
        .setDescription(
          `**User:** ${appeal.username}\n` +
          `**Reviewed by:** ${user.tag}\n` +
          `**Decision:** Denied\n\n` +
          `User has been notified.`
        )
        .setTimestamp()
      ],
      components: []
    });

    console.log(`❌ Appeal denied for ${appeal.username} by ${user.tag}`);
  } catch (error) {
    console.error('Error denying appeal:', error);
    await interaction.editReply({
      content: '❌ An error occurred while denying the appeal.'
    });
  }
}

// Get appeal stats
function getAppealStats(guildId) {
  const appeals = loadDB(APPEALS_DB, {});
  const guildAppeals = appeals[guildId] || {};
  
  const pending = Object.values(guildAppeals).filter(a => a.status === 'pending').length;
  const accepted = Object.values(guildAppeals).filter(a => a.status === 'accepted').length;
  const denied = Object.values(guildAppeals).filter(a => a.status === 'denied').length;
  
  return {
    total: Object.keys(guildAppeals).length,
    pending,
    accepted,
    denied,
    appeals: guildAppeals
  };
}

module.exports = {
  setupAppealsSystem,
  showAppealModal,
  handleAppealSubmission,
  acceptAppeal,
  denyAppeal,
  getAppealStats,
  getConfig,
  saveConfig
};
