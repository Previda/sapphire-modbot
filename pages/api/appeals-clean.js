// Appeals API - Gets appeals from Pi bot
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Try to get real appeals from Pi bot
    const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001';
    
    console.log('🔄 Fetching appeals from Pi bot:', PI_BOT_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${PI_BOT_URL}/api/appeals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Got real appeals from Pi bot');
      return res.status(200).json(data);
    }

    throw new Error('Pi bot unavailable');

  } catch (error) {
    console.error('❌ Appeals API Error:', error.message);
    
    return res.status(503).json({
      success: false,
      error: 'Pi bot unavailable',
      message: 'Cannot fetch appeals. Pi bot must be online.',
      timestamp: new Date().toISOString()
    });
  }
}
