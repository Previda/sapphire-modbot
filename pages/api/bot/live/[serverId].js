export default async function handler(req, res) {
  const { serverId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' })
  }

  try {
    // First, try to get data from Pi bot API
    const piApiUrl = process.env.PI_BOT_API_URL || process.env.NEXT_PUBLIC_PI_API_URL
    const piToken = process.env.PI_BOT_TOKEN || process.env.NEXT_PUBLIC_PI_TOKEN
    
    if (piApiUrl && piToken) {
      try {
        console.log(`Attempting to connect to Pi bot API: ${piApiUrl}`)
        
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

    // Fallback to Discord API + mock data
    const botToken = process.env.DISCORD_BOT_TOKEN
    
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' })
    }

    console.log('Fetching data from Discord API as fallback')

    // Get guild information
    const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}?with_counts=true`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!guildResponse.ok) {
      throw new Error(`Discord API error: ${guildResponse.status}`)
    }

    const guildData = await guildResponse.json()

    // Get recent audit log for moderation actions
    const auditResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/audit-logs?limit=10`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    })

    let recentActions = []
    if (auditResponse.ok) {
      const auditData = await auditResponse.json()
      recentActions = auditData.audit_log_entries?.slice(0, 5).map(entry => ({
        id: entry.id,
        action: getActionType(entry.action_type),
        user: entry.target_id ? `User ID: ${entry.target_id}` : 'Unknown',
        moderator: entry.user_id ? `Mod ID: ${entry.user_id}` : 'Unknown',
        reason: entry.reason || 'No reason provided',
        timestamp: new Date(entry.created_at || Date.now()).toISOString()
      })) || []
    }

    // Get channels for active count
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    })

    let activeChannels = 0
    if (channelsResponse.ok) {
      const channelsData = await channelsResponse.json()
      activeChannels = channelsData?.filter(ch => ch.type === 0 || ch.type === 2)?.length || 0
    }

    // Return Discord + mock data
    const liveData = {
      serverId,
      lastUpdated: new Date().toISOString(),
      source: 'discord-api-fallback',
      stats: {
        memberCount: guildData.approximate_member_count || guildData.member_count || 0,
        onlineMembers: guildData.approximate_presence_count || 0,
        botUptime: Math.floor((Date.now() - 1640995200000) / 1000),
        commandsToday: Math.floor(Math.random() * 200) + 50,
        serverHealth: 95 + Math.floor(Math.random() * 5),
        messagesPerHour: Math.floor(Math.random() * 50) + 20,
        activeChannels: activeChannels
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
        recentActions: recentActions,
        automodStats: {
          messagesScanned: Math.floor(Math.random() * 3000) + 1000,
          actionsToday: recentActions.length + Math.floor(Math.random() * 5),
          blockedSpam: Math.floor(Math.random() * 10) + 2,
          filteredWords: Math.floor(Math.random() * 5) + 1,
          autoTimeouts: Math.floor(Math.random() * 3)
        }
      },
      tickets: {
        active: [],
        totalToday: Math.floor(Math.random() * 5) + 1,
        resolvedToday: Math.floor(Math.random() * 3),
        avgResponseTime: 1200 + Math.floor(Math.random() * 600)
      },
      analytics: {
        messageActivity: Array.from({length: 24}, (_, i) => ({
          hour: i,
          messages: Math.floor(Math.random() * 100) + 20,
          commands: Math.floor(Math.random() * 20) + 1
        })),
        topCommands: [
          { name: 'play', usage: Math.floor(Math.random() * 50) + 20 },
          { name: 'skip', usage: Math.floor(Math.random() * 30) + 10 },
          { name: 'queue', usage: Math.floor(Math.random() * 20) + 5 },
          { name: 'help', usage: Math.floor(Math.random() * 15) + 8 }
        ],
        memberGrowth: {
          daily: Math.floor(Math.random() * 10),
          weekly: Math.floor(Math.random() * 50) + 10,
          monthly: Math.floor(Math.random() * 200) + 50
        }
      },
      commands: [
        { name: 'play', category: 'Music', enabled: true, usage: Math.floor(Math.random() * 50) + 20, cooldown: 3 },
        { name: 'skip', category: 'Music', enabled: true, usage: Math.floor(Math.random() * 30) + 10, cooldown: 2 },
        { name: 'ban', category: 'Moderation', enabled: true, usage: Math.floor(Math.random() * 5), cooldown: 5 },
        { name: 'kick', category: 'Moderation', enabled: true, usage: Math.floor(Math.random() * 5), cooldown: 3 },
        { name: 'help', category: 'Utility', enabled: true, usage: Math.floor(Math.random() * 15) + 8, cooldown: 2 }
      ]
    }

    res.status(200).json(liveData)

  } catch (error) {
    console.error('Live data fetch error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch live data',
      details: error.message,
      serverId
    })
  }
}

function getActionType(actionType) {
  const actions = {
    1: 'Guild Update',
    10: 'Channel Create',
    11: 'Channel Update', 
    12: 'Channel Delete',
    20: 'Member Kick',
    21: 'Member Prune',
    22: 'Member Ban Add',
    23: 'Member Ban Remove',
    24: 'Member Update',
    25: 'Member Role Update',
    26: 'Member Move',
    27: 'Member Disconnect',
    28: 'Bot Add',
    30: 'Role Create',
    31: 'Role Update',
    32: 'Role Delete',
    90: 'Sticker Create',
    91: 'Sticker Update',
    92: 'Sticker Delete',
    100: 'Guild Scheduled Event Create',
    101: 'Guild Scheduled Event Update',
    102: 'Guild Scheduled Event Delete',
    110: 'Thread Create',
    111: 'Thread Update',
    112: 'Thread Delete',
    121: 'Application Command Permission Update',
    140: 'Auto Moderation Rule Create',
    141: 'Auto Moderation Rule Update',
    142: 'Auto Moderation Rule Delete',
    143: 'Auto Moderation Block Message',
    144: 'Auto Moderation Flag Message',
    145: 'Auto Moderation User Communication Disabled'
  }
  return actions[actionType] || `Unknown Action (${actionType})`
}

function getCategoryFromCommand(commandName) {
  if (['play', 'skip', 'stop', 'queue', 'volume', 'pause', 'resume'].includes(commandName)) return 'Music'
  if (['ban', 'kick', 'warn', 'timeout', 'mute', 'unmute'].includes(commandName)) return 'Moderation'
  if (['ticket', 'ticket-setup', 'close-ticket'].includes(commandName)) return 'Tickets'
  if (['8ball', 'coinflip', 'dice', 'rps', 'trivia'].includes(commandName)) return 'Games'
  return 'Utility'
}

function getCommandCooldown(commandName) {
  const cooldowns = {
    'play': 3, 'skip': 2, 'stop': 2, 'queue': 1, 'volume': 1,
    'ban': 5, 'kick': 3, 'warn': 1, 'timeout': 3,
    'ticket': 5, 'ticket-setup': 10,
    '8ball': 2, 'coinflip': 1, 'dice': 1, 'rps': 2, 'trivia': 5,
    'ping': 1, 'help': 2, 'serverinfo': 3, 'userinfo': 2
  }
  return cooldowns[commandName] || 2
}


// Function to fetch comprehensive live data from Pi bot
async function fetchLiveDataFromPi(serverId) {
  const PI_BOT_URL = process.env.PI_BOT_API_URL
  const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN
  
  if (!PI_BOT_URL || !PI_BOT_TOKEN) {
    throw new Error('Pi bot API not configured')
  }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${PI_BOT_URL}/api/guild/${serverId}/live-comprehensive`, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${PI_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Pi bot API error: ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

// Function to fetch real Discord data using bot token
async function fetchRealDiscordData(serverId) {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN
    if (!botToken) {
      throw new Error('No bot token configured')
    }

    // Fetch real guild data
    const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}?with_counts=true`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!guildResponse.ok) {
      throw new Error(`Guild fetch failed: ${guildResponse.status}`)
    }

    const guildData = await guildResponse.json()

    // Fetch recent audit log entries for real moderation data
    const auditResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/audit-logs?limit=10`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    })

    let recentActions = []
    if (auditResponse.ok) {
      const auditData = await auditResponse.json()
      
      // Get user info for target and executor
      const userIds = new Set()
      auditData.audit_log_entries?.forEach(entry => {
        if (entry.target_id) userIds.add(entry.target_id)
        if (entry.user_id) userIds.add(entry.user_id)
      })
      
      // Fetch user details
      const users = {}
      for (const userId of userIds) {
        try {
          const userResponse = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: {
              'Authorization': `Bot ${botToken}`,
              'Content-Type': 'application/json'
            }
          })
          if (userResponse.ok) {
            const userData = await userResponse.json()
            users[userId] = `${userData.username}#${userData.discriminator}`
          }
        } catch (error) {
          users[userId] = `User#${userId.slice(-4)}`
        }
      }
      
      recentActions = auditData.audit_log_entries?.slice(0, 10).map(entry => ({
        id: entry.id,
        action: getActionName(entry.action_type),
        user: users[entry.target_id] || 'Unknown User',
        moderator: users[entry.user_id] || 'Unknown Moderator',
        reason: entry.reason || 'No reason provided',
        timestamp: entry.created_at || new Date().toISOString(),
        actionType: entry.action_type
      })) || []
    }

    return {
      serverId,
      lastUpdated: new Date().toISOString(),
      stats: {
        memberCount: guildData.member_count || 0,
        onlineMembers: guildData.presence_count || 0,
        botUptime: Math.floor((Date.now() - 1640995200000) / 1000),
        commandsToday: 0,
        serverHealth: 100,
        messagesPerHour: 0,
        activeChannels: guildData.channels?.length || 0
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
        recentActions,
        automodStats: {
          messagesScanned: 0,
          actionsToday: recentActions.length,
          blockedSpam: 0,
          filteredWords: 0,
          autoTimeouts: 0
        },
        cases: []
      },
      tickets: {
        active: [],
        totalToday: 0,
        resolvedToday: 0,
        avgResponseTime: 0
      },
      logs: {
        recent: recentActions.map(action => ({
          id: action.id,
          type: 'moderation',
          user: action.user,
          action: `${action.type} action`,
          details: action.reason,
          timestamp: action.timestamp,
          channel: 'audit-log'
        })),
        totalToday: recentActions.length,
        errorCount: 0,
        warningCount: 0
      },
      analytics: {
        messageActivity: Array.from({length: 24}, (_, i) => ({
          hour: i,
          messages: 0,
          commands: 0
        })),
        topCommands: [],
        memberGrowth: {
          daily: 0,
          weekly: 0,
          monthly: 0
        }
      }
    }
  } catch (error) {
    console.error('Real Discord data fetch failed:', error)
    await sendErrorToDiscord(error, { 
      endpoint: 'fetchRealDiscordData',
      serverId,
      step: 'Discord API fetch'
    })
    return null
  }
}

// Helper function to convert Discord audit log action types
function getActionType(actionType) {
  const actionMap = {
    20: 'kick',
    22: 'ban',
    24: 'unban',
    25: 'timeout',
    27: 'warn'
  }
  return actionMap[actionType] || 'unknown'
}

