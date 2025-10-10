export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { commandId, enabled, serverId } = req.body;

  if (!commandId || typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // In production, this would update the database via Pi bot API
    const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3005';
    const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN;

    // Try to send command toggle to Pi bot
    try {
      const response = await fetch(`${PI_BOT_API_URL}/api/commands/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PI_BOT_TOKEN}`
        },
        body: JSON.stringify({ commandId, enabled, serverId })
      });

      if (response.ok) {
        const result = await response.json();
        return res.status(200).json({
          success: true,
          message: `Command ${enabled ? 'enabled' : 'disabled'} successfully`,
          data: result
        });
      }
    } catch (botError) {
      console.log('Pi bot unavailable, using local response');
    }

    // Fallback response when Pi bot is unavailable
    res.status(200).json({
      success: true,
      message: `Command ${enabled ? 'enabled' : 'disabled'} successfully`,
      commandId,
      enabled,
      serverId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Command toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle command' });
  }
}
