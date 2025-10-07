const express = require('express')
const cors = require('cors')
const { Client, GatewayIntentBits } = require('discord.js')
require('dotenv').config()

const app = express()
const PORT = process.env.API_PORT || 3001

// CORS configuration for Vercel
app.use(cors({
  origin: [
    'https://skyfall-omega.vercel.app',
    'https://sapphire-modbot-dashboard.vercel.app',
    /https:\/\/.*\.vercel\.app$/,
    'http://localhost:3000',
    'http://192.168.1.62:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
})

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token || token !== process.env.PI_BOT_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    botOnline: client.isReady(),
    timestamp: new Date().toISOString()
  })
})

// Bot status endpoint
app.get('/api/bot/status', authenticateToken, (req, res) => {
  if (!client.isReady()) {
    return res.status(503).json({ error: 'Bot is not connected' })
  }

  res.json({
    online: true,
    user: {
      id: client.user.id,
      username: client.user.username,
      avatar: client.user.displayAvatarURL()
    },
    guilds: client.guilds.cache.size,
    uptime: formatUptime(client.uptime)
  })
})

// Live data endpoint
app.get('/api/live-data', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.query
    
    if (!client.isReady()) {
      return res.status(503).json({ error: 'Bot is not ready' })
    }

    const guild = client.guilds.cache.get(serverId)
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' })
    }

    // Get real guild data
    const onlineMembers = guild.members.cache.filter(member => 
      member.presence?.status && member.presence.status !== 'offline'
    ).size

    const textChannels = guild.channels.cache.filter(ch => ch.isTextBased()).size
    const voiceChannels = guild.channels.cache.filter(ch => ch.isVoiceBased()).size

    const data = {
      serverId: guild.id,
      lastUpdated: new Date().toISOString(),
      stats: {
        memberCount: guild.memberCount,
        onlineMembers: onlineMembers,
        botUptime: formatUptime(client.uptime),
        commandsToday: global.commandsToday || 0,
        serverHealth: client.isReady() ? 100 : 0,
        messagesPerHour: global.messagesPerHour || 0,
        activeChannels: textChannels + voiceChannels
      },
      music: global.musicData || {
        isPlaying: false,
        currentSong: null,
        queue: [],
        volume: 75,
        repeat: 'off',
        shuffle: false
      },
      moderation: {
        recentActions: global.recentModerationActions || [],
        automodStats: {
          messagesScanned: global.messagesScanned || 0,
          actionsToday: global.moderationActionsToday || 0,
          blockedSpam: global.blockedSpam || 0,
          filteredWords: global.filteredWords || 0,
          autoTimeouts: global.autoTimeouts || 0
        }
      },
      tickets: {
        active: global.activeTickets || [],
        totalToday: global.ticketsToday || 0,
        resolvedToday: global.resolvedTicketsToday || 0,
        avgResponseTime: global.avgResponseTime || 0
      },
      logs: {
        recent: global.recentLogs || [],
        totalToday: global.logsToday || 0,
        errorCount: global.errorCount || 0,
        warningCount: global.warningCount || 0
      },
      analytics: {
        messageActivity: global.messageActivity || [],
        topCommands: global.topCommands || [],
        memberGrowth: {
          daily: global.dailyGrowth || 0,
          weekly: global.weeklyGrowth || 0,
          monthly: global.monthlyGrowth || 0
        }
      },
      verification: {
        recentVerifications: global.verificationLogs?.filter(log => log.guildId === serverId)?.slice(0, 10) || [],
        totalToday: global.verificationLogs?.filter(log => 
          log.guildId === serverId && 
          new Date(log.timestamp).toDateString() === new Date().toDateString()
        ).length || 0
      },
      commands: global.availableCommands || [],
      responseTime: `${Date.now() - (req.startTime || Date.now())}ms`,
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      error: null
    }

    res.json(data)
  } catch (error) {
    console.error('Live data error:', error)
    res.status(500).json({ error: 'Failed to fetch live data' })
  }
})

// Guild members endpoint
app.get('/api/guild/:guildId/members', authenticateToken, async (req, res) => {
  try {
    const { guildId } = req.params

    if (!client.isReady()) {
      return res.status(503).json({ error: 'Bot is not connected' })
    }

    const guild = client.guilds.cache.get(guildId)
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' })
    }

    // Fetch all members
    await guild.members.fetch()
    
    const members = guild.members.cache.map(member => ({
      id: member.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      avatar: member.user.displayAvatarURL(),
      nickname: member.nickname,
      roles: member.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        color: role.color
      })),
      joinedAt: member.joinedAt,
      status: member.presence?.status || 'offline'
    }))

    res.json({ members })
  } catch (error) {
    console.error('Error fetching guild members:', error)
    res.status(500).json({ error: 'Failed to fetch members' })
  }
})

// Music control endpoints
app.post('/api/music/:action', authenticateToken, async (req, res) => {
  try {
    const { action } = req.params
    const { guildId, query } = req.body

    // Mock music control responses
    switch (action) {
      case 'play':
        res.json({ success: true, message: `Playing: ${query}` })
        break
      case 'pause':
        res.json({ success: true, message: 'Music paused' })
        break
      case 'resume':
        res.json({ success: true, message: 'Music resumed' })
        break
      case 'stop':
        res.json({ success: true, message: 'Music stopped' })
        break
      case 'skip':
        res.json({ success: true, message: 'Skipped track' })
        break
      default:
        res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Music control error:', error)
    res.status(500).json({ error: 'Music control failed' })
  }
})

// Verification logging endpoint
app.post('/api/verification/log', authenticateToken, async (req, res) => {
  try {
    const { guildId, userId, username, timestamp, type } = req.body
    
    // Store verification log in memory (you could use a database here)
    if (!global.verificationLogs) {
      global.verificationLogs = []
    }
    
    global.verificationLogs.unshift({
      id: Date.now(),
      guildId,
      userId,
      username,
      timestamp,
      type
    })
    
    // Keep only last 1000 logs
    if (global.verificationLogs.length > 1000) {
      global.verificationLogs = global.verificationLogs.slice(0, 1000)
    }
    
    console.log(`✅ Verification logged: ${username} in guild ${guildId}`)
    res.json({ success: true, message: 'Verification logged' })
  } catch (error) {
    console.error('Verification logging error:', error)
    res.status(500).json({ error: 'Failed to log verification' })
  }
})

// Get verification logs
app.get('/api/verification/logs/:guildId', authenticateToken, async (req, res) => {
  try {
    const { guildId } = req.params
    const logs = global.verificationLogs?.filter(log => log.guildId === guildId) || []
    
    res.json({ logs: logs.slice(0, 50) }) // Return last 50 logs for this guild
  } catch (error) {
    console.error('Error fetching verification logs:', error)
    res.status(500).json({ error: 'Failed to fetch logs' })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on http://0.0.0.0:${PORT}`)
  console.log(`📡 CORS enabled for Vercel deployment`)
  
  // Connect Discord bot
  if (process.env.DISCORD_TOKEN) {
    client.login(process.env.DISCORD_TOKEN)
      .then(() => console.log('🤖 Discord bot connected to API server'))
      .catch(err => console.error('❌ Discord bot connection failed:', err))
  } else {
    console.warn('⚠️  DISCORD_TOKEN not found - bot will not connect')
  }
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down API server...')
  client.destroy()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down API server...')
  client.destroy()
  process.exit(0)
})
