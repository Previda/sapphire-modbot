export default async function handler(req, res) {
  const { serverId, ticketId } = req.query;
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!serverId || !ticketId) {
    return res.status(400).json({ error: 'Server ID and ticket ID required' });
  }

  const { status, reason } = req.body;
  
  try {
    // Send close command to bot API
    const botApiUrl = process.env.PI_BOT_API_URL || 'http://localhost:3001';
    const botToken = process.env.PI_BOT_TOKEN || 'default_token';
    
    const response = await fetch(`${botApiUrl}/tickets/${serverId}/${ticketId}/close`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    
    if (response.ok) {
      const result = await response.json();
      return res.status(200).json(result);
    } else {
      // Fallback to Discord API
      const discordResponse = await fetch(`https://discord.com/api/v10/channels/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          archived: true,
          locked: true
        })
      });
      
      if (discordResponse.ok) {
        return res.status(200).json({ success: true, message: 'Ticket closed successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to close ticket' });
      }
    }
  } catch (error) {
    console.error('Ticket close error:', error);
    return res.status(500).json({ error: 'Failed to close ticket' });
  }
}
