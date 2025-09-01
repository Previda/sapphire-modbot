// API to fetch user's Discord guilds with enhanced bot presence data
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
    
    // Fetch user's guilds from Discord
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!guildsResponse.ok) {
      console.error('Discord API error:', guildsResponse.status)
      // Return mock data for development
      return res.status(200).json([
        {
          id: '1234567890123456789',
          name: 'Skyfall Development Server',
          icon: null,
          owner: true,
          permissions: '8',
          hasSkyfall: true,
          memberCount: 1024,
          status: 'online'
        },
        {
          id: '9876543210987654321',
          name: 'My Gaming Community',
          icon: null,
          owner: false,
          permissions: '36',
          hasSkyfall: false,
          memberCount: 567,
          status: 'offline'
        }
      ])
    }

    const userGuilds = await guildsResponse.json()
    
    // Check which guilds have the bot (this would connect to your Pi bot API)
    const enhancedGuilds = await Promise.all(
      userGuilds.map(async (guild) => {
        try {
          // This will connect to your Pi bot API later
          const botPresence = await checkBotInGuild(guild.id)
          return {
            ...guild,
            hasSkyfall: botPresence.present,
            memberCount: botPresence.memberCount || Math.floor(Math.random() * 1000) + 100,
            status: botPresence.status || 'unknown'
          }
        } catch (error) {
          return {
            ...guild,
            hasSkyfall: false,
            memberCount: Math.floor(Math.random() * 1000) + 100,
            status: 'unknown'
          }
        }
      })
    )

    res.status(200).json(enhancedGuilds)

  } catch (error) {
    console.error('Guilds API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Function to check if bot is in guild (connects to Pi)
async function checkBotInGuild(guildId) {
  try {
    // This will be your Pi bot API endpoint
    const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://localhost:3001'
    
    const response = await fetch(`${PI_BOT_URL}/api/guild/${guildId}/presence`, {
      timeout: 5000
    })
    
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Bot API unavailable')
    }
  } catch (error) {
    // Mock data for development
    return {
      present: Math.random() > 0.5,
      memberCount: Math.floor(Math.random() * 1000) + 100,
      status: 'online'
    }
  }
}
