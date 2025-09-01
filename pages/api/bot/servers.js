// API endpoint to get bot server data and statistics
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { authorization } = req.headers
    
    if (!authorization) {
      return res.status(401).json({ error: 'No authorization token' })
    }

    const token = authorization.replace('Bearer ', '')
    
    // Get user's guilds from Discord API
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!guildsResponse.ok) {
      return res.status(guildsResponse.status).json({ error: 'Failed to fetch guilds' })
    }

    const userGuilds = await guildsResponse.json()
    
    // Mock bot presence data (replace with actual bot API calls)
    const botGuilds = [
      '1234567890123456789', // Mock server IDs where bot is present
      '9876543210987654321'
    ]

    // Enhance guild data with bot presence and stats
    const enhancedGuilds = userGuilds.map(guild => ({
      ...guild,
      hasSkyfall: botGuilds.includes(guild.id),
      memberCount: Math.floor(Math.random() * 1000) + 50, // Mock data
      commandsUsed: Math.floor(Math.random() * 500),
      songsPlayed: Math.floor(Math.random() * 200),
      status: botGuilds.includes(guild.id) ? 'online' : 'offline'
    }))

    res.status(200).json({
      guilds: enhancedGuilds,
      totalServers: enhancedGuilds.length,
      activeServers: enhancedGuilds.filter(g => g.hasSkyfall).length
    })

  } catch (error) {
    console.error('Bot servers API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
