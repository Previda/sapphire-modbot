// API to fetch user's Discord guilds with enhanced permissions
// Discord webhook error reporting
async function sendErrorToDiscord(error, context = {}) {
  const webhookUrl = process.env.DISCORD_ERROR_WEBHOOK_URL
  if (!webhookUrl) return
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "🚨 Dashboard Error",
          description: `**Error:** ${error.message}\n**Context:** ${JSON.stringify(context)}`,
          color: 0xff0000,
          timestamp: new Date().toISOString()
        }]
      })
    })
  } catch (e) { console.error('Webhook failed:', e) }
}

// Rate limiting helper
async function rateLimitedFetch(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options)
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after')
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000
      
      console.log(`Rate limited, waiting ${delay}ms before retry ${i + 1}/${retries}`)
      await new Promise(resolve => setTimeout(resolve, delay))
      continue
    }
    
    return response
  }
  
  // Final attempt without retry
  return fetch(url, options)
}

// API route to fetch user's Discord guilds
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header found:', authHeader)
      return res.status(401).json({ error: 'No valid token provided' })
    }

    const token = authHeader.substring(7)
    console.log('Using Discord token:', token.substring(0, 20) + '...')
    
    // First verify token is valid by checking user endpoint with rate limiting
    const userResponse = await rateLimitedFetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('Token validation failed:', userResponse.status, errorText)
      
      if (userResponse.status === 429) {
        return res.status(429).json({ error: 'Rate limited. Please try again in a moment.' })
      }
      
      await sendErrorToDiscord(new Error(`Token validation failed: ${userResponse.status} - ${errorText}`), { 
        endpoint: '/api/discord/guilds',
        step: 'token_validation',
        status: userResponse.status
      })
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    
    // Add delay before next API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Fetch user's guilds from Discord with rate limiting
    const guildsResponse = await rateLimitedFetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!guildsResponse.ok) {
      const errorText = await guildsResponse.text()
      console.error('Discord API error:', guildsResponse.status, errorText)
      
      if (guildsResponse.status === 429) {
        return res.status(429).json({ error: 'Rate limited. Please try again in a moment.' })
      }
      
      await sendErrorToDiscord(new Error(`Discord guilds API failed: ${guildsResponse.status} - ${errorText}`), { 
        endpoint: '/api/discord/guilds',
        status: guildsResponse.status
      })
      return res.status(guildsResponse.status).json({ error: 'Failed to fetch Discord guilds' })
    }

    const userGuilds = await guildsResponse.json()
    
    // Check permissions and enhance guild data
    const enhancedGuilds = await Promise.all(
      userGuilds.map(async (guild) => {
        // Check if user has management permissions
        const permissions = BigInt(guild.permissions || 0)
        const hasAdmin = (permissions & BigInt(0x8)) === BigInt(0x8)
        const hasManageServer = (permissions & BigInt(0x20)) === BigInt(0x20)
        const hasModerateMembers = (permissions & BigInt(0x10000000000)) === BigInt(0x10000000000)
        
        const canManageBot = guild.owner || hasAdmin || hasManageServer
        
        try {
          const botPresence = await checkBotInGuild(guild.id)
          // Get real guild data with member counts using bot token if bot is present
          let realMemberCount = 0
          let realOnlineCount = 0
          
          if (botPresence.present) {
            // Add delay between API calls
            await new Promise(resolve => setTimeout(resolve, 200))
            
            const guildDetailsResponse = await rateLimitedFetch(`https://discord.com/api/v10/guilds/${guild.id}?with_counts=true`, {
              headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (guildDetailsResponse.ok) {
              const guildDetails = await guildDetailsResponse.json()
              realMemberCount = guildDetails.member_count || guildDetails.approximate_member_count || 0
              realOnlineCount = guildDetails.presence_count || guildDetails.approximate_presence_count || 0
            }
          }
          
          return {
            ...guild,
            hasSkyfall: botPresence.present,
            memberCount: realMemberCount,
            onlineMembers: realOnlineCount,
            status: botPresence.status || 'unknown',
            canManageBot,
            userRole: guild.owner ? 'Owner' : hasAdmin ? 'Administrator' : hasManageServer ? 'Manager' : 'Member',
            botJoinedAt: botPresence.joinedAt || null
          }
        } catch (error) {
          return {
            ...guild,
            hasSkyfall: false,
            memberCount: 0,
            onlineMembers: 0,
            status: 'offline',
            canManageBot,
            userRole: guild.owner ? 'Owner' : hasAdmin ? 'Administrator' : hasManageServer ? 'Manager' : 'Member',
            botJoinedAt: null
          }
        }
      })
    )

    // Filter to only show servers where user has management permissions
    const manageableGuilds = enhancedGuilds.filter(guild => guild.canManageBot)

    // If no manageable guilds found, return helpful fallback
    if (manageableGuilds.length === 0) {
      return res.status(200).json({
        guilds: [
          {
            id: 'create-server',
            name: '➕ Create a New Discord Server',
            icon: null,
            owner: true,
            permissions: '8',
            permissions_new: '8',
            hasSkyfall: false,
            memberCount: 0,
            onlineMembers: 0,
            status: 'offline',
            canManageBot: true,
            userRole: 'Owner',
            botJoinedAt: null,
            isCreateButton: true
          }
        ]
      })
    }

    res.status(200).json({ guilds: manageableGuilds })

  } catch (error) {
    console.error('Guilds API error:', error)
    await sendErrorToDiscord(error, { 
      endpoint: '/api/discord/guilds',
      userAgent: req.headers['user-agent']
    })
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Function to check if bot is in guild using Discord Bot API
async function checkBotInGuild(guildId) {
  try {
    // Use Discord Bot API to check if bot is in guild
    const botToken = process.env.DISCORD_BOT_TOKEN
    if (!botToken) {
      return { present: false, memberCount: 0, onlineMembers: 0, status: 'unknown', joinedAt: null }
    }

    const guildResponse = await rateLimitedFetch(`https://discord.com/api/v10/guilds/${guildId}`, {
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
        joinedAt: new Date().toISOString()
      }
    } else {
      // Bot is not in this guild
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
