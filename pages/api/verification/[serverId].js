export default async function handler(req, res) {
  const { serverId } = req.query;

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' });
  }

  const botApiUrl = process.env.PI_BOT_API_URL;
  const botToken = process.env.PI_BOT_TOKEN;

  if (!botApiUrl || !botToken) {
    return res.status(503).json({ 
      error: 'Bot API not configured',
      message: 'Verification system unavailable - bot offline'
    });
  }

  if (req.method === 'GET') {
    try {
      // Fetch verification data from Pi bot API
      const response = await fetch(`${botApiUrl}/api/verification/${serverId}`, {
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      } else {
        // Fallback data if bot doesn't have verification data yet
        return res.status(200).json({
          config: null,
          stats: {
            totalVerifications: 0,
            pendingVerifications: 0,
            failedAttempts: 0,
            verificationRate: 0,
            averageVerificationTime: 0
          },
          recentLogs: [],
          recentAttempts: [],
          message: 'Verification not configured for this server'
        });
      }

    } catch (error) {
      console.error('Verification API error:', error);
      return res.status(200).json({
        config: null,
        stats: {
          totalVerifications: 0,
          pendingVerifications: 0,
          failedAttempts: 0,
          verificationRate: 0,
          averageVerificationTime: 0
        },
        recentLogs: [],
        recentAttempts: [],
        error: 'Bot offline - verification unavailable'
      });
    }

  } else if (req.method === 'POST') {
    try {
      const { action, settings } = req.body;

      // Send verification command to Pi bot API
      const response = await fetch(`${botApiUrl}/api/verification/${serverId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, settings, serverId })
      });

      if (response.ok) {
        const result = await response.json();
        return res.status(200).json(result);
      } else {
        const errorText = await response.text();
        console.error('Bot API error:', response.status, errorText);
        return res.status(response.status).json({ 
          error: 'Bot API error',
          message: `Failed to ${action} verification`
        });
      }

    } catch (error) {
      console.error('Verification API POST error:', error);
      return res.status(500).json({ 
        error: 'Connection failed',
        message: 'Cannot reach bot - may be offline'
      });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
