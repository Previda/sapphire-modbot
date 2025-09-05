export default async function handler(req, res) {
  const { serverId } = req.query
  const { method } = req

  if (method === 'GET') {
    try {
      // Try to get commands from Pi bot API first
      const piApiUrl = process.env.PI_BOT_API_URL || process.env.NEXT_PUBLIC_PI_API_URL
      const piToken = process.env.PI_BOT_TOKEN || process.env.NEXT_PUBLIC_PI_TOKEN
      
      if (piApiUrl && piToken) {
        try {
          console.log(`Fetching commands from Pi bot API: ${piApiUrl}/commands/${serverId}`)
          
          const piResponse = await fetch(`${piApiUrl}/commands/${serverId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${piToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'Skyfall-Dashboard/1.0'
            },
            timeout: 10000
          })
          
          if (piResponse.ok) {
            const piData = await piResponse.json()
            console.log('Successfully fetched commands from Pi bot API')
            return res.status(200).json({
              ...piData,
              serverId,
              source: 'pi-bot-api'
            })
          } else {
            console.log(`Pi bot API responded with status: ${piResponse.status}`)
          }
        } catch (piError) {
          console.error('Pi bot commands API failed:', piError.message)
        }
      }
      
      // Fallback to mock commands data
      console.log('Using fallback mock commands')
      const mockCommands = [
        {
          id: '1',
          name: 'play',
          description: 'Play music from YouTube',
          category: 'Music',
          enabled: true,
          usage: 45,
          cooldown: 3,
          options: [],
          permissions: ['SEND_MESSAGES']
        },
        {
          id: '2',
          name: 'skip',
          description: 'Skip current song',
          category: 'Music',
          enabled: true,
          usage: 23,
          cooldown: 2,
          options: [],
          permissions: ['SEND_MESSAGES']
        },
        {
          id: '3',
          name: 'ban',
          description: 'Ban a user from the server',
          category: 'Moderation',
          enabled: true,
          usage: 2,
          cooldown: 5,
          options: [],
          permissions: ['BAN_MEMBERS']
        },
        {
          id: '4',
          name: 'kick',
          description: 'Kick a user from the server',
          category: 'Moderation',
          enabled: true,
          usage: 3,
          cooldown: 3,
          options: [],
          permissions: ['KICK_MEMBERS']
        },
        {
          id: '5',
          name: 'ticket',
          description: 'Create a support ticket',
          category: 'Support',
          enabled: true,
          usage: 8,
          cooldown: 5,
          options: [],
          permissions: ['SEND_MESSAGES']
        }
      ]

      res.status(200).json({
        serverId,
        commands: mockCommands,
        totalCommands: mockCommands.length,
        categories: [...new Set(mockCommands.map(cmd => cmd.category))]
      })

    } catch (error) {
      console.error('Commands fetch error:', error)
      res.status(500).json({ error: 'Failed to fetch commands' })
    }
  }

  if (method === 'PUT') {
    // Update command settings
    try {
      const { commandId, enabled, cooldown } = req.body
      
      // Here you would update command settings in your bot's database
      // For now, just return success
      res.status(200).json({ 
        success: true, 
        message: 'Command updated successfully' 
      })
      
    } catch (error) {
      console.error('Command update error:', error)
      res.status(500).json({ error: 'Failed to update command' })
    }
  }
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

function getCommandPermissions(commandName) {
  const moderationCommands = ['ban', 'kick', 'warn', 'timeout', 'mute', 'unmute']
  const ticketCommands = ['ticket-setup']
  
  if (moderationCommands.includes(commandName)) {
    return ['MANAGE_MESSAGES', 'MODERATE_MEMBERS']
  }
  if (ticketCommands.includes(commandName)) {
    return ['MANAGE_CHANNELS']
  }
  return ['SEND_MESSAGES']
}
