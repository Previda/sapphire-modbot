const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Database file for verified users
const DB_FILE = path.join(__dirname, '../../data/verified-users.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Load verified users database
function loadVerifiedUsers() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading verified users:', error);
  }
  return {};
}

// Save verified users database
function saveVerifiedUsers(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving verified users:', error);
  }
}

// Check if user is verified
function isUserVerified(guildId, userId) {
  const verifiedUsers = loadVerifiedUsers();
  return verifiedUsers[guildId]?.[userId] !== undefined;
}

// Add verified user
function addVerifiedUser(guildId, userId, username) {
  const verifiedUsers = loadVerifiedUsers();
  if (!verifiedUsers[guildId]) {
    verifiedUsers[guildId] = {};
  }
  verifiedUsers[guildId][userId] = {
    username,
    verifiedAt: new Date().toISOString()
  };
  saveVerifiedUsers(verifiedUsers);
}

// Setup verification system
async function setupVerification(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permission to setup verification!',
      flags: 64
    });
  }

  const verifyEmbed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🔐 Server Verification')
    .setDescription(
      '**Welcome to the server!**\n\n' +
      'To gain access to all channels, please verify yourself by clicking the button below.\n\n' +
      '✅ **What happens when you verify:**\n' +
      '• You get the Verified role\n' +
      '• You can see all server channels\n' +
      '• You can participate in discussions\n\n' +
      '⚠️ **Note:** You can only verify once!'
    )
    .setFooter({ text: 'Click the button below to verify' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('✅ Verify Me')
        .setStyle(ButtonStyle.Success)
    );

  await interaction.reply({
    content: '✅ Verification system setup complete!',
    flags: 64
  });

  await interaction.channel.send({
    embeds: [verifyEmbed],
    components: [row]
  });
}

// Handle verification button click
async function handleVerificationButton(interaction) {
  const { guild, user, member } = interaction;

  // Check if already verified
  if (isUserVerified(guild.id, user.id)) {
    return interaction.reply({
      content: '✅ You are already verified!',
      flags: 64
    });
  }

  try {
    // Find or create Verified role
    let verifiedRole = guild.roles.cache.find(role => role.name === 'Verified');
    
    if (!verifiedRole) {
      verifiedRole = await guild.roles.create({
        name: 'Verified',
        color: '#57F287',
        reason: 'Verification system role'
      });
    }

    // Add role to user
    await member.roles.add(verifiedRole);

    // Save to database
    addVerifiedUser(guild.id, user.id, user.tag);

    // Send success message
    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Verification Successful!')
        .setDescription(
          `Welcome to **${guild.name}**, ${user}!\n\n` +
          `You now have access to all channels.\n` +
          `Enjoy your stay! 🎉`
        )
        .setTimestamp()
      ],
      flags: 64
    });

    console.log(`✅ Verified user: ${user.tag} in ${guild.name}`);
  } catch (error) {
    console.error('Verification error:', error);
    await interaction.reply({
      content: '❌ An error occurred during verification. Please contact an administrator.',
      flags: 64
    });
  }
}

// Get verification stats
function getVerificationStats(guildId) {
  const verifiedUsers = loadVerifiedUsers();
  const guildData = verifiedUsers[guildId] || {};
  return {
    totalVerified: Object.keys(guildData).length,
    users: guildData
  };
}

module.exports = {
  setupVerification,
  handleVerificationButton,
  isUserVerified,
  getVerificationStats
};
