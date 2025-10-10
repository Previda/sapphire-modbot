export default async function handler(req, res) {
  const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3005';
  const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN;

  try {
    if (req.method === 'GET') {
      // Fetch commands from Pi bot or return mock data
      const mockCommands = [
        {
          id: 1,
          name: 'ban',
          description: 'Ban members from the server with optional reason and duration',
          category: 'moderation',
          enabled: true,
          usageCount: 45,
          permissions: ['BAN_MEMBERS'],
          cooldown: 3,
          examples: ['/ban @user spam', '/ban @user 7d harassment']
        },
        {
          id: 2,
          name: 'kick',
          description: 'Kick members from the server with optional reason',
          category: 'moderation',
          enabled: true,
          usageCount: 23,
          permissions: ['KICK_MEMBERS'],
          cooldown: 2,
          examples: ['/kick @user spam', '/kick @user inappropriate behavior']
        },
        {
          id: 3,
          name: 'mute',
          description: 'Mute members in the server with timeout duration',
          category: 'moderation',
          enabled: true,
          usageCount: 67,
          permissions: ['MODERATE_MEMBERS'],
          cooldown: 1,
          examples: ['/mute @user 10m spam', '/mute @user 1h inappropriate']
        },
        {
          id: 4,
          name: 'warn',
          description: 'Issue warnings to members for rule violations',
          category: 'moderation',
          enabled: false,
          usageCount: 12,
          permissions: ['MODERATE_MEMBERS'],
          cooldown: 1,
          examples: ['/warn @user spam warning', '/warn @user please follow rules']
        },
        {
          id: 5,
          name: 'play',
          description: 'Play music from YouTube, Spotify, or other sources',
          category: 'music',
          enabled: true,
          usageCount: 156,
          permissions: ['CONNECT', 'SPEAK'],
          cooldown: 2,
          examples: ['/play never gonna give you up', '/play https://youtube.com/watch?v=...']
        },
        {
          id: 6,
          name: 'skip',
          description: 'Skip the currently playing song',
          category: 'music',
          enabled: true,
          usageCount: 89,
          permissions: ['CONNECT'],
          cooldown: 1,
          examples: ['/skip', '/skip 3']
        },
        {
          id: 7,
          name: 'queue',
          description: 'Display the current music queue',
          category: 'music',
          enabled: true,
          usageCount: 134,
          permissions: [],
          cooldown: 2,
          examples: ['/queue', '/queue page 2']
        },
        {
          id: 8,
          name: 'help',
          description: 'Show available commands and their usage',
          category: 'utility',
          enabled: true,
          usageCount: 234,
          permissions: [],
          cooldown: 5,
          examples: ['/help', '/help moderation', '/help music']
        },
        {
          id: 9,
          name: 'ping',
          description: 'Check bot latency and connection status',
          category: 'utility',
          enabled: true,
          usageCount: 445,
          permissions: [],
          cooldown: 3,
          examples: ['/ping']
        },
        {
          id: 10,
          name: 'serverinfo',
          description: 'Display detailed information about the server',
          category: 'utility',
          enabled: true,
          usageCount: 78,
          permissions: [],
          cooldown: 10,
          examples: ['/serverinfo']
        },
        {
          id: 11,
          name: 'userinfo',
          description: 'Display information about a specific user',
          category: 'utility',
          enabled: true,
          usageCount: 123,
          permissions: [],
          cooldown: 5,
          examples: ['/userinfo @user', '/userinfo']
        },
        {
          id: 12,
          name: 'ticket',
          description: 'Create, manage, and close support tickets',
          category: 'tickets',
          enabled: true,
          usageCount: 67,
          permissions: ['MANAGE_CHANNELS'],
          cooldown: 30,
          examples: ['/ticket open I need help', '/ticket close', '/ticket add @user']
        },
        {
          id: 13,
          name: 'verification',
          description: 'Set up and manage server verification system',
          category: 'admin',
          enabled: true,
          usageCount: 5,
          permissions: ['ADMINISTRATOR'],
          cooldown: 60,
          examples: ['/verification setup', '/verification config']
        },
        {
          id: 14,
          name: 'automod',
          description: 'Configure automatic moderation settings',
          category: 'admin',
          enabled: true,
          usageCount: 8,
          permissions: ['ADMINISTRATOR'],
          cooldown: 30,
          examples: ['/automod enable', '/automod config spam']
        },
        {
          id: 15,
          name: 'backup',
          description: 'Create and restore server backups',
          category: 'admin',
          enabled: false,
          usageCount: 2,
          permissions: ['ADMINISTRATOR'],
          cooldown: 300,
          examples: ['/backup create', '/backup restore backup_id']
        }
      ];

      res.status(200).json({ 
        success: true, 
        commands: mockCommands,
        totalCommands: mockCommands.length,
        enabledCommands: mockCommands.filter(cmd => cmd.enabled).length
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Commands API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
