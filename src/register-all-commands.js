const { REST, Routes } = require('discord.js');
require('dotenv').config();

// All 60 Commands organized by category
const commands = [
  // === MODERATION COMMANDS (15) ===
  { name: 'ban', description: 'Ban a user from the server', options: [
    { name: 'user', type: 6, description: 'User to ban', required: true },
    { name: 'reason', type: 3, description: 'Reason for ban', required: false }
  ]},
  { name: 'kick', description: 'Kick a user from the server', options: [
    { name: 'user', type: 6, description: 'User to kick', required: true },
    { name: 'reason', type: 3, description: 'Reason for kick', required: false }
  ]},
  { name: 'mute', description: 'Mute a user', options: [
    { name: 'user', type: 6, description: 'User to mute', required: true },
    { name: 'duration', type: 3, description: 'Duration (e.g., 10m, 1h)', required: false }
  ]},
  { name: 'unmute', description: 'Unmute a user', options: [
    { name: 'user', type: 6, description: 'User to unmute', required: true }
  ]},
  { name: 'warn', description: 'Warn a user', options: [
    { name: 'user', type: 6, description: 'User to warn', required: true },
    { name: 'reason', type: 3, description: 'Warning reason', required: true }
  ]},
  { name: 'purge', description: 'Delete multiple messages', options: [
    { name: 'amount', type: 4, description: 'Number of messages (1-100)', required: true }
  ]},
  { name: 'slowmode', description: 'Set channel slowmode', options: [
    { name: 'seconds', type: 4, description: 'Slowmode duration in seconds', required: true }
  ]},
  { name: 'lock', description: 'Lock a channel' },
  { name: 'unlock', description: 'Unlock a channel' },
  { name: 'timeout', description: 'Timeout a user', options: [
    { name: 'user', type: 6, description: 'User to timeout', required: true },
    { name: 'duration', type: 3, description: 'Duration (e.g., 10m, 1h)', required: true }
  ]},
  { name: 'untimeout', description: 'Remove timeout from user', options: [
    { name: 'user', type: 6, description: 'User to remove timeout from', required: true }
  ]},
  { name: 'warnings', description: 'View user warnings', options: [
    { name: 'user', type: 6, description: 'User to check warnings', required: true }
  ]},
  { name: 'clearwarnings', description: 'Clear user warnings', options: [
    { name: 'user', type: 6, description: 'User to clear warnings', required: true }
  ]},
  { name: 'softban', description: 'Softban a user (ban and unban)', options: [
    { name: 'user', type: 6, description: 'User to softban', required: true }
  ]},
  { name: 'massban', description: 'Ban multiple users', options: [
    { name: 'users', type: 3, description: 'User IDs separated by spaces', required: true }
  ]},

  // === UTILITY COMMANDS (15) ===
  { name: 'ping', description: 'Check bot latency' },
  { name: 'serverinfo', description: 'Display server information' },
  { name: 'userinfo', description: 'Display user information', options: [
    { name: 'user', type: 6, description: 'User to get info about', required: false }
  ]},
  { name: 'avatar', description: 'Get user avatar', options: [
    { name: 'user', type: 6, description: 'User to get avatar', required: false }
  ]},
  { name: 'roleinfo', description: 'Get role information', options: [
    { name: 'role', type: 8, description: 'Role to get info about', required: true }
  ]},
  { name: 'channelinfo', description: 'Get channel information' },
  { name: 'botinfo', description: 'Display bot information' },
  { name: 'invite', description: 'Get bot invite link' },
  { name: 'help', description: 'Display help menu' },
  { name: 'stats', description: 'Display bot statistics' },
  { name: 'uptime', description: 'Show bot uptime' },
  { name: 'membercount', description: 'Show server member count' },
  { name: 'roles', description: 'List all server roles' },
  { name: 'emojis', description: 'List all server emojis' },
  { name: 'boosters', description: 'List server boosters' },

  // === FUN COMMANDS (10) ===
  { name: '8ball', description: 'Ask the magic 8ball', options: [
    { name: 'question', type: 3, description: 'Your question', required: true }
  ]},
  { name: 'meme', description: 'Get a random meme' },
  { name: 'joke', description: 'Get a random joke' },
  { name: 'coinflip', description: 'Flip a coin' },
  { name: 'dice', description: 'Roll a dice', options: [
    { name: 'sides', type: 4, description: 'Number of sides (default: 6)', required: false }
  ]},
  { name: 'poll', description: 'Create a poll', options: [
    { name: 'question', type: 3, description: 'Poll question', required: true },
    { name: 'options', type: 3, description: 'Options separated by |', required: true }
  ]},
  { name: 'say', description: 'Make the bot say something', options: [
    { name: 'message', type: 3, description: 'Message to say', required: true }
  ]},
  { name: 'embed', description: 'Create an embed message', options: [
    { name: 'title', type: 3, description: 'Embed title', required: true },
    { name: 'description', type: 3, description: 'Embed description', required: true }
  ]},
  { name: 'ascii', description: 'Convert text to ASCII art', options: [
    { name: 'text', type: 3, description: 'Text to convert', required: true }
  ]},
  { name: 'reverse', description: 'Reverse text', options: [
    { name: 'text', type: 3, description: 'Text to reverse', required: true }
  ]},

  // === ADMIN COMMANDS (10) ===
  { name: 'setnick', description: 'Set user nickname', options: [
    { name: 'user', type: 6, description: 'User to set nickname', required: true },
    { name: 'nickname', type: 3, description: 'New nickname', required: true }
  ]},
  { name: 'addrole', description: 'Add role to user', options: [
    { name: 'user', type: 6, description: 'User to add role to', required: true },
    { name: 'role', type: 8, description: 'Role to add', required: true }
  ]},
  { name: 'removerole', description: 'Remove role from user', options: [
    { name: 'user', type: 6, description: 'User to remove role from', required: true },
    { name: 'role', type: 8, description: 'Role to remove', required: true }
  ]},
  { name: 'createrole', description: 'Create a new role', options: [
    { name: 'name', type: 3, description: 'Role name', required: true },
    { name: 'color', type: 3, description: 'Role color (hex)', required: false }
  ]},
  { name: 'deleterole', description: 'Delete a role', options: [
    { name: 'role', type: 8, description: 'Role to delete', required: true }
  ]},
  { name: 'announce', description: 'Send an announcement', options: [
    { name: 'message', type: 3, description: 'Announcement message', required: true },
    { name: 'channel', type: 7, description: 'Channel to send to', required: false }
  ]},
  { name: 'setwelcome', description: 'Set welcome message', options: [
    { name: 'message', type: 3, description: 'Welcome message', required: true }
  ]},
  { name: 'setprefix', description: 'Set bot prefix', options: [
    { name: 'prefix', type: 3, description: 'New prefix', required: true }
  ]},
  { name: 'autorole', description: 'Setup auto role', options: [
    { name: 'role', type: 8, description: 'Role to auto-assign', required: true }
  ]},
  { name: 'logging', description: 'Setup logging channel', options: [
    { name: 'channel', type: 7, description: 'Logging channel', required: true }
  ]},

  // === MUSIC COMMANDS (10) ===
  { name: 'play', description: 'Play a song', options: [
    { name: 'query', type: 3, description: 'Song name or URL', required: true }
  ]},
  { name: 'pause', description: 'Pause current song' },
  { name: 'resume', description: 'Resume playback' },
  { name: 'skip', description: 'Skip current song' },
  { name: 'stop', description: 'Stop playback and clear queue' },
  { name: 'queue', description: 'Show music queue' },
  { name: 'nowplaying', description: 'Show current song' },
  { name: 'volume', description: 'Set volume', options: [
    { name: 'level', type: 4, description: 'Volume level (0-100)', required: true }
  ]},
  { name: 'shuffle', description: 'Shuffle queue' },
  { name: 'loop', description: 'Loop current song or queue', options: [
    { name: 'mode', type: 3, description: 'Loop mode (song/queue/off)', required: true,
      choices: [
        { name: 'Song', value: 'song' },
        { name: 'Queue', value: 'queue' },
        { name: 'Off', value: 'off' }
      ]
    }
  ]},

  // === TICKET & VERIFICATION (2) ===
  { name: 'ticket', description: 'Ticket system management',
    options: [
      { name: 'setup', type: 1, description: 'Setup ticket system', options: [
        { name: 'category', type: 7, description: 'Category for tickets', required: true }
      ]},
      { name: 'close', type: 1, description: 'Close current ticket' },
      { name: 'add', type: 1, description: 'Add user to ticket', options: [
        { name: 'user', type: 6, description: 'User to add', required: true }
      ]},
      { name: 'remove', type: 1, description: 'Remove user from ticket', options: [
        { name: 'user', type: 6, description: 'User to remove', required: true }
      ]}
    ]
  },
  { name: 'verify', description: 'Setup verification system' },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log(`🚀 Started registering ${commands.length} application (/) commands...`);

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || '1358527215020544222'),
      { body: commands },
    );

    console.log(`✅ Successfully registered ${commands.length} commands!`);
    console.log('\n📋 Command Categories:');
    console.log('  🛡️  Moderation: 15 commands');
    console.log('  🔧 Utility: 15 commands');
    console.log('  🎮 Fun: 10 commands');
    console.log('  👑 Admin: 10 commands');
    console.log('  🎵 Music: 10 commands');
    console.log('  🎫 Tickets & Verification: 2 commands');
    console.log('\n✨ All 62 commands are now available in Discord!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();
