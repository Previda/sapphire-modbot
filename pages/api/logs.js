export default async function handler(req, res) {
  const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3005';
  const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN;

  try {
    if (req.method === 'GET') {
      // Fetch logs from Pi bot
      const response = await fetch(`${PI_BOT_API_URL}/api/logs`, {
        headers: {
          'Authorization': `Bearer ${PI_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        res.status(200).json(data);
      } else {
        // Return fallback logs if Pi bot is unavailable
        res.status(200).json({
          success: false,
          logs: [
            {
              id: 1,
              action: 'User Banned',
              user: 'Admin',
              message: 'User @spammer was banned for spam',
              type: 'moderation',
              timestamp: new Date().toISOString()
            },
            {
              id: 2,
              action: 'Command Used',
              user: 'Previda',
              message: '/help command executed',
              type: 'info',
              timestamp: new Date(Date.now() - 300000).toISOString()
            },
            {
              id: 3,
              action: 'Ticket Created',
              user: 'User123',
              message: 'Support ticket #001 opened',
              type: 'success',
              timestamp: new Date(Date.now() - 600000).toISOString()
            },
            {
              id: 4,
              action: 'Anti-Raid Triggered',
              user: 'System',
              message: 'Anti-raid protection activated',
              type: 'warning',
              timestamp: new Date(Date.now() - 900000).toISOString()
            }
          ]
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Logs API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch logs',
      logs: []
    });
  }
}
