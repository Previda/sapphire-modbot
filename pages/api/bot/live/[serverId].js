// Live bot data API for real-time server statistics
export default async function handler(req, res) {
  const { serverId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' })
  }

  try {
    // Connect to your Pi bot API for live data
    const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://localhost:3001'
    
    try {
      const response = await fetch(`${PI_BOT_URL}/api/server/${serverId}/live`, {
        timeout: 3000,
        headers: {
          'Authorization': `Bearer ${process.env.PI_BOT_TOKEN || 'dev-token'}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const liveData = await response.json()
        return res.status(200).json(liveData)
      }
    } catch (piError) {
      console.log('Pi bot unavailable, using mock data:', piError.message)
    }

    // Mock live data for development (replace when Pi is connected)
    const mockLiveData = {
      serverId,
      timestamp: new Date().toISOString(),
      memberCount: Math.floor(Math.random() * 1000) + 200,
      onlineMembers: Math.floor(Math.random() * 200) + 50,
      commandsToday: Math.floor(Math.random() * 100) + 10,
      songsPlayed: Math.floor(Math.random() * 50) + 5,
      songsToday: Math.floor(Math.random() * 20) + 2,
      botStatus: 'online',
      uptime: '7d 12h 45m',
      responseTime: Math.floor(Math.random() * 50) + 20 + 'ms',
      memoryUsage: Math.floor(Math.random() * 100) + 200 + 'MB',
      currentSong: Math.random() > 0.6 ? {
        title: ['Skyfall', 'Bohemian Rhapsody', 'Imagine Dragons - Believer', 'The Weeknd - Blinding Lights'][Math.floor(Math.random() * 4)],
        artist: ['Adele', 'Queen', 'Imagine Dragons', 'The Weeknd'][Math.floor(Math.random() * 4)],
        duration: '4:46',
        position: Math.floor(Math.random() * 180) + 30 + 's'
      } : null,
      isPlaying: Math.random() > 0.4,
      queueLength: Math.floor(Math.random() * 8),
      queue: [
        'Rick Astley - Never Gonna Give You Up',
        'Daft Punk - Get Lucky',
        'Ed Sheeran - Shape of You'
      ].slice(0, Math.floor(Math.random() * 3)),
      volume: Math.floor(Math.random() * 30) + 70,
      recentActivity: [
        {
          type: 'music',
          message: 'Started playing music',
          time: Math.floor(Math.random() * 10) + 1 + ' minutes ago',
          user: 'User#' + Math.floor(Math.random() * 9999)
        },
        {
          type: 'command',
          message: 'Used moderation command',
          time: Math.floor(Math.random() * 30) + 10 + ' minutes ago',
          user: 'Admin#' + Math.floor(Math.random() * 9999)
        },
        {
          type: 'join',
          message: 'New member joined',
          time: Math.floor(Math.random() * 60) + 30 + ' minutes ago',
          user: 'NewUser#' + Math.floor(Math.random() * 9999)
        }
      ],
      moderationActions: [
        {
          action: 'Warn',
          user: 'Troublemaker#' + Math.floor(Math.random() * 9999),
          reason: 'Inappropriate language',
          moderator: 'Mod#' + Math.floor(Math.random() * 9999),
          time: Math.floor(Math.random() * 60) + ' minutes ago'
        }
      ]
    }

    res.status(200).json(mockLiveData)

  } catch (error) {
    console.error('Live data API error:', error)
    res.status(500).json({ error: 'Failed to fetch live data' })
  }
}
