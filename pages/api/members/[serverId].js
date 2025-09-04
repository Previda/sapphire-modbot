export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { serverId } = req.query
  
  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' })
  }

  try {
    const botToken = process.env.DISCORD_BOT_TOKEN
    
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' })
    }

    // Fetch server members from Discord API
    const response = await fetch(`https://discord.com/api/v10/guilds/${serverId}/members?limit=1000`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limited by Discord API' })
      }
      throw new Error(`Discord API error: ${response.status}`)
    }

    const membersData = await response.json()
    
    // Format member data for frontend use
    const members = membersData.map(member => ({
      id: member.user.id,
      username: member.user.username,
      discriminator: member.user.discriminator || '0000',
      displayName: member.nick || member.user.global_name || member.user.username,
      avatar: member.user.avatar,
      roles: member.roles,
      joinedAt: member.joined_at
    }))

    return res.status(200).json({
      success: true,
      members,
      count: members.length
    })

  } catch (error) {
    console.error('Failed to fetch server members:', error)
    
    // Return fallback data
    return res.status(200).json({
      success: false,
      members: [],
      count: 0,
      error: 'Failed to fetch members'
    })
  }
}
