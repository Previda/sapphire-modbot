// API endpoint to test Pi bot connection
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3004';
    const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN || '95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af';
    
    console.log('Testing connection to:', PI_BOT_API_URL);
    
    // Test connection to Pi bot
    const response = await fetch(`${PI_BOT_API_URL}/api/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PI_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    if (response.ok) {
      const data = await response.json();
      
      return res.status(200).json({
        success: true,
        message: 'Pi bot connection successful',
        botName: 'Skyfall',
        piUrl: PI_BOT_API_URL,
        data: data,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error(`Pi bot responded with status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('Pi bot connection error:', error);
    
    return res.status(200).json({
      success: false,
      message: 'Using fallback data - Pi bot unavailable',
      error: error.message,
      botName: 'Skyfall',
      piUrl: process.env.PI_BOT_API_URL || 'http://192.168.1.62:3004',
      fallbackData: {
        status: 'online',
        guilds: 5,
        users: 1250,
        commands: 60,
        uptime: '2d 14h 32m',
        version: '1.0.0',
        lastUpdate: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }
}
