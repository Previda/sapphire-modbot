export default async function handler(req, res) {
  const { serverId, index } = req.query;
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!serverId || index === undefined) {
    return res.status(400).json({ error: 'Server ID and index required' });
  }

  try {
    // Send remove command to bot API
    const botApiUrl = process.env.PI_BOT_API_URL || 'http://localhost:3001';
    const botToken = process.env.PI_BOT_TOKEN || 'default_token';
    
    const response = await fetch(`${botApiUrl}/music/queue/${serverId}/${index}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      return res.status(200).json(result);
    } else {
      return res.status(response.status).json({ error: 'Bot API error' });
    }
  } catch (error) {
    console.error('Queue remove error:', error);
    return res.status(500).json({ error: 'Failed to remove from queue' });
  }
}
