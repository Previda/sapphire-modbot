export default async function handler(req, res) {
  const { serverId } = req.query;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' });
  }

  const { action } = req.body;
  
  if (!action) {
    return res.status(400).json({ error: 'Action required' });
  }

  try {
    // Send control command to bot API
    const botApiUrl = process.env.PI_BOT_API_URL || 'http://localhost:3001';
    const botToken = process.env.PI_BOT_TOKEN || 'default_token';
    
    const response = await fetch(`${botApiUrl}/music/control/${serverId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action })
    });
    
    if (response.ok) {
      const result = await response.json();
      return res.status(200).json(result);
    } else {
      return res.status(response.status).json({ error: 'Bot API error' });
    }
  } catch (error) {
    console.error('Music control error:', error);
    return res.status(500).json({ error: 'Failed to control music' });
  }
}
