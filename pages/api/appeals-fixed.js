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
    
    const response = await fetch(`${PI_BOT_URL}/api/appeals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Skyfall-Dashboard/1.0'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Got real appeals from Pi bot');
      return res.status(200).json(data);
    }

    throw new Error(`Pi bot responded with status ${response.status}`);

  } catch (error) {
    console.error('❌ Appeals API Error:', error.message);
    
    // Return fallback data
    const fallbackAppeals = [
      {
        id: 1,
        username: 'TestUser#1234',
        banReason: 'Spam in chat',
        appealMessage: 'I apologize for my behavior and promise to follow the rules.',
        status: 'pending',
        submittedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        username: 'AnotherUser#5678',
        banReason: 'Inappropriate language',
        appealMessage: 'I understand my mistake and will be more careful with my language.',
        status: 'approved',
        submittedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    return res.status(200).json({
      success: true,
      appeals: fallbackAppeals,
      fallback: true,
      message: 'Using fallback data - Pi bot unavailable',
      timestamp: new Date().toISOString()
    });
  }
}
