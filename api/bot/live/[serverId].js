export default function handler(req, res) {
  const { serverId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' })
  }

  // Return mock data immediately
  const mockData = {
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
          user: 'User123',
          moderator: 'Moderator456',
          reason: 'Spam messages',
          timestamp: new Date(Date.now() - 3600000).toISOString()
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
    analytics: {
      messageActivity: Array.from({length: 24}, (_, i) => ({
        hour: i,
        messages: Math.floor(Math.random() * 100),
        commands: Math.floor(Math.random() * 20)
      })),
      topCommands: [
        { name: 'play', usage: 45 },
        { name: 'skip', usage: 23 },
        { name: 'queue', usage: 18 }
      ],
      memberGrowth: {
        daily: 5,
        weekly: 28,
        monthly: 134
      }
    },
    commands: [
      { name: 'play', category: 'Music', enabled: true, usage: 45, cooldown: 3 },
      { name: 'skip', category: 'Music', enabled: true, usage: 23, cooldown: 2 },
      { name: 'ban', category: 'Moderation', enabled: true, usage: 2, cooldown: 5 },
      { name: 'kick', category: 'Moderation', enabled: true, usage: 3, cooldown: 3 },
      { name: 'ping', category: 'Utility', enabled: true, usage: 24, cooldown: 1 }
    ]
  }
  
  return res.status(200).json(mockData)
}
