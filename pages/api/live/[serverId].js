export default async function handler(req, res) {
  const { serverId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' })
  }

  try {
    // Try to get data from Pi bot API first
    const piApiUrl = process.env.PI_BOT_API_URL || process.env.NEXT_PUBLIC_PI_API_URL
    const piToken = process.env.PI_BOT_TOKEN || process.env.NEXT_PUBLIC_PI_TOKEN
    
    if (piApiUrl && piToken) {
      try {
        console.log(`Connecting to Pi bot API: ${piApiUrl}`)
        
        const piResponse = await fetch(`${piApiUrl}/api/live/${serverId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${piToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Skyfall-Dashboard/1.0'
          },
          timeout: 10000
        })
        
        if (piResponse.ok) {
          const piData = await piResponse.json()
          console.log('Successfully fetched data from Pi bot API')
          return res.status(200).json({
            ...piData,
            serverId,
            lastUpdated: new Date().toISOString(),
            source: 'pi-bot-api'
          })
        } else {
          console.log(`Pi bot API responded with status: ${piResponse.status}`)
        }
      } catch (piError) {
        console.error('Pi bot API connection failed:', piError.message)
      }
    } else {
      console.log('Pi bot API credentials not configured')
    }

    // Fallback to mock data when Pi bot is not available
    console.log('Using fallback mock data')
    const mockData = {
      serverId,
      lastUpdated: new Date().toISOString(),
      source: 'fallback-mock-data',
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
          messages: Math.floor(Math.random() * 100) + 20,
          commands: Math.floor(Math.random() * 20) + 1
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
        { name: 'kick', category: 'Moderation', enabled: true, usage: 3, cooldown: 3 }
      ]
    }

    res.status(200).json(mockData)

  } catch (error) {
    console.error('Live data fetch error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch live data',
      details: error.message,
      serverId
    })
  }
}
