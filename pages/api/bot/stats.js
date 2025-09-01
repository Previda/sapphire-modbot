// API endpoint for live bot statistics
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { serverId } = req.query
    
    if (!serverId) {
      return res.status(400).json({ error: 'Server ID required' })
    }

    // Mock live bot statistics (replace with actual bot database queries)
    const stats = {
      serverId,
      memberCount: Math.floor(Math.random() * 1000) + 100,
      commandsUsed: Math.floor(Math.random() * 500) + 50,
      songsPlayed: Math.floor(Math.random() * 300) + 20,
      uptime: '7d 12h 45m',
      botStatus: 'online',
      lastActivity: new Date().toISOString(),
      musicQueue: {
        currentSong: Math.random() > 0.5 ? {
          title: 'Skyfall',
          artist: 'Adele', 
          duration: '4:46',
          position: '2:15'
        } : null,
        queueLength: Math.floor(Math.random() * 10),
        isPlaying: Math.random() > 0.5
      },
      moderation: {
        totalBans: Math.floor(Math.random() * 20),
        totalKicks: Math.floor(Math.random() * 50),
        activeWarnings: Math.floor(Math.random() * 15),
        pendingAppeals: Math.floor(Math.random() * 8)
      }
    }

    res.status(200).json(stats)

  } catch (error) {
    console.error('Bot stats API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
