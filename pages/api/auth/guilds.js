export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    // Fetch user's guilds from Discord API
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!guildsResponse.ok) {
      throw new Error(`Discord API error: ${guildsResponse.status}`)
    }

    const guilds = await guildsResponse.json()
    
    // Check which guilds have the bot using bot token
    const botToken = process.env.DISCORD_BOT_TOKEN
    const botGuilds = []
    
    if (botToken) {
      try {
        const botGuildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: {
            'Authorization': `Bot ${botToken}`
          }
        })
        
        if (botGuildsResponse.ok) {
          const botGuildsData = await botGuildsResponse.json()
          botGuilds.push(...botGuildsData.map(g => g.id))
        }
      } catch (error) {
        console.error('Bot guilds fetch error:', error)
      }
    }
    
    // Filter guilds where user has elevated permissions (admin, manage server, etc.)
    const elevatedGuilds = guilds.filter(guild => {
      const permissions = parseInt(guild.permissions)
      const hasAdmin = (permissions & 0x8) === 0x8 // Administrator
      const hasManageGuild = (permissions & 0x20) === 0x20 // Manage Server
      const isOwner = guild.owner === true
      
      return hasAdmin || hasManageGuild || isOwner
    })

    // Mark which guilds have the bot
    const guildsWithBotStatus = elevatedGuilds.map(guild => ({
      ...guild,
      botPresent: botGuilds.includes(guild.id),
      canManage: true
    }))

    res.status(200).json({
      allGuilds: guilds,
      elevatedGuilds: guildsWithBotStatus,
      totalGuilds: guilds.length,
      elevatedCount: guildsWithBotStatus.length,
      botGuilds: botGuilds.length
    })

  } catch (error) {
    console.error('Guilds fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch guilds' })
  }
}
