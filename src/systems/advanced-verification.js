const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Database files
const VERIFIED_DB = path.join(__dirname, '../../data/verified-users.json');
const CONFIG_DB = path.join(__dirname, '../../data/verification-config.json');
const PENDING_DB = path.join(__dirname, '../../data/pending-verifications.json');

// Ensure data directory exists
[VERIFIED_DB, CONFIG_DB, PENDING_DB].forEach(file => {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Load databases
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

// Save database
function saveDB(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${file}:`, error);
  }
}

// Generate random verification code
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate math problem
function generateMathProblem() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer;
  switch (operator) {
    case '+': answer = num1 + num2; break;
    case '-': answer = num1 - num2; break;
    case '*': answer = num1 * num2; break;
  }
  
  return {
    problem: `${num1} ${operator} ${num2}`,
    answer: answer
  };
}

// Default verification config
const DEFAULT_CONFIG = {
  enabled: true,
  requireButton: true,
  requireCode: false,
  requireMath: false,
  requireReaction: false,
  accountAgeMinDays: 7,
  preventBots: true,
  logChannel: null,
  verifiedRole: 'Verified',
  autoKickUnverified: false,
  autoKickTimeMinutes: 10
};

// Get guild config
function getConfig(guildId) {
  const configs = loadDB(CONFIG_DB, {});
  return configs[guildId] || DEFAULT_CONFIG;
}

// Save guild config
function saveConfig(guildId, config) {
  const configs = loadDB(CONFIG_DB, {});
  configs[guildId] = config;
  saveDB(CONFIG_DB, configs);
}

// Setup advanced verification
async function setupAdvancedVerification(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permission!',
      flags: 64
    });
  }

  const config = getConfig(interaction.guild.id);

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🔐 Advanced Verification System')
    .setDescription(
      '**Welcome! Please verify to access the server.**\n\n' +
      '🛡️ **Security Measures:**\n' +
      (config.requireButton ? '✅ Button Click Required\n' : '') +
      (config.requireCode ? '✅ Code Verification Required\n' : '') +
      (config.requireMath ? '✅ Math Problem Required\n' : '') +
      (config.accountAgeMinDays > 0 ? `✅ Account must be ${config.accountAgeMinDays}+ days old\n` : '') +
      (config.preventBots ? '✅ Bot Detection Enabled\n' : '') +
      '\n⚠️ **Rules:**\n' +
      '• You can only verify once\n' +
      '• Follow all verification steps\n' +
      '• No spam or abuse\n' +
      (config.autoKickUnverified ? `• Verify within ${config.autoKickTimeMinutes} minutes or be kicked\n` : '')
    )
    .setFooter({ text: 'Click the button below to start verification' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('verify_start')
        .setLabel('🔐 Start Verification')
        .setStyle(ButtonStyle.Success)
    );

  await interaction.reply({
    content: '✅ Advanced verification system setup!',
    flags: 64
  });

  await interaction.channel.send({
    embeds: [embed],
    components: [row]
  });
}

// Start verification process
async function startVerification(interaction) {
  const { guild, user, member } = interaction;
  const config = getConfig(guild.id);

  // Check if already verified
  const verified = loadDB(VERIFIED_DB, {});
  if (verified[guild.id]?.[user.id]) {
    return interaction.reply({
      content: '✅ You are already verified!',
      flags: 64
    });
  }

  // Check if bot
  if (config.preventBots && user.bot) {
    return interaction.reply({
      content: '❌ Bots cannot be verified!',
      flags: 64
    });
  }

  // Check account age
  if (config.accountAgeMinDays > 0) {
    const accountAge = Date.now() - user.createdTimestamp;
    const minAge = config.accountAgeMinDays * 24 * 60 * 60 * 1000;
    
    if (accountAge < minAge) {
      return interaction.reply({
        content: `❌ Your account must be at least ${config.accountAgeMinDays} days old to verify!`,
        flags: 64
      });
    }
  }

  await interaction.deferReply({ flags: 64 });

  try {
    const pending = loadDB(PENDING_DB, {});
    if (!pending[guild.id]) pending[guild.id] = {};

    // Generate verification challenges
    const challenges = {
      userId: user.id,
      username: user.tag,
      startedAt: new Date().toISOString(),
      completed: {
        button: true // Button already clicked
      }
    };

    // Add code challenge
    if (config.requireCode) {
      challenges.code = generateCode();
      challenges.completed.code = false;
    }

    // Add math challenge
    if (config.requireMath) {
      const math = generateMathProblem();
      challenges.math = math;
      challenges.completed.math = false;
    }

    pending[guild.id][user.id] = challenges;
    saveDB(PENDING_DB, pending);

    // Build verification message
    let description = '**Verification Started!**\n\n';
    description += '✅ Step 1: Button Click - Complete!\n\n';

    const components = [];

    if (config.requireCode) {
      description += `🔢 **Step 2: Enter this code**\n\`\`\`${challenges.code}\`\`\`\n`;
      description += 'Click the button below and enter the code.\n\n';
      
      components.push(new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`verify_code_${user.id}`)
            .setLabel('Enter Code')
            .setStyle(ButtonStyle.Primary)
        ));
    }

    if (config.requireMath) {
      description += `🧮 **Step ${config.requireCode ? '3' : '2'}: Solve this problem**\n\`\`\`${challenges.math.problem} = ?\`\`\`\n`;
      description += 'Click the button below and enter the answer.\n\n';
      
      components.push(new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`verify_math_${user.id}`)
            .setLabel('Enter Answer')
            .setStyle(ButtonStyle.Primary)
        ));
    }

    if (!config.requireCode && !config.requireMath) {
      // Simple verification - just button click
      await completeVerification(interaction, guild, user, member, config);
      return;
    }

    description += '⏱️ **You have 5 minutes to complete verification.**';

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🔐 Verification In Progress')
        .setDescription(description)
        .setFooter({ text: 'Complete all steps to verify' })
        .setTimestamp()
      ],
      components
    });

    // Auto-delete pending after 5 minutes
    setTimeout(() => {
      const current = loadDB(PENDING_DB, {});
      if (current[guild.id]?.[user.id]) {
        delete current[guild.id][user.id];
        saveDB(PENDING_DB, current);
      }
    }, 5 * 60 * 1000);

  } catch (error) {
    console.error('Verification start error:', error);
    await interaction.editReply({
      content: '❌ An error occurred. Please try again.'
    });
  }
}

// Complete verification
async function completeVerification(interaction, guild, user, member, config) {
  try {
    // Find or create Verified role
    let verifiedRole = guild.roles.cache.find(role => role.name === config.verifiedRole);
    
    if (!verifiedRole) {
      verifiedRole = await guild.roles.create({
        name: config.verifiedRole,
        color: '#57F287',
        reason: 'Verification system role'
      });
    }

    // Add role to user
    await member.roles.add(verifiedRole);

    // Save to database
    const verified = loadDB(VERIFIED_DB, {});
    if (!verified[guild.id]) verified[guild.id] = {};
    verified[guild.id][user.id] = {
      username: user.tag,
      verifiedAt: new Date().toISOString(),
      method: 'advanced'
    };
    saveDB(VERIFIED_DB, verified);

    // Remove from pending
    const pending = loadDB(PENDING_DB, {});
    if (pending[guild.id]?.[user.id]) {
      delete pending[guild.id][user.id];
      saveDB(PENDING_DB, pending);
    }

    // Send success message
    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Verification Complete!')
        .setDescription(
          `Welcome to **${guild.name}**, ${user}!\n\n` +
          `You now have full access to the server.\n` +
          `Enjoy your stay! 🎉`
        )
        .setTimestamp()
      ],
      components: []
    });

    // Log to channel if configured
    if (config.logChannel) {
      const logChannel = guild.channels.cache.get(config.logChannel);
      if (logChannel) {
        await logChannel.send({
          embeds: [new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ User Verified')
            .addFields(
              { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
              { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setTimestamp()
          ]
        });
      }
    }

    console.log(`✅ Verified user: ${user.tag} in ${guild.name}`);
  } catch (error) {
    console.error('Verification completion error:', error);
    throw error;
  }
}

// Configure verification settings
async function configureVerification(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permission!',
      flags: 64
    });
  }

  const config = getConfig(interaction.guild.id);
  
  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('⚙️ Verification Configuration')
    .setDescription('Current settings:')
    .addFields(
      { name: 'Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
      { name: 'Button Required', value: config.requireButton ? '✅ Yes' : '❌ No', inline: true },
      { name: 'Code Required', value: config.requireCode ? '✅ Yes' : '❌ No', inline: true },
      { name: 'Math Required', value: config.requireMath ? '✅ Yes' : '❌ No', inline: true },
      { name: 'Min Account Age', value: `${config.accountAgeMinDays} days`, inline: true },
      { name: 'Bot Prevention', value: config.preventBots ? '✅ Enabled' : '❌ Disabled', inline: true },
      { name: 'Verified Role', value: config.verifiedRole, inline: true },
      { name: 'Auto-Kick Unverified', value: config.autoKickUnverified ? `✅ After ${config.autoKickTimeMinutes}m` : '❌ Disabled', inline: true }
    )
    .setFooter({ text: 'Use /verify config to change settings' });

  await interaction.reply({
    embeds: [embed],
    flags: 64
  });
}

module.exports = {
  setupAdvancedVerification,
  startVerification,
  completeVerification,
  configureVerification,
  getConfig,
  saveConfig,
  DEFAULT_CONFIG
};
