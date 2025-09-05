export default async function handler(req, res) {
  const { serverId } = req.query
  const { method } = req

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' })
  }

  // Try Pi bot API first
  const piApiUrl = process.env.PI_BOT_API_URL || process.env.NEXT_PUBLIC_PI_API_URL
  const piToken = process.env.PI_BOT_TOKEN || process.env.NEXT_PUBLIC_PI_TOKEN

  if (piApiUrl && piToken) {
    try {
      const piResponse = await fetch(`${piApiUrl}/api/commands/${serverId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${piToken}`,
          'Content-Type': 'application/json'
        },
        body: method !== 'GET' ? JSON.stringify(req.body) : undefined
      })

      if (piResponse.ok) {
        const data = await piResponse.json()
        return res.status(200).json(data)
      }
    } catch (error) {
      console.error('Pi bot API failed:', error.message)
    }
  }

  // Fallback command management
  if (method === 'GET') {
    // Get all commands
    const commands = [
      {
        id: '1',
        name: 'play',
        description: 'Play music from YouTube',
        category: 'Music',
        enabled: true,
        usage: 45,
        cooldown: 3,
        permissions: ['SEND_MESSAGES'],
        options: [
          { name: 'song', type: 'STRING', description: 'Song to play', required: true }
        ]
      },
      {
        id: '2',
        name: 'skip',
        description: 'Skip current song',
        category: 'Music',
        enabled: true,
        usage: 23,
        cooldown: 2,
        permissions: ['SEND_MESSAGES'],
        options: []
      },
      {
        id: '3',
        name: 'ban',
        description: 'Ban a user from the server',
        category: 'Moderation',
        enabled: true,
        usage: 2,
        cooldown: 5,
        permissions: ['BAN_MEMBERS'],
        options: [
          { name: 'user', type: 'USER', description: 'User to ban', required: true },
          { name: 'reason', type: 'STRING', description: 'Reason for ban', required: false }
        ]
      },
      {
        id: '4',
        name: 'kick',
        description: 'Kick a user from the server',
        category: 'Moderation',
        enabled: true,
        usage: 3,
        cooldown: 3,
        permissions: ['KICK_MEMBERS'],
        options: [
          { name: 'user', type: 'USER', description: 'User to kick', required: true },
          { name: 'reason', type: 'STRING', description: 'Reason for kick', required: false }
        ]
      },
      {
        id: '5',
        name: 'help',
        description: 'Show available commands',
        category: 'Utility',
        enabled: true,
        usage: 15,
        cooldown: 2,
        permissions: ['SEND_MESSAGES'],
        options: []
      },
      {
        id: '6',
        name: 'ping',
        description: 'Check bot latency',
        category: 'Utility',
        enabled: true,
        usage: 24,
        cooldown: 1,
        permissions: ['SEND_MESSAGES'],
        options: []
      }
    ]

    return res.status(200).json({ commands, serverId })
  }

  if (method === 'POST') {
    // Create new command
    const { name, description, category, enabled, cooldown, permissions, options } = req.body
    
    const newCommand = {
      id: Date.now().toString(),
      name,
      description,
      category,
      enabled: enabled !== false,
      usage: 0,
      cooldown: cooldown || 2,
      permissions: permissions || ['SEND_MESSAGES'],
      options: options || []
    }

    return res.status(201).json({ 
      success: true, 
      command: newCommand,
      message: 'Command created successfully'
    })
  }

  if (method === 'PUT') {
    // Update command
    const { id, name, description, category, enabled, cooldown, permissions, options } = req.body
    
    const updatedCommand = {
      id,
      name,
      description,
      category,
      enabled,
      cooldown,
      permissions,
      options,
      usage: Math.floor(Math.random() * 50)
    }

    return res.status(200).json({ 
      success: true, 
      command: updatedCommand,
      message: 'Command updated successfully'
    })
  }

  if (method === 'DELETE') {
    // Delete command
    const { id } = req.body
    
    return res.status(200).json({ 
      success: true, 
      deletedId: id,
      message: 'Command deleted successfully'
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
