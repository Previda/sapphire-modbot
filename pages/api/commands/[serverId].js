export default async function handler(req, res) {
  const { serverId } = req.query
  const { method } = req

  const botApiUrl = process.env.PI_BOT_API_URL;
  const botToken = process.env.PI_BOT_TOKEN;

  if (!botApiUrl || !botToken) {
    return res.status(503).json({ 
      error: 'Bot API not configured',
      message: 'Commands unavailable - bot offline'
    });
  }

  if (method === 'GET') {
    try {
      // Fetch commands from Pi bot API
      const response = await fetch(`${botApiUrl}/api/commands/${serverId}`, {
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          ...data,
          serverId,
          source: 'pi-bot-api'
        });
      } else {
        // Fallback with empty commands list
        return res.status(200).json({
          serverId,
          commands: [],
          totalCommands: 0,
          categories: [],
          message: 'No commands configured for this server',
          source: 'fallback'
        });
      }

    } catch (error) {
      console.error('Commands fetch error:', error);
      return res.status(500).json({ 
        error: 'Connection failed',
        message: 'Cannot reach bot - may be offline'
      });
    }
  }

  if (method === 'PUT') {
    try {
      const { commandId, enabled, cooldown } = req.body;
      
      // Send command update to Pi bot API
      const response = await fetch(`${botApiUrl}/api/commands/${serverId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commandId, enabled, cooldown, serverId })
      });

      if (response.ok) {
        const result = await response.json();
        return res.status(200).json(result);
      } else {
        const errorText = await response.text();
        console.error('Bot API error:', response.status, errorText);
        return res.status(response.status).json({ 
          error: 'Bot API error',
          message: 'Failed to update command'
        });
      }
      
    } catch (error) {
      console.error('Command update error:', error);
      return res.status(500).json({ 
        error: 'Connection failed',
        message: 'Cannot reach bot - may be offline'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).json({ error: `Method ${method} not allowed` });
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
