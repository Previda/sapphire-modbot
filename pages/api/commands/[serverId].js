export default async function handler(req, res) {
  const { serverId } = req.query
  const { method } = req

  if (method === 'GET') {
    // Fetch actual bot commands from Discord
    try {
      const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
      const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
      
      if (!BOT_TOKEN || !CLIENT_ID) {
        return res.status(500).json({ error: 'Bot credentials not configured' })
      }

      // Get bot's registered commands
      const commandsResponse = await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/commands`, {
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })

      if (!commandsResponse.ok) {
        throw new Error(`Failed to fetch commands: ${commandsResponse.status}`)
      }

      const commands = await commandsResponse.json()
      
      // Format commands for dashboard
      const formattedCommands = commands.map(cmd => ({
        id: cmd.id,
        name: cmd.name,
        description: cmd.description,
        category: getCategoryFromCommand(cmd.name),
        enabled: true, // All registered commands are enabled
        usage: 0, // Would need usage tracking from bot
        cooldown: getCommandCooldown(cmd.name),
        options: cmd.options || [],
        permissions: getCommandPermissions(cmd.name)
      }))

      res.status(200).json({
        serverId,
        commands: formattedCommands,
        totalCommands: formattedCommands.length,
        categories: [...new Set(formattedCommands.map(cmd => cmd.category))]
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
