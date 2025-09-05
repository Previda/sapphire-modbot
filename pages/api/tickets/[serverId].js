export default async function handler(req, res) {
  const { serverId } = req.query;
  
  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' });
  }

  if (req.method === 'GET') {
    return await getTickets(req, res, serverId);
  } else if (req.method === 'POST') {
    return await createTicket(req, res, serverId);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getTickets(req, res, serverId) {
  try {
    // Connect to Pi bot API
    const botApiUrl = process.env.PI_BOT_API_URL;
    const botToken = process.env.PI_BOT_TOKEN;
    
    if (!botApiUrl || !botToken) {
      return res.status(503).json({ 
        error: 'Bot API not configured',
        message: 'Tickets unavailable - bot offline'
      });
    }

    try {
      const response = await fetch(`${botApiUrl}/api/tickets/${serverId}`, {
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const ticketsData = await response.json();
        return res.status(200).json(ticketsData);
      } else {
        // Return empty tickets data if bot doesn't have any
        return res.status(200).json({
          stats: { total: 0, open: 0, closed: 0 },
          tickets: [],
          message: 'No tickets found for this server'
        });
      }
    } catch (botApiError) {
      console.error('Tickets API error:', botApiError);
      return res.status(500).json({ 
        error: 'Connection failed',
        message: 'Cannot reach bot - may be offline'
      });
    }
    
    // Fallback to Discord API
    const discordToken = process.env.DISCORD_BOT_TOKEN;
    if (!discordToken) {
      return res.status(500).json({ error: 'Discord bot token not configured' });
    }

    const discordResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
      headers: {
        'Authorization': `Bot ${discordToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (discordResponse.ok) {
      const channels = await discordResponse.json();
      const ticketChannels = channels.filter(channel => 
        channel.name.startsWith('ticket-') || 
        channel.name.includes('support') ||
        channel.topic?.includes('ticket') ||
        (channel.parent_id && channels.find(c => c.id === channel.parent_id)?.name?.toLowerCase().includes('ticket'))
      );
      
      // Get additional ticket info from channel topics or names
      const tickets = ticketChannels.map((channel) => {
        try {
          // Try to extract ticket info from channel name or topic
          const ticketMatch = channel.name.match(/ticket-(\w+)/) || [null, channel.id.slice(-6)];
          const ticketId = ticketMatch[1] || channel.id.slice(-6);
          
          // Get recent messages to determine activity
          let lastActivity = channel.last_message_id ? 
            new Date(((BigInt(channel.last_message_id) >> 22n) + 1420070400000n)) : 
            new Date(((BigInt(channel.id) >> 22n) + 1420070400000n));
          
          return {
            id: channel.id,
            ticketId: ticketId.toUpperCase(),
            name: channel.name,
            status: channel.archived ? 'closed' : 'open',
            createdAt: new Date(((BigInt(channel.id) >> 22n) + 1420070400000n)).toISOString(),
            lastActivity: lastActivity.toISOString(),
            topic: channel.topic || 'Support ticket',
            userID: null, // Would need to parse from topic or fetch messages
            category: channel.parent_id ? 'Categorized' : 'General'
          };
        } catch (err) {
          console.error('Error processing ticket channel:', err);
          return null;
        }
      }).filter(Boolean);
      
      const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        closed: tickets.filter(t => t.status === 'closed').length
      };
      
      return res.status(200).json({
        stats,
        tickets: tickets.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      });
    } else {
      throw new Error(`Discord API error: ${discordResponse.status}`);
    }
  } catch (error) {
    console.error('Tickets API error:', error);
    return res.status(200).json({
      stats: { total: 0, open: 0, closed: 0 },
      tickets: [],
      error: 'Failed to fetch tickets data'
    });
  }
}

async function createTicket(req, res, serverId) {
  try {
    const { reason, category, priority } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Ticket reason is required' });
    }

    // Connect to Pi bot API
    const botApiUrl = process.env.PI_BOT_API_URL;
    const botToken = process.env.PI_BOT_TOKEN;
    
    if (!botApiUrl || !botToken) {
      return res.status(503).json({ 
        error: 'Bot API not configured',
        message: 'Ticket creation unavailable - bot offline'
      });
    }

    try {
      const response = await fetch(`${botApiUrl}/api/tickets/${serverId}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason,
          category: category || 'general',
          priority: priority || 'normal',
          source: 'dashboard',
          serverId
        })
      });
      
      if (response.ok) {
        const ticketData = await response.json();
        return res.status(200).json(ticketData);
      } else {
        const errorText = await response.text();
        console.error('Bot API error:', response.status, errorText);
        return res.status(response.status).json({ 
          error: 'Bot API error',
          message: 'Failed to create ticket'
        });
      }
    } catch (botApiError) {
      console.error('Ticket creation error:', botApiError);
      return res.status(500).json({ 
        error: 'Connection failed',
        message: 'Cannot reach bot - may be offline'
      });
    }
    
  } catch (error) {
    console.error('Create ticket error:', error);
    return res.status(500).json({ error: 'Failed to create ticket' });
  }
}
