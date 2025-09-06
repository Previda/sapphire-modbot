export default async function handler(req, res) {
  const { serverId } = req.query;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' });
  }

  const { action, url, volume } = req.body;
  
  if (!action) {
    return res.status(400).json({ error: 'Action required' });
  }

  try {
    // Send control command to Pi bot API
    const botApiUrl = process.env.PI_BOT_API_URL;
    const botToken = process.env.PI_BOT_TOKEN;
    
    if (!botApiUrl || !botToken) {
      return res.status(503).json({ 
        error: 'Bot API not configured',
        message: 'Music control unavailable - bot offline'
      });
    }
    
    const payload = { action, serverId };
    if (url) payload.url = url;
    if (volume !== undefined) payload.volume = volume;
    
    const response = await fetch(`${botApiUrl}/api/music/control`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const result = await response.json();
      return res.status(200).json(result);
    } else {
      const errorText = await response.text();
      console.error('Bot API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Bot API error',
        message: `Failed to ${action} music`
      });
    }
  } catch (error) {
    console.error('Music control error:', error);
    return res.status(200).json({ 
      success: false,
      error: 'Connection failed',
      message: 'Cannot reach bot - may be offline'
    });
  }
}
