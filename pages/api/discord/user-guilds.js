// API to fetch authenticated user's Discord guilds with real data
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const discordToken = authHeader.split(' ')[1]
    if (!discordToken) {
      return res.status(401).json({ error: 'No valid token provided' })
    }

    // Fetch user's guilds from Discord API
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${discordToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!guildsResponse.ok) {
      const errorText = await guildsResponse.text()
      console.error('Discord API error:', guildsResponse.status, errorText)
      return res.status(guildsResponse.status).json({ error: 'Failed to fetch Discord guilds' })
    }

    const userGuilds = await guildsResponse.json()
    
    // Check which guilds have Sapphire bot
    const enhancedGuilds = await Promise.all(
      userGuilds.map(async (guild) => {
        // Check if user has management permissions
        const permissions = BigInt(guild.permissions || 0)
        const hasAdmin = (permissions & BigInt(0x8)) === BigInt(0x8)
        const hasManageServer = (permissions & BigInt(0x20)) === BigInt(0x20)
        
        const canManageBot = guild.owner || hasAdmin || hasManageServer
        
        // Only include servers where user can manage bots
        if (!canManageBot) return null

        try {
          // Check if Sapphire bot is in this guild
          const botPresence = await checkBotInGuild(guild.id)
          
          return {
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            owner: guild.owner,
            permissions: guild.permissions,
            hasSapphire: botPresence.present,
            members: botPresence.memberCount || 0,
            online: botPresence.onlineMembers || 0,
            status: botPresence.status || 'offline',
            canManageBot: true,
            userRole: guild.owner ? 'Owner' : hasAdmin ? 'Administrator' : 'Manager',
            botJoinedAt: botPresence.joinedAt || null
          }
        } catch (error) {
          console.error(`Error checking bot in guild ${guild.id}:`, error)
          return {
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            owner: guild.owner,
            permissions: guild.permissions,
            hasSapphire: false,
            members: 0,
            online: 0,
            status: 'unknown',
            canManageBot: true,
            userRole: guild.owner ? 'Owner' : hasAdmin ? 'Administrator' : 'Manager',
            botJoinedAt: null
          }
        }
      })
    )

    // Filter out null values (servers where user can't manage bots)
    const manageableGuilds = enhancedGuilds.filter(guild => guild !== null)

    res.status(200).json({ 
      guilds: manageableGuilds,
      total: manageableGuilds.length,
      withBot: manageableGuilds.filter(g => g.hasSapphire).length
    })

  } catch (error) {
    console.error('User guilds API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Function to check if Sapphire bot is in guild
async function checkBotInGuild(guildId) {
  try {
    const botToken = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN
    if (!botToken) {
      return { present: false, memberCount: 0, onlineMembers: 0, status: 'unknown', joinedAt: null }
    }

    // Use Discord Bot API to check if bot is in guild
    const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (guildResponse.ok) {
      const guildData = await guildResponse.json()
      
      return {
        present: true,
        memberCount: guildData.member_count || guildData.approximate_member_count || 0,
        onlineMembers: guildData.presence_count || guildData.approximate_presence_count || 0,
        status: 'online',
        joinedAt: new Date().toISOString() // We could store this in database for accuracy
      }
    } else {
      // Bot is not in this guild or no permission
      return {
        present: false,
        memberCount: 0,
        onlineMembers: 0,
        status: 'offline',
        joinedAt: null
      }
    }
  } catch (error) {
    console.error(`Error checking bot in guild ${guildId}:`, error)
    return {
      present: false,
      memberCount: 0,
      onlineMembers: 0,
      status: 'unknown',
      joinedAt: null
    }
  }
}
