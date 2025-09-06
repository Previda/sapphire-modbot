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
      return res.status(200).json({
        stats: { total: 0, open: 0, closed: 0 },
        tickets: [],
        error: 'Bot offline - no ticket data available'
      });
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
