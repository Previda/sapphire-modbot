// Commands API - Gets bot commands from Pi bot
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Try to get real commands from Pi bot
    const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001';
    
    console.log('🔄 Fetching commands from Pi bot:', PI_BOT_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${PI_BOT_URL}/api/commands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Got real commands from Pi bot');
      return res.status(200).json(data);
    }

    throw new Error('Pi bot unavailable');

  } catch (error) {
    console.error('❌ Commands API Error:', error.message);
    
    return res.status(503).json({
      success: false,
      error: 'Pi bot unavailable',
      message: 'Cannot fetch commands. Pi bot must be online.',
      timestamp: new Date().toISOString()
    });
  }
}
