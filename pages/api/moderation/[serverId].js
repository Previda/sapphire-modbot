export default async function handler(req, res) {
  const { serverId } = req.query
  const { method } = req

  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
  if (!BOT_TOKEN) {
    return res.status(200).json({ 
      error: 'Bot token not configured',
      cases: [],
      totalCases: 0,
      todaysCases: 0
    })
  }

  if (method === 'POST') {
    // Execute moderation action from dashboard
    const { action, user, userId, reason, duration } = req.body
    
    // Handle user field - extract ID from various formats
    let targetUserId = userId
    if (!targetUserId && user) {
      // Extract user ID from formats like "Username (user#1234)" or raw ID
      if (user.includes('(') && user.includes('#')) {
        // Format: "DisplayName (username#1234)"
        // Try to find a user ID in the server members first
        try {
          const membersResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/members?limit=1000`, {
            headers: {
              'Authorization': `Bot ${BOT_TOKEN}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (membersResponse.ok) {
            const members = await membersResponse.json()
            const searchTerm = user.toLowerCase()
            const member = members.find(m => {
              const displayName = m.nick || m.user.global_name || m.user.username
              const username = m.user.username
              const fullFormat = `${displayName} (${username}#${m.user.discriminator})`.toLowerCase()
              return fullFormat === searchTerm || 
                     displayName.toLowerCase() === searchTerm ||
                     username.toLowerCase() === searchTerm ||
                     searchTerm.includes(m.user.id)
            })
            
            if (member) {
              targetUserId = member.user.id
            }
          }
        } catch (error) {
          console.error('Failed to fetch members for user lookup:', error)
        }
        
        if (!targetUserId) {
          return res.status(400).json({ 
            error: 'User not found. Please select a user from the dropdown or provide Discord user ID.' 
          })
        }
      } else if (/^\d{17,19}$/.test(user.trim())) {
        // Raw Discord ID format
        targetUserId = user.trim()
      } else {
        // Try to find by username
        try {
          const membersResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/members?limit=1000`, {
            headers: {
              'Authorization': `Bot ${BOT_TOKEN}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (membersResponse.ok) {
            const members = await membersResponse.json()
            const member = members.find(m => {
              const displayName = (m.nick || m.user.global_name || m.user.username).toLowerCase()
              const username = m.user.username.toLowerCase()
              return displayName === user.toLowerCase() || username === user.toLowerCase()
            })
            
            if (member) {
              targetUserId = member.user.id
            }
          }
        } catch (error) {
          console.error('Failed to fetch members for username lookup:', error)
        }
        
        if (!targetUserId) {
          return res.status(400).json({ 
            error: 'User not found. Please select a user from the dropdown or provide Discord user ID.' 
          })
        }
      }
    }
    
    if (!targetUserId || !action || !reason) {
      return res.status(400).json({ 
        error: 'Missing required fields: action, user ID, and reason are required' 
      })
    }
    
    try {
      let endpoint, payload
      
      switch (action) {
        case 'ban':
          endpoint = `https://discord.com/api/v10/guilds/${serverId}/bans/${targetUserId}`
          payload = { delete_message_days: 1, reason }
          break
          
        case 'kick':
          endpoint = `https://discord.com/api/v10/guilds/${serverId}/members/${targetUserId}`
          payload = { reason }
          break
          
        case 'timeout':
          endpoint = `https://discord.com/api/v10/guilds/${serverId}/members/${targetUserId}`
          payload = { 
            communication_disabled_until: new Date(Date.now() + (duration * 60 * 1000)).toISOString(),
            reason 
          }
          break
          
        default:
          return res.status(400).json({ error: 'Invalid action' })
      }
      
      const response = await fetch(endpoint, {
        method: action === 'kick' ? 'DELETE' : action === 'timeout' ? 'PATCH' : 'PUT',
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        // Log the action
        await logModerationAction(serverId, action, targetUserId, reason)
        
        res.status(200).json({ 
          success: true, 
          message: `${action} action completed successfully` 
        })
      } else {
        const errorData = await response.text()
        res.status(response.status).json({ 
          error: `Failed to ${action} user: ${errorData}` 
        })
      }
      
    } catch (error) {
      console.error('Moderation action error:', error)
      res.status(200).json({ 
        success: false,
        error: 'Action failed',
        message: 'Cannot perform moderation action - bot may be offline'
      })
    }
  }

  if (method === 'GET') {
    // Get moderation cases and recent actions
    try {
      // Fetch audit logs
      const auditResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/audit-logs?limit=50`, {
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })
      
      let cases = []
      if (auditResponse.ok) {
        const auditData = await auditResponse.json()
        
        // Get unique user IDs for batch fetching
        const userIds = new Set()
        auditData.audit_log_entries?.forEach(entry => {
          if (entry.target_id) userIds.add(entry.target_id)
          if (entry.user_id) userIds.add(entry.user_id)
        })
        
        // Fetch user data in batches
        const users = {}
        for (const userId of userIds) {
          try {
            const userResponse = await fetch(`https://discord.com/api/v10/users/${userId}`, {
              headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json'
              }
            })
            if (userResponse.ok) {
              const userData = await userResponse.json()
              users[userId] = {
                username: userData.username,
                discriminator: userData.discriminator,
                avatar: userData.avatar
              }
            }
          } catch (error) {
            users[userId] = { username: `User${userId.slice(-4)}`, discriminator: '0000', avatar: null }
          }
        }
        
        // Format moderation cases
        cases = auditData.audit_log_entries
          ?.filter(entry => [20, 22, 23, 24, 27].includes(entry.action_type)) // Moderation actions only
          ?.map(entry => ({
            id: entry.id,
            caseNumber: `#${entry.id.slice(-6)}`,
            action: getDetailedActionName(entry.action_type),
            target: users[entry.target_id] || { username: 'Unknown', discriminator: '0000' },
            moderator: users[entry.user_id] || { username: 'Unknown', discriminator: '0000' },
            reason: entry.reason || 'No reason provided',
            timestamp: entry.created_at,
            actionType: entry.action_type,
            status: entry.action_type === 23 ? 'resolved' : 'active' // Unban = resolved
          })) || []
      }
      
      res.status(200).json({
        serverId,
        cases: cases.slice(0, 20), // Latest 20 cases
        totalCases: cases.length,
        todaysCases: cases.filter(c => {
          const today = new Date()
          const caseDate = new Date(c.timestamp)
          return caseDate.toDateString() === today.toDateString()
        }).length
      })
      
    } catch (error) {
      console.error('Moderation fetch error:', error)
      res.status(200).json({ 
        serverId,
        cases: [],
        totalCases: 0,
        todaysCases: 0,
        error: 'Failed to fetch moderation data - bot may be offline'
      })
    }
  }
}

function getDetailedActionName(actionType) {
  const actions = {
    1: 'Server Update',
    10: 'Channel Create', 11: 'Channel Update', 12: 'Channel Delete',
    13: 'Channel Overwrite Create', 14: 'Channel Overwrite Update', 15: 'Channel Overwrite Delete',
    20: 'Member Kick', 21: 'Member Prune', 22: 'Member Ban', 23: 'Member Unban',
    24: 'Member Update', 25: 'Member Role Update', 26: 'Member Move', 27: 'Member Disconnect', 28: 'Bot Add',
    30: 'Role Create', 31: 'Role Update', 32: 'Role Delete',
    40: 'Invite Create', 41: 'Invite Update', 42: 'Invite Delete',
    50: 'Webhook Create', 51: 'Webhook Update', 52: 'Webhook Delete',
    60: 'Emoji Create', 61: 'Emoji Update', 62: 'Emoji Delete',
    72: 'Message Delete', 73: 'Message Bulk Delete', 74: 'Message Pin', 75: 'Message Unpin',
    80: 'Integration Create', 81: 'Integration Update', 82: 'Integration Delete',
    83: 'Stage Instance Create', 84: 'Stage Instance Update', 85: 'Stage Instance Delete',
    90: 'Sticker Create', 91: 'Sticker Update', 92: 'Sticker Delete',
    100: 'Guild Scheduled Event Create', 101: 'Guild Scheduled Event Update', 102: 'Guild Scheduled Event Delete',
    110: 'Thread Create', 111: 'Thread Update', 112: 'Thread Delete',
    121: 'Application Command Permission Update',
    140: 'Auto Moderation Rule Create', 141: 'Auto Moderation Rule Update', 142: 'Auto Moderation Rule Delete',
    143: 'Auto Moderation Block Message', 144: 'Auto Moderation Flag Message', 145: 'Auto Moderation User Communication Disabled'
  }
  return actions[actionType] || `Unknown Action (${actionType})`
}

async function logModerationAction(serverId, action, userId, reason) {
  // This would log to your bot's database
  console.log(`Moderation action logged: ${action} user ${userId} in server ${serverId} - ${reason}`)
}
