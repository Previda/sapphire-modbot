export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Try Pi bot API first, then fallback to mock data
  const piApiUrl = process.env.PI_BOT_API_URL || process.env.NEXT_PUBLIC_PI_API_URL
  const piToken = process.env.PI_BOT_TOKEN || process.env.NEXT_PUBLIC_PI_TOKEN
  const serverId = "1340417327518191697"
  
  if (piApiUrl && piToken) {
    try {
      console.log(`Connecting to Pi bot API: ${piApiUrl}`)
      const piResponse = await fetch(`${piApiUrl}/api/live/${serverId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${piToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Sapphire-Dashboard/1.0'
        }
      })
      
      if (piResponse.ok) {
        const piData = await piResponse.json()
        return res.status(200).json({
          ...piData,
          serverId,
          lastUpdated: new Date().toISOString(),
          source: 'pi-bot-api'
        })
      }
    } catch (error) {
      console.error('Pi bot API failed:', error.message)
    }
  }

  // Fallback mock data
  const mockData = {
    serverId: "1340417327518191697",
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
      { name: 'play', category: 'Music', enabled: true, usage: 45, cooldown: 3, description: 'Play music' },
      { name: 'skip', category: 'Music', enabled: true, usage: 23, cooldown: 2, description: 'Skip song' },
      { name: 'ban', category: 'Moderation', enabled: true, usage: 2, cooldown: 5, description: 'Ban member' },
      { name: 'kick', category: 'Moderation', enabled: true, usage: 3, cooldown: 3, description: 'Kick member' },
      { name: 'ping', category: 'Utility', enabled: true, usage: 24, cooldown: 1, description: 'Check latency' }
    ]
  }
  
  return res.status(200).json(mockData)
}
