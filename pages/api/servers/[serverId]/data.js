// Server-Specific Data API - Get data for a specific server
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { serverId } = req.query;

  if (!serverId) {
    return res.status(400).json({
      success: false,
      error: 'Server ID is required'
    });
  }

  try {
    const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001';
    
    // Try to get real server-specific data from Pi bot
    try {
      const [commandsRes, logsRes, appealsRes] = await Promise.all([
        fetch(`${PI_BOT_URL}/api/commands/manage?serverId=${serverId}`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Skyfall-Dashboard/1.0'
          },
          signal: AbortSignal.timeout(5000)
        }).catch(() => null),
        
        fetch(`${PI_BOT_URL}/api/logs?serverId=${serverId}`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Skyfall-Dashboard/1.0'
          },
          signal: AbortSignal.timeout(5000)
        }).catch(() => null),
        
        fetch(`${PI_BOT_URL}/api/appeals?serverId=${serverId}`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Skyfall-Dashboard/1.0'
          },
          signal: AbortSignal.timeout(5000)
        }).catch(() => null)
      ]);

      if (commandsRes?.ok || logsRes?.ok || appealsRes?.ok) {
        const data = {
          commands: commandsRes?.ok ? (await commandsRes.json()).commands : [],
          logs: logsRes?.ok ? (await logsRes.json()).logs : [],
          appeals: appealsRes?.ok ? (await appealsRes.json()).appeals : []
        };

        return res.status(200).json({
          success: true,
          serverId,
          data,
          source: 'pi_bot'
        });
      }
    } catch (error) {
      console.log(`⚠️ Pi bot unavailable for server ${serverId}, using fallback data`);
    }

    // Generate server-specific fallback data
    const serverSpecificData = generateServerData(serverId);

    return res.status(200).json({
      success: true,
      serverId,
      data: serverSpecificData,
      source: 'fallback',
      message: 'Using demo data - connect Pi bot for real server data'
    });

  } catch (error) {
    console.error(`Server data error for ${serverId}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch server data',
      message: error.message
    });
  }
}

function generateServerData(serverId) {
  // Generate different data based on server ID for variety
  const serverIndex = parseInt(serverId.slice(-1)) || 0;
  
  const commandSets = [
    // Skyfall Community (full feature set)
    [
      { id: 'ban', name: 'ban', description: 'Ban a user from the server', category: 'moderation', enabled: true, usageCount: 45, cooldown: 5 },
      { id: 'kick', name: 'kick', description: 'Kick a user from the server', category: 'moderation', enabled: true, usageCount: 78, cooldown: 3 },
      { id: 'mute', name: 'mute', description: 'Mute a user in the server', category: 'moderation', enabled: true, usageCount: 156, cooldown: 2 },
      { id: 'warn', name: 'warn', description: 'Warn a user for rule violations', category: 'moderation', enabled: true, usageCount: 234, cooldown: 1 },
      { id: 'purge', name: 'purge', description: 'Delete multiple messages at once', category: 'moderation', enabled: true, usageCount: 89, cooldown: 10 },
      { id: 'ping', name: 'ping', description: 'Check bot latency and status', category: 'utility', enabled: true, usageCount: 567, cooldown: 0 },
      { id: 'serverinfo', name: 'serverinfo', description: 'Display server information', category: 'utility', enabled: true, usageCount: 123, cooldown: 5 },
      { id: 'userinfo', name: 'userinfo', description: 'Display user information', category: 'utility', enabled: true, usageCount: 345, cooldown: 3 }
    ],
    // Gaming Hub (gaming focused)
    [
      { id: 'ban', name: 'ban', description: 'Ban a user from the server', category: 'moderation', enabled: true, usageCount: 23, cooldown: 5 },
      { id: 'kick', name: 'kick', description: 'Kick a user from the server', category: 'moderation', enabled: true, usageCount: 34, cooldown: 3 },
      { id: 'mute', name: 'mute', description: 'Mute a user in voice channels', category: 'moderation', enabled: true, usageCount: 67, cooldown: 2 },
      { id: 'ping', name: 'ping', description: 'Check bot and game server latency', category: 'utility', enabled: true, usageCount: 456, cooldown: 0 },
      { id: 'game', name: 'game', description: 'Set or check current game status', category: 'gaming', enabled: true, usageCount: 234, cooldown: 5 },
      { id: 'tournament', name: 'tournament', description: 'Manage gaming tournaments', category: 'gaming', enabled: false, usageCount: 12, cooldown: 60 }
    ],
    // Developer Workspace (dev tools)
    [
      { id: 'ban', name: 'ban', description: 'Ban a user from the workspace', category: 'moderation', enabled: true, usageCount: 5, cooldown: 5 },
      { id: 'mute', name: 'mute', description: 'Mute a user temporarily', category: 'moderation', enabled: true, usageCount: 12, cooldown: 2 },
      { id: 'ping', name: 'ping', description: 'Check API response times', category: 'utility', enabled: true, usageCount: 789, cooldown: 0 },
      { id: 'deploy', name: 'deploy', description: 'Trigger deployment notifications', category: 'development', enabled: true, usageCount: 67, cooldown: 30 },
      { id: 'code', name: 'code', description: 'Format and share code snippets', category: 'development', enabled: true, usageCount: 234, cooldown: 5 },
      { id: 'docs', name: 'docs', description: 'Search documentation', category: 'development', enabled: true, usageCount: 156, cooldown: 3 }
    ]
  ];

  const logSets = [
    // High activity server
    [
      { id: 1, action: 'User banned', user: 'Moderator#1234', details: 'Banned @Spammer#5678 for spam', type: 'moderation', timestamp: new Date(Date.now() - 300000).toISOString(), guild: 'Skyfall Community' },
      { id: 2, action: 'Command executed', user: 'User#9876', details: 'Used /ping command', type: 'command', timestamp: new Date(Date.now() - 600000).toISOString(), guild: 'Skyfall Community' },
      { id: 3, action: 'Messages purged', user: 'Admin#4321', details: 'Purged 25 messages in #general', type: 'moderation', timestamp: new Date(Date.now() - 900000).toISOString(), guild: 'Skyfall Community' },
      { id: 4, action: 'User warned', user: 'Moderator#1234', details: 'Warned @NewUser#1111 for inappropriate language', type: 'moderation', timestamp: new Date(Date.now() - 1200000).toISOString(), guild: 'Skyfall Community' },
      { id: 5, action: 'Bot restarted', user: 'System', details: 'Bot successfully restarted and reconnected', type: 'system', timestamp: new Date(Date.now() - 1800000).toISOString(), guild: 'Skyfall Community' }
    ],
    // Medium activity server
    [
      { id: 1, action: 'Tournament created', user: 'GameMaster#2468', details: 'Created Valorant tournament for next week', type: 'gaming', timestamp: new Date(Date.now() - 1800000).toISOString(), guild: 'Gaming Hub' },
      { id: 2, action: 'User muted', user: 'Moderator#3579', details: 'Muted @Toxic#9999 in voice channel', type: 'moderation', timestamp: new Date(Date.now() - 3600000).toISOString(), guild: 'Gaming Hub' },
      { id: 3, action: 'Game status updated', user: 'Bot', details: 'Updated server game status to Apex Legends', type: 'gaming', timestamp: new Date(Date.now() - 7200000).toISOString(), guild: 'Gaming Hub' }
    ],
    // Low activity server
    [
      { id: 1, action: 'Code review', user: 'Developer#1357', details: 'Shared code snippet for review', type: 'development', timestamp: new Date(Date.now() - 3600000).toISOString(), guild: 'Developer Workspace' },
      { id: 2, action: 'Deployment notification', user: 'CI/CD Bot', details: 'Production deployment completed successfully', type: 'development', timestamp: new Date(Date.now() - 7200000).toISOString(), guild: 'Developer Workspace' }
    ]
  ];

  const appealSets = [
    // Active appeals
    [
      { id: 1, username: 'ApologeticUser#1234', banReason: 'Spam in multiple channels', appealMessage: 'I apologize for my behavior. I was having a bad day and took it out inappropriately. I understand the rules now and promise to follow them.', status: 'pending', submittedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, username: 'ReformedTroll#5678', banReason: 'Harassment of other members', appealMessage: 'I realize my actions were wrong and hurtful. I have taken time to reflect and would like a second chance to be a positive member of the community.', status: 'pending', submittedAt: new Date(Date.now() - 172800000).toISOString() }
    ],
    // Few appeals
    [
      { id: 1, username: 'GamerGone#9999', banReason: 'Cheating accusations without proof', appealMessage: 'I was wrongly accused of cheating. I can provide evidence that I was playing legitimately.', status: 'approved', submittedAt: new Date(Date.now() - 259200000).toISOString() }
    ],
    // No appeals
    []
  ];

  const dataIndex = Math.min(serverIndex, commandSets.length - 1);

  return {
    commands: commandSets[dataIndex] || commandSets[0],
    logs: logSets[dataIndex] || logSets[0],
    appeals: appealSets[dataIndex] || appealSets[0]
  };
}
