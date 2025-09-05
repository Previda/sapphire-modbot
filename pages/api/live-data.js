export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const serverId = req.query.serverId || "1340417327518191697"
  
  try {
    // Try to fetch real data from bot API
    const botApiUrl = process.env.PI_BOT_API_URL
    const botToken = process.env.PI_BOT_TOKEN
    
    if (botApiUrl && botToken) {
      try {
        const response = await fetch(`${botApiUrl}/stats/${serverId}`, {
          headers: {
            'Authorization': `Bearer ${botToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const botData = await response.json()
          return res.status(200).json(botData)
        }
      } catch (error) {
        console.error('Bot API error:', error)
      }
    }
    
    // Fallback to real-looking dynamic data
    const data = {
      serverId,
      lastUpdated: new Date().toISOString(),
      stats: {
        memberCount: 0,
        onlineMembers: 0,
        botUptime: Math.floor((Date.now() - 1640995200000) / 1000),
        commandsToday: 0,
        serverHealth: 0,
        messagesPerHour: 0,
        activeChannels: 0
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
        recentActions: [],
        automodStats: {
          messagesScanned: 0,
          actionsToday: 0,
          blockedSpam: 0,
          filteredWords: 0,
          autoTimeouts: 0
        }
      },
      tickets: {
        active: [],
        totalToday: 0,
        resolvedToday: 0,
        avgResponseTime: 0
      },
      logs: {
        recent: [],
        totalToday: 0,
        errorCount: 0,
        warningCount: 0
      },
      analytics: {
        messageActivity: [],
        topCommands: [],
        memberGrowth: {
          daily: 0,
          weekly: 0,
          monthly: 0
        }
      },
      commands: [],
      responseTime: 'N/A',
      uptime: 'N/A',
      memoryUsage: 'N/A',
      error: 'No bot data available - bot may be offline or not connected to this server'
    }
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
