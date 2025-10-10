export default async function handler(req, res) {
  const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001';
  const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN || '95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af';

  try {
    if (req.method === 'GET') {
      // Get 100% real logs from Pi bot
      try {
        const response = await fetch(`${PI_BOT_API_URL}/api/logs`, {
          headers: {
            'Authorization': `Bearer ${PI_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const realLogsData = await response.json();
          return res.status(200).json({
            success: true,
            logs: realLogsData.logs || [],
            totalLogs: realLogsData.totalLogs || 0,
            source: 'REAL_PI_BOT_DATA'
          });
        }
      } catch (botError) {
        console.error('Pi bot logs API failed:', botError.message);
      }

      // NO FALLBACK - Return error if Pi bot unavailable
      return res.status(503).json({
        success: false,
        error: 'Pi bot unavailable - Cannot fetch real logs data',
        message: 'Real logs data unavailable. Please check Pi bot connection.',
        source: 'ERROR_NO_FALLBACK'
      });

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
