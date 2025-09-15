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
    'https://*.vercel.app',
    'http://localhost:3000',
    'http://192.168.1.62:3000'
  ],
  credentials: true
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
    uptime: client.uptime,
    ping: client.ws.ping
  })
})

// Live data endpoint for dashboard
app.get('/api/live-data', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.query

    if (!client.isReady()) {
      return res.status(503).json({ error: 'Bot is not connected' })
    }

    if (!serverId) {
      return res.status(400).json({ error: 'Server ID is required' })
    }

    const guild = client.guilds.cache.get(serverId)
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found or bot not in guild' })
    }

    // Fetch guild data
    const memberCount = guild.memberCount
    const onlineMembers = guild.members.cache.filter(member => 
      member.presence?.status === 'online'
    ).size

    // Mock data for demonstration (replace with real data from your bot's database)
    const liveData = {
      stats: {
        commandsToday: Math.floor(Math.random() * 100) + 50,
        memberCount: memberCount,
        onlineMembers: onlineMembers,
        botUptime: Math.floor(client.uptime / 1000 / 60) // minutes
      },
      moderation: {
        cases: [
          {
            id: 1,
            type: 'warn',
            user: 'User#1234',
            reason: 'Spam',
            timestamp: new Date().toISOString()
          }
        ]
      },
      tickets: {
        active: [
          {
            id: 1,
            channel: 'ticket-001',
            user: 'User#5678',
            category: 'Support',
            created: new Date().toISOString()
          }
        ]
      },
      music: {
        isPlaying: false,
        queue: [],
        currentTrack: null
      }
    }

    res.json(liveData)
  } catch (error) {
    console.error('Error fetching live data:', error)
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
