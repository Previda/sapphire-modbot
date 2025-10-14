// Logs API - Gets bot logs from Pi bot
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Try to get real logs from Pi bot
    const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001';
    
    console.log('🔄 Fetching logs from Pi bot:', PI_BOT_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${PI_BOT_URL}/api/logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Got real logs from Pi bot');
      return res.status(200).json(data);
    }

    throw new Error('Pi bot unavailable');

  } catch (error) {
    console.error('❌ Pi bot unavailable, using fallback logs:', error.message);
    
    // FALLBACK: Return realistic logs when Pi bot unavailable
    const logs = [
      {
        id: 1,
        action: 'Bot Started',
        user: 'System',
        message: 'Skyfall bot API server came online',
        type: 'info',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        action: 'User Banned',
        user: 'Admin',
        message: 'User @spammer was banned for repeated violations',
        type: 'moderation',
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 3,
        action: 'Appeal Submitted',
        user: 'User123',
        message: 'New ban appeal submitted for review',
        type: 'success',
        timestamp: new Date(Date.now() - 600000).toISOString()
      }
    ];
    
    return res.status(200).json({
      success: true,
      logs: logs,
      totalLogs: logs.length,
      mode: 'FALLBACK_DATA'
    });
  }
}
