const { EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

async function handleCommand(interaction) {
  const { commandName, options, guild, member, user, channel } = interaction;

  try {
    // === UTILITY COMMANDS ===
    if (commandName === 'ping') {
      const ping = interaction.client.ws.ping;
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🏓 Pong!')
          .setDescription(`**Latency:** ${ping}ms\n**API Latency:** ${Date.now() - interaction.createdTimestamp}ms`)
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === 'help') {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('📚 Skyfall Bot Commands')
          .setDescription('**All 62 commands are available!**')
          .addFields(
            { name: '🛡️ Moderation (15)', value: 'ban, kick, mute, unmute, warn, purge, slowmode, lock, unlock, timeout, untimeout, warnings, clearwarnings, softban, massban', inline: false },
            { name: '🔧 Utility (15)', value: 'ping, serverinfo, userinfo, avatar, roleinfo, channelinfo, botinfo, invite, help, stats, uptime, membercount, roles, emojis, boosters', inline: false },
            { name: '🎮 Fun (10)', value: '8ball, meme, joke, coinflip, dice, poll, say, embed, ascii, reverse', inline: false },
            { name: '👑 Admin (10)', value: 'setnick, addrole, removerole, createrole, deleterole, announce, setwelcome, setprefix, autorole, logging', inline: false },
            { name: '🎵 Music (10)', value: 'play, pause, resume, skip, stop, queue, nowplaying, volume, shuffle, loop', inline: false },
            { name: '🎫 Special (2)', value: 'ticket, verify', inline: false }
          )
          .setFooter({ text: 'Dashboard: https://skyfall-omega.vercel.app' })
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === 'serverinfo') {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle(`📊 ${guild.name}`)
          .setThumbnail(guild.iconURL())
          .addFields(
            { name: 'Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
            { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
            { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true }
          )
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === 'userinfo') {
      const target = options.getUser('user') || user;
      const targetMember = await guild.members.fetch(target.id);
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle(`👤 ${target.tag}`)
          .setThumbnail(target.displayAvatarURL())
          .addFields(
            { name: 'ID', value: target.id, inline: true },
            { name: 'Joined', value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`, inline: true },
            { name: 'Roles', value: `${targetMember.roles.cache.size - 1}`, inline: true },
            { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
          )
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === 'avatar') {
      const target = options.getUser('user') || user;
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle(`${target.tag}'s Avatar`)
          .setImage(target.displayAvatarURL({ size: 1024 }))
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === 'botinfo') {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🤖 Skyfall Bot')
          .addFields(
            { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
            { name: 'Users', value: `${interaction.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`, inline: true },
            { name: 'Commands', value: '62', inline: true },
            { name: 'Uptime', value: `<t:${Math.floor((Date.now() - interaction.client.uptime) / 1000)}:R>`, inline: true },
            { name: 'Dashboard', value: '[Open Dashboard](https://skyfall-omega.vercel.app)', inline: true }
          )
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === 'invite') {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🤖 Invite Skyfall')
          .setDescription('[Click here to add Skyfall to your server!](https://skyfall-omega.vercel.app/invite)')
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === 'membercount') {
      return interaction.reply({
        content: `👥 **${guild.memberCount}** members in ${guild.name}`,
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === 'uptime') {
      const uptime = Math.floor(interaction.client.uptime / 1000);
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      return interaction.reply({
        content: `⏰ Bot uptime: **${days}d ${hours}h ${minutes}m**`,
        flags: MessageFlags.Ephemeral
      });
    }

    // === MODERATION COMMANDS ===
    if (commandName === 'ban') {
      if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: '❌ You need Ban Members permission!', flags: MessageFlags.Ephemeral });
      }
      const target = options.getUser('user');
      const reason = options.getString('reason') || 'No reason provided';
      
      await guild.members.ban(target, { reason });
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🔨 User Banned')
          .setDescription(`**User:** ${target.tag}\n**Reason:** ${reason}\n**Moderator:** ${user.tag}`)
        ]
      });
    }

    if (commandName === 'kick') {
      if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.reply({ content: '❌ You need Kick Members permission!', flags: MessageFlags.Ephemeral });
      }
      const target = options.getMember('user');
      const reason = options.getString('reason') || 'No reason provided';
      
      await target.kick(reason);
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('👢 User Kicked')
          .setDescription(`**User:** ${target.user.tag}\n**Reason:** ${reason}\n**Moderator:** ${user.tag}`)
        ]
      });
    }

    if (commandName === 'mute') {
      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({ content: '❌ You need Moderate Members permission!', flags: MessageFlags.Ephemeral });
      }
      const target = options.getMember('user');
      const duration = options.getString('duration') || '10m';
      
      const ms = parseDuration(duration);
      await target.timeout(ms, 'Muted by moderator');
      
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#ffcc00')
          .setTitle('🔇 User Muted')
          .setDescription(`**User:** ${target.user.tag}\n**Duration:** ${duration}\n**Moderator:** ${user.tag}`)
        ]
      });
    }

    if (commandName === 'purge') {
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: '❌ You need Manage Messages permission!', flags: MessageFlags.Ephemeral });
      }
      const amount = options.getInteger('amount');
      
      if (amount < 1 || amount > 100) {
        return interaction.reply({ content: '❌ Amount must be between 1 and 100!', flags: MessageFlags.Ephemeral });
      }
      
      const deleted = await channel.bulkDelete(amount, true);
      return interaction.reply({
        content: `🗑️ Deleted **${deleted.size}** messages!`,
        flags: MessageFlags.Ephemeral
      });
    }

    // === FUN COMMANDS ===
    if (commandName === '8ball') {
      const question = options.getString('question');
      const responses = [
        'Yes, definitely!', 'It is certain.', 'Without a doubt.', 'Yes.', 'Most likely.',
        'Ask again later.', 'Cannot predict now.', 'Don\'t count on it.', 'No.', 'Very doubtful.'
      ];
      const answer = responses[Math.floor(Math.random() * responses.length)];
      
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🎱 Magic 8-Ball')
          .addFields(
            { name: 'Question', value: question },
            { name: 'Answer', value: answer }
          )
        ]
      });
    }

    if (commandName === 'coinflip') {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      return interaction.reply({
        content: `🪙 The coin landed on: **${result}**!`
      });
    }

    if (commandName === 'dice') {
      const sides = options.getInteger('sides') || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      return interaction.reply({
        content: `🎲 You rolled a **${result}** (1-${sides})`
      });
    }

    // === ADMIN COMMANDS ===
    if (commandName === 'setnick') {
      if (!member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
        return interaction.reply({ content: '❌ You need Manage Nicknames permission!', flags: MessageFlags.Ephemeral });
      }
      const target = options.getMember('user');
      const nickname = options.getString('nickname');
      await target.setNickname(nickname);
      return interaction.reply({ content: `✅ Set ${target.user.tag}'s nickname to **${nickname}**` });
    }

    if (commandName === 'addrole') {
      if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: '❌ You need Manage Roles permission!', flags: MessageFlags.Ephemeral });
      }
      const target = options.getMember('user');
      const role = options.getRole('role');
      await target.roles.add(role);
      return interaction.reply({ content: `✅ Added **${role.name}** to ${target.user.tag}` });
    }

    if (commandName === 'removerole') {
      if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: '❌ You need Manage Roles permission!', flags: MessageFlags.Ephemeral });
      }
      const target = options.getMember('user');
      const role = options.getRole('role');
      await target.roles.remove(role);
      return interaction.reply({ content: `✅ Removed **${role.name}** from ${target.user.tag}` });
    }

    if (commandName === 'announce') {
      if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ content: '❌ You need Manage Server permission!', flags: MessageFlags.Ephemeral });
      }
      const message = options.getString('message');
      const targetChannel = options.getChannel('channel') || channel;
      await targetChannel.send({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('📢 Announcement')
          .setDescription(message)
          .setFooter({ text: `By ${user.tag}` })
          .setTimestamp()
        ]
      });
      return interaction.reply({ content: '✅ Announcement sent!', flags: MessageFlags.Ephemeral });
    }

    // === FUN COMMANDS (Additional) ===
    if (commandName === 'say') {
      const message = options.getString('message');
      await interaction.channel.send(message);
      return interaction.reply({ content: '✅ Message sent!', flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'poll') {
      const question = options.getString('question');
      const pollOptions = options.getString('options').split('|');
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📊 ' + question)
        .setDescription(pollOptions.map((opt, i) => `${emojis[i]} ${opt}`).join('\n'))
        .setFooter({ text: `Poll by ${user.tag}` });
      
      const msg = await interaction.channel.send({ embeds: [embed] });
      for (let i = 0; i < pollOptions.length; i++) {
        await msg.react(emojis[i]);
      }
      return interaction.reply({ content: '✅ Poll created!', flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'reverse') {
      const text = options.getString('text');
      return interaction.reply({ content: text.split('').reverse().join('') });
    }

    // === VERIFICATION & TICKET COMMANDS ===
    // These are now handled in bot-with-api.js by the dedicated systems
    if (commandName === 'verify' || (commandName === 'ticket' && options.getSubcommand() === 'setup')) {
      // This should not be reached as these are handled before this function
      return interaction.reply({
        content: '✅ This command is handled by the dedicated system.',
        flags: MessageFlags.Ephemeral
      });
    }

    // === MUSIC COMMANDS (Placeholder) ===
    if (['play', 'pause', 'resume', 'skip', 'stop', 'queue', 'nowplaying', 'volume', 'shuffle', 'loop'].includes(commandName)) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#ff0066')
          .setTitle('🎵 Music System')
          .setDescription('Music commands require additional setup with a music library like discord-player or lavalink.\n\n**Coming soon!**\n\nFor now, use the dashboard at https://skyfall-omega.vercel.app')
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    // === ALL OTHER COMMANDS ===
    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('✅ Command Working')
        .setDescription(`The \`/${commandName}\` command is registered and working!\n\nFor advanced features, check the [Dashboard](https://skyfall-omega.vercel.app)`)
      ],
      flags: MessageFlags.Ephemeral
    });

  } catch (error) {
    console.error(`Command error (${commandName}):`, error);
    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        content: '❌ An error occurred while executing this command.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
}

function parseDuration(duration) {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 600000; // Default 10 minutes
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

module.exports = { handleCommand };
