const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

client.once('ready', () => {
  console.log(`✅ ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
  // Set bot status
  client.user.setActivity('Skyfall Dashboard', { type: 'WATCHING' });
});

// Basic command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'ping':
        await interaction.reply({
          content: `🏓 Pong! Latency: ${Date.now() - interaction.createdTimestamp}ms`,
          ephemeral: true
        });
        break;
        
      case 'play':
        await interaction.reply({
          content: '🎵 Music command received! (Add your music logic here)',
          ephemeral: true
        });
        break;
        
      case 'help':
        await interaction.reply({
          content: '📖 **Skyfall Bot Commands:**\n' +
                   '🎵 `/play` - Play music\n' +
                   '🏓 `/ping` - Check latency\n' +
                   '🎮 `/8ball` - Magic 8-ball\n' +
                   '🔨 `/kick` - Kick member (Admin)\n' +
                   '🔨 `/ban` - Ban member (Admin)',
          ephemeral: true
        });
        break;
        
      case '8ball':
        const responses = [
          'Yes, definitely!', 'No way!', 'Maybe...', 'Ask again later',
          'Absolutely!', 'I doubt it', 'Very likely', 'Unclear, try again'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        await interaction.reply(`🎱 ${randomResponse}`);
        break;
        
      default:
        await interaction.reply({
          content: '❌ Command not implemented yet!',
          ephemeral: true
        });
    }
  } catch (error) {
    console.error('Command error:', error);
    await interaction.reply({
      content: '❌ Something went wrong!',
      ephemeral: true
    });
  }
});

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN);
