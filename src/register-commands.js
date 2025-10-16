const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'ping',
    description: 'Check bot latency and status',
  },
  {
    name: 'help',
    description: 'Display help menu with all commands',
  },
  {
    name: 'ban',
    description: 'Ban a user from the server',
    options: [
      {
        name: 'user',
        type: 6, // USER type
        description: 'The user to ban',
        required: true,
      },
      {
        name: 'reason',
        type: 3, // STRING type
        description: 'Reason for the ban',
        required: false,
      },
    ],
  },
  {
    name: 'kick',
    description: 'Kick a user from the server',
    options: [
      {
        name: 'user',
        type: 6,
        description: 'The user to kick',
        required: true,
      },
      {
        name: 'reason',
        type: 3,
        description: 'Reason for the kick',
        required: false,
      },
    ],
  },
  {
    name: 'mute',
    description: 'Mute a user in the server',
    options: [
      {
        name: 'user',
        type: 6,
        description: 'The user to mute',
        required: true,
      },
      {
        name: 'duration',
        type: 3,
        description: 'Duration (e.g., 10m, 1h, 1d)',
        required: false,
      },
    ],
  },
  {
    name: 'serverinfo',
    description: 'Display server information',
  },
  {
    name: 'userinfo',
    description: 'Display user information',
    options: [
      {
        name: 'user',
        type: 6,
        description: 'The user to get info about',
        required: false,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || '1358527215020544222'),
      { body: commands },
    );

    console.log('✅ Successfully reloaded application (/) commands.');
    console.log(`📝 Registered ${commands.length} commands`);
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();
