import { sendErrorToDiscord } from '../../../lib/errorReporting'

export default async function handler(req, res) {
  const { serverId } = req.query
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' })
  }

  try {
    if (req.method === 'GET') {
      // Fetch tickets from Discord API and Pi bot
      const tickets = await fetchTickets(serverId)
      res.status(200).json(tickets)
    } else if (req.method === 'POST') {
      // Create or close ticket
      const { action, userId, reason, channelId } = req.body
      const result = await handleTicketAction(serverId, action, { userId, reason, channelId })
      res.status(200).json(result)
    } else if (req.method === 'PUT') {
      // Update ticket (priority, status, etc.)
      const { ticketId, updates } = req.body
      const result = await updateTicket(serverId, ticketId, updates)
      res.status(200).json(result)
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Tickets API error:', error)
    await sendErrorToDiscord(error, { 
      endpoint: `/api/tickets/${serverId}`,
      method: req.method,
      serverId 
    })
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function fetchTickets(serverId) {
  try {
    // Try to fetch from Pi bot API first
    const piResponse = await fetch(`${process.env.PI_BOT_API_URL}/tickets/${serverId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PI_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    }).catch(() => null)

    if (piResponse?.ok) {
      const piData = await piResponse.json()
      return piData
    }

    // Fallback to Discord API for ticket channels
    const discordResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!discordResponse.ok) {
      throw new Error(`Discord API error: ${discordResponse.status}`)
    }

    const channels = await discordResponse.json()
    const ticketChannels = channels.filter(channel => 
      channel.name?.includes('ticket') || 
      channel.parent_id === getTicketCategoryId(serverId)
    )

    const tickets = await Promise.all(ticketChannels.map(async (channel) => {
      try {
        // Get recent messages to determine ticket status
        const messagesResponse = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages?limit=10`, {
          headers: {
            'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        })

        const messages = messagesResponse.ok ? await messagesResponse.json() : []
        const lastActivity = messages[0]?.timestamp || channel.created_at

        return {
          id: channel.id,
          channelId: channel.id,
          title: channel.name,
          status: channel.archived ? 'closed' : 'open',
          priority: getPriorityFromName(channel.name),
          userId: extractUserIdFromName(channel.name),
          createdAt: channel.created_at,
          lastActivity,
          messages: messages.length,
          category: 'General'
        }
      } catch (err) {
        console.error('Error processing ticket channel:', err)
        return null
      }
    }))

    return {
      tickets: tickets.filter(Boolean),
      categories: ['General', 'Technical', 'Appeal', 'Report'],
      stats: {
        total: tickets.length,
        open: tickets.filter(t => t?.status === 'open').length,
        closed: tickets.filter(t => t?.status === 'closed').length
      }
    }

  } catch (error) {
    console.error('Error fetching tickets:', error)
    // Return empty data on error
    return {
      tickets: [],
      categories: ['General', 'Technical', 'Appeal', 'Report'],
      stats: { total: 0, open: 0, closed: 0 }
    }
  }
}

async function handleTicketAction(serverId, action, data) {
  try {
    if (action === 'create') {
      return await createTicket(serverId, data)
    } else if (action === 'close') {
      return await closeTicket(serverId, data.channelId, data.reason)
    }
    throw new Error(`Unknown ticket action: ${action}`)
  } catch (error) {
    console.error('Ticket action error:', error)
    throw error
  }
}

async function createTicket(serverId, { userId, reason, category = 'General' }) {
  // Create ticket channel via Discord API
  const channelName = `ticket-${userId}-${Date.now().toString().slice(-6)}`
  
  const response = await fetch(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: channelName,
      type: 0, // Text channel
      parent_id: getTicketCategoryId(serverId),
      topic: `Ticket for <@${userId}> - ${reason}`,
      permission_overwrites: [
        {
          id: serverId, // @everyone role
          type: 0,
          deny: '1024' // VIEW_CHANNEL
        },
        {
          id: userId,
          type: 1, // Member
          allow: '1024' // VIEW_CHANNEL
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to create ticket channel: ${response.status}`)
  }

  const channel = await response.json()
  
  // Send initial message
  await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: `🎫 **Ticket Created**\n\n<@${userId}>, your ticket has been created!\n**Reason:** ${reason}\n**Category:** ${category}\n\nA staff member will be with you shortly.`
    })
  })

  return {
    success: true,
    ticketId: channel.id,
    channelId: channel.id,
    message: 'Ticket created successfully'
  }
}

async function closeTicket(serverId, channelId, reason) {
  // Archive the channel
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      archived: true,
      locked: true
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to close ticket: ${response.status}`)
  }

  // Send closure message
  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: `🔒 **Ticket Closed**\n\n${reason ? `**Reason:** ${reason}` : 'This ticket has been closed by staff.'}\n\nThank you for contacting support.`
    })
  })

  return {
    success: true,
    message: 'Ticket closed successfully'
  }
}

async function updateTicket(serverId, ticketId, updates) {
  // Update ticket properties (name, topic, etc.)
  const updateData = {}
  
  if (updates.priority) {
    updateData.name = `${updates.priority}-${ticketId}`
  }
  
  if (updates.topic) {
    updateData.topic = updates.topic
  }

  const response = await fetch(`https://discord.com/api/v10/channels/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  })

  if (!response.ok) {
    throw new Error(`Failed to update ticket: ${response.status}`)
  }

  return {
    success: true,
    message: 'Ticket updated successfully'
  }
}

// Helper functions
function getTicketCategoryId(serverId) {
  // This should be configurable per server
  // For now, return null to create in root
  return null
}

function getPriorityFromName(name) {
  if (name.includes('urgent') || name.includes('high')) return 'High'
  if (name.includes('low')) return 'Low'
  return 'Medium'
}

function extractUserIdFromName(name) {
  const match = name.match(/ticket-(\d+)/)
  return match ? match[1] : null
}
