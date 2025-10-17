export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch from Pi bot API
    const response = await fetch(`${process.env.PI_BOT_API_URL}/api/commands`, {
      headers: {
        'Authorization': `Bearer ${process.env.PI_BOT_API_KEY || 'default-key'}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        success: true,
        commands: data.commands || [],
        total: (data.commands || []).length
      });
    } else {
      // Fallback demo data
      return res.status(200).json({
        success: true,
        commands: generateDemoCommands(),
        total: 62,
        demo: true
      });
    }
  } catch (error) {
    console.error('Failed to fetch commands:', error);
    // Return demo data on error
    return res.status(200).json({
      success: true,
      commands: generateDemoCommands(),
      total: 62,
      demo: true
    });
  }
}

function generateDemoCommands() {
  return [
    // Moderation
    { id: '1', name: 'ban', category: 'Moderation', description: 'Ban a user from the server', usage: 'ban @user [reason]', enabled: true, usageCount: 45, cooldown: 3, permissions: ['BAN_MEMBERS'], successRate: 98 },
    { id: '2', name: 'kick', category: 'Moderation', description: 'Kick a user from the server', usage: 'kick @user [reason]', enabled: true, usageCount: 67, cooldown: 3, permissions: ['KICK_MEMBERS'], successRate: 99 },
    { id: '3', name: 'mute', category: 'Moderation', description: 'Mute a user', usage: 'mute @user [duration] [reason]', enabled: true, usageCount: 123, cooldown: 2, permissions: ['MODERATE_MEMBERS'], successRate: 97 },
    { id: '4', name: 'unmute', category: 'Moderation', description: 'Unmute a user', usage: 'unmute @user', enabled: true, usageCount: 89, cooldown: 2, permissions: ['MODERATE_MEMBERS'], successRate: 100 },
    { id: '5', name: 'warn', category: 'Moderation', description: 'Warn a user', usage: 'warn @user [reason]', enabled: true, usageCount: 234, cooldown: 1, permissions: ['MODERATE_MEMBERS'], successRate: 100 },
    { id: '6', name: 'warnings', category: 'Moderation', description: 'View user warnings', usage: 'warnings @user', enabled: true, usageCount: 156, cooldown: 2, permissions: ['MODERATE_MEMBERS'], successRate: 100 },
    { id: '7', name: 'clearwarnings', category: 'Moderation', description: 'Clear user warnings', usage: 'clearwarnings @user', enabled: true, usageCount: 34, cooldown: 3, permissions: ['ADMINISTRATOR'], successRate: 100 },
    { id: '8', name: 'timeout', category: 'Moderation', description: 'Timeout a user', usage: 'timeout @user [duration] [reason]', enabled: true, usageCount: 178, cooldown: 2, permissions: ['MODERATE_MEMBERS'], successRate: 99 },
    { id: '9', name: 'purge', category: 'Moderation', description: 'Delete multiple messages', usage: 'purge [amount]', enabled: true, usageCount: 456, cooldown: 5, permissions: ['MANAGE_MESSAGES'], successRate: 95 },
    { id: '10', name: 'slowmode', category: 'Moderation', description: 'Set channel slowmode', usage: 'slowmode [seconds]', enabled: true, usageCount: 67, cooldown: 3, permissions: ['MANAGE_CHANNELS'], successRate: 100 },
    
    // Utility
    { id: '11', name: 'ping', category: 'Utility', description: 'Check bot latency', usage: 'ping', enabled: true, usageCount: 1234, cooldown: 1, permissions: [], successRate: 100 },
    { id: '12', name: 'help', category: 'Utility', description: 'Show help menu', usage: 'help [command]', enabled: true, usageCount: 890, cooldown: 2, permissions: [], successRate: 100 },
    { id: '13', name: 'serverinfo', category: 'Utility', description: 'Show server information', usage: 'serverinfo', enabled: true, usageCount: 345, cooldown: 3, permissions: [], successRate: 100 },
    { id: '14', name: 'userinfo', category: 'Utility', description: 'Show user information', usage: 'userinfo [@user]', enabled: true, usageCount: 567, cooldown: 2, permissions: [], successRate: 100 },
    { id: '15', name: 'avatar', category: 'Utility', description: 'Get user avatar', usage: 'avatar [@user]', enabled: true, usageCount: 234, cooldown: 1, permissions: [], successRate: 100 },
    { id: '16', name: 'poll', category: 'Utility', description: 'Create a poll', usage: 'poll [question]', enabled: true, usageCount: 123, cooldown: 5, permissions: [], successRate: 98 },
    { id: '17', name: 'remind', category: 'Utility', description: 'Set a reminder', usage: 'remind [time] [message]', enabled: true, usageCount: 89, cooldown: 2, permissions: [], successRate: 97 },
    { id: '18', name: 'calculate', category: 'Utility', description: 'Calculate math expressions', usage: 'calculate [expression]', enabled: true, usageCount: 156, cooldown: 1, permissions: [], successRate: 99 },
    
    // Fun
    { id: '19', name: '8ball', category: 'Fun', description: 'Ask the magic 8ball', usage: '8ball [question]', enabled: true, usageCount: 456, cooldown: 2, permissions: [], successRate: 100 },
    { id: '20', name: 'meme', category: 'Fun', description: 'Get a random meme', usage: 'meme', enabled: true, usageCount: 789, cooldown: 3, permissions: [], successRate: 95 },
    { id: '21', name: 'joke', category: 'Fun', description: 'Get a random joke', usage: 'joke', enabled: true, usageCount: 567, cooldown: 2, permissions: [], successRate: 98 },
    { id: '22', name: 'coinflip', category: 'Fun', description: 'Flip a coin', usage: 'coinflip', enabled: true, usageCount: 234, cooldown: 1, permissions: [], successRate: 100 },
    { id: '23', name: 'roll', category: 'Fun', description: 'Roll dice', usage: 'roll [sides]', enabled: true, usageCount: 345, cooldown: 1, permissions: [], successRate: 100 },
    
    // Music
    { id: '24', name: 'play', category: 'Music', description: 'Play a song', usage: 'play [song]', enabled: true, usageCount: 1567, cooldown: 2, permissions: [], successRate: 92 },
    { id: '25', name: 'pause', category: 'Music', description: 'Pause current song', usage: 'pause', enabled: true, usageCount: 456, cooldown: 1, permissions: [], successRate: 100 },
    { id: '26', name: 'resume', category: 'Music', description: 'Resume playback', usage: 'resume', enabled: true, usageCount: 389, cooldown: 1, permissions: [], successRate: 100 },
    { id: '27', name: 'skip', category: 'Music', description: 'Skip current song', usage: 'skip', enabled: true, usageCount: 678, cooldown: 1, permissions: [], successRate: 100 },
    { id: '28', name: 'stop', category: 'Music', description: 'Stop playback', usage: 'stop', enabled: true, usageCount: 234, cooldown: 1, permissions: [], successRate: 100 },
    { id: '29', name: 'queue', category: 'Music', description: 'Show music queue', usage: 'queue', enabled: true, usageCount: 567, cooldown: 2, permissions: [], successRate: 100 },
    { id: '30', name: 'nowplaying', category: 'Music', description: 'Show current song', usage: 'nowplaying', enabled: true, usageCount: 789, cooldown: 1, permissions: [], successRate: 100 },
    { id: '31', name: 'volume', category: 'Music', description: 'Set volume', usage: 'volume [0-100]', enabled: true, usageCount: 345, cooldown: 1, permissions: [], successRate: 100 },
    { id: '32', name: 'loop', category: 'Music', description: 'Toggle loop', usage: 'loop', enabled: true, usageCount: 234, cooldown: 1, permissions: [], successRate: 100 },
    { id: '33', name: 'shuffle', category: 'Music', description: 'Shuffle queue', usage: 'shuffle', enabled: true, usageCount: 123, cooldown: 2, permissions: [], successRate: 100 },
    
    // Admin
    { id: '34', name: 'setup', category: 'Admin', description: 'Setup bot features', usage: 'setup', enabled: true, usageCount: 45, cooldown: 5, permissions: ['ADMINISTRATOR'], successRate: 100 },
    { id: '35', name: 'config', category: 'Admin', description: 'Configure bot settings', usage: 'config', enabled: true, usageCount: 67, cooldown: 3, permissions: ['ADMINISTRATOR'], successRate: 100 },
    { id: '36', name: 'autorole', category: 'Admin', description: 'Setup auto roles', usage: 'autorole', enabled: true, usageCount: 34, cooldown: 3, permissions: ['ADMINISTRATOR'], successRate: 100 },
    { id: '37', name: 'welcome', category: 'Admin', description: 'Setup welcome messages', usage: 'welcome', enabled: true, usageCount: 56, cooldown: 3, permissions: ['ADMINISTRATOR'], successRate: 100 },
    { id: '38', name: 'goodbye', category: 'Admin', description: 'Setup goodbye messages', usage: 'goodbye', enabled: true, usageCount: 23, cooldown: 3, permissions: ['ADMINISTRATOR'], successRate: 100 },
    { id: '39', name: 'logs', category: 'Admin', description: 'Setup logging', usage: 'logs', enabled: true, usageCount: 78, cooldown: 3, permissions: ['ADMINISTRATOR'], successRate: 100 },
    
    // Verification
    { id: '40', name: 'verification', category: 'Verification', description: 'Setup verification system', usage: 'verification', enabled: true, usageCount: 89, cooldown: 5, permissions: ['ADMINISTRATOR'], successRate: 100 },
    { id: '41', name: 'verify', category: 'Verification', description: 'Verify yourself', usage: 'verify', enabled: true, usageCount: 2345, cooldown: 60, permissions: [], successRate: 98 },
    { id: '42', name: 'unverify', category: 'Verification', description: 'Remove verification', usage: 'unverify @user', enabled: true, usageCount: 12, cooldown: 3, permissions: ['MODERATE_MEMBERS'], successRate: 100 },
    
    // Tickets
    { id: '43', name: 'ticket', category: 'Tickets', description: 'Create a support ticket', usage: 'ticket [reason]', enabled: true, usageCount: 456, cooldown: 30, permissions: [], successRate: 99 },
    { id: '44', name: 'close', category: 'Tickets', description: 'Close current ticket', usage: 'close [reason]', enabled: true, usageCount: 389, cooldown: 2, permissions: [], successRate: 100 },
    { id: '45', name: 'add', category: 'Tickets', description: 'Add user to ticket', usage: 'add @user', enabled: true, usageCount: 123, cooldown: 2, permissions: ['MODERATE_MEMBERS'], successRate: 100 },
    { id: '46', name: 'remove', category: 'Tickets', description: 'Remove user from ticket', usage: 'remove @user', enabled: true, usageCount: 67, cooldown: 2, permissions: ['MODERATE_MEMBERS'], successRate: 100 },
    
    // Appeals
    { id: '47', name: 'appeal', category: 'Appeals', description: 'Submit a ban appeal', usage: 'appeal', enabled: true, usageCount: 234, cooldown: 3600, permissions: [], successRate: 97 },
    { id: '48', name: 'appeals', category: 'Appeals', description: 'View pending appeals', usage: 'appeals', enabled: true, usageCount: 89, cooldown: 5, permissions: ['MODERATE_MEMBERS'], successRate: 100 },
    { id: '49', name: 'acceptappeal', category: 'Appeals', description: 'Accept an appeal', usage: 'acceptappeal [id]', enabled: true, usageCount: 45, cooldown: 3, permissions: ['ADMINISTRATOR'], successRate: 100 },
    { id: '50', name: 'denyappeal', category: 'Appeals', description: 'Deny an appeal', usage: 'denyappeal [id]', enabled: true, usageCount: 67, cooldown: 3, permissions: ['ADMINISTRATOR'], successRate: 100 },
    
    // Info
    { id: '51', name: 'botinfo', category: 'Info', description: 'Show bot information', usage: 'botinfo', enabled: true, usageCount: 345, cooldown: 3, permissions: [], successRate: 100 },
    { id: '52', name: 'invite', category: 'Info', description: 'Get bot invite link', usage: 'invite', enabled: true, usageCount: 567, cooldown: 2, permissions: [], successRate: 100 },
    { id: '53', name: 'support', category: 'Info', description: 'Get support server link', usage: 'support', enabled: true, usageCount: 234, cooldown: 2, permissions: [], successRate: 100 },
    { id: '54', name: 'stats', category: 'Info', description: 'Show bot statistics', usage: 'stats', enabled: true, usageCount: 456, cooldown: 3, permissions: [], successRate: 100 },
    { id: '55', name: 'uptime', category: 'Info', description: 'Show bot uptime', usage: 'uptime', enabled: true, usageCount: 123, cooldown: 2, permissions: [], successRate: 100 },
    
    // Additional commands
    { id: '56', name: 'roleinfo', category: 'Info', description: 'Show role information', usage: 'roleinfo @role', enabled: true, usageCount: 89, cooldown: 2, permissions: [], successRate: 100 },
    { id: '57', name: 'channelinfo', category: 'Info', description: 'Show channel information', usage: 'channelinfo [#channel]', enabled: true, usageCount: 67, cooldown: 2, permissions: [], successRate: 100 },
    { id: '58', name: 'emojis', category: 'Info', description: 'List server emojis', usage: 'emojis', enabled: true, usageCount: 234, cooldown: 3, permissions: [], successRate: 100 },
    { id: '59', name: 'roles', category: 'Info', description: 'List server roles', usage: 'roles', enabled: true, usageCount: 156, cooldown: 3, permissions: [], successRate: 100 },
    { id: '60', name: 'members', category: 'Info', description: 'Show member count', usage: 'members', enabled: true, usageCount: 345, cooldown: 2, permissions: [], successRate: 100 },
    { id: '61', name: 'boosters', category: 'Info', description: 'List server boosters', usage: 'boosters', enabled: true, usageCount: 78, cooldown: 3, permissions: [], successRate: 100 },
    { id: '62', name: 'permissions', category: 'Info', description: 'Check user permissions', usage: 'permissions [@user]', enabled: true, usageCount: 123, cooldown: 2, permissions: [], successRate: 100 }
  ];
}
