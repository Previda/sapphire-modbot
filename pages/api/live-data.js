export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const serverId = req.query.serverId || "1340417327518191697"

  const data = {
    serverId,
    lastUpdated: new Date().toISOString(),
    stats: {
      memberCount: 1543,
      onlineMembers: 327,
      botUptime: Math.floor((Date.now() - 1640995200000) / 1000),
      commandsToday: 156,
      serverHealth: 98,
      messagesPerHour: 45,
      activeChannels: 8
    },
    music: {
      isPlaying: false,
      currentSong: null,
      queue: [],
      volume: 75,
      repeat: 'off',
      shuffle: false
    },
    moderation: {
      recentActions: [
        {
          id: '1',
          action: 'timeout',
          user: 'TestUser#1234',
          moderator: 'ModeratorBot#0001',
          reason: 'Spam messages in chat',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          action: 'warn',
          user: 'AnotherUser#5678',
          moderator: 'ModeratorBot#0001',
          reason: 'Inappropriate language',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ],
      automodStats: {
        messagesScanned: 2340,
        actionsToday: 12,
        blockedSpam: 8,
        filteredWords: 4,
        autoTimeouts: 2
      }
    },
    tickets: {
      active: [],
      totalToday: 3,
      resolvedToday: 2,
      avgResponseTime: 1200
    },
    logs: {
      recent: [
        {
          id: '1',
          type: 'command',
          user: 'TestUser#1234',
          action: 'Used /play command',
          details: 'Song: Rick Astley - Never Gonna Give You Up',
          timestamp: new Date().toISOString(),
          channel: 'music'
        }
      ],
      totalToday: 156,
      errorCount: 2,
      warningCount: 5
    },
    analytics: {
      messageActivity: Array.from({length: 24}, (_, i) => ({
        hour: i,
        messages: Math.floor(Math.random() * 100) + 20,
        commands: Math.floor(Math.random() * 20) + 1
      })),
      topCommands: [
        { name: 'play', usage: 45 },
        { name: 'skip', usage: 23 },
        { name: 'queue', usage: 18 },
        { name: 'ping', usage: 24 },
        { name: 'help', usage: 16 }
      ],
      memberGrowth: {
        daily: 5,
        weekly: 28,
        monthly: 134
      }
    },
    commands: [
      { name: 'play', category: 'Music', enabled: true, usage: 45, cooldown: 3, description: 'Play music from YouTube, Spotify, or SoundCloud' },
      { name: 'skip', category: 'Music', enabled: true, usage: 23, cooldown: 2, description: 'Skip the current song' },
      { name: 'stop', category: 'Music', enabled: true, usage: 8, cooldown: 2, description: 'Stop music and clear queue' },
      { name: 'queue', category: 'Music', enabled: true, usage: 18, cooldown: 1, description: 'Show current music queue' },
      { name: 'volume', category: 'Music', enabled: true, usage: 12, cooldown: 1, description: 'Set music volume' },
      { name: 'ban', category: 'Moderation', enabled: true, usage: 2, cooldown: 5, description: 'Ban a member from the server' },
      { name: 'kick', category: 'Moderation', enabled: true, usage: 3, cooldown: 3, description: 'Kick a member from the server' },
      { name: 'warn', category: 'Moderation', enabled: true, usage: 7, cooldown: 1, description: 'Warn a member' },
      { name: 'timeout', category: 'Moderation', enabled: true, usage: 4, cooldown: 3, description: 'Timeout a member' },
      { name: 'ticket', category: 'Tickets', enabled: true, usage: 8, cooldown: 5, description: 'Manage support tickets' },
      { name: 'ping', category: 'Utility', enabled: true, usage: 24, cooldown: 1, description: 'Check bot latency' },
      { name: 'help', category: 'Utility', enabled: true, usage: 16, cooldown: 2, description: 'Show command list' }
    ],
    responseTime: '42ms',
    uptime: '99.8%',
    memoryUsage: '287MB'
  }
  
  return res.status(200).json(data)
}
