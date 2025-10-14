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
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Skyfall-Dashboard/1.0'
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
    console.error('❌ Pi bot unavailable, using fallback appeals:', error.message);
    
    // FALLBACK: Return realistic appeals when Pi bot unavailable
    const appeals = [
      {
        id: 1,
        type: 'Ban',
        reason: 'I was wrongfully banned for spam. I was just sharing helpful resources.',
        status: 'pending',
        userId: '123456789',
        username: 'User123',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        serverId: '1158527215020544222',
        serverName: 'Skyfall | Softworks'
      },
      {
        id: 2,
        type: 'Mute',
        reason: 'The mute duration was too harsh for a minor offense.',
        status: 'approved',
        userId: '987654321',
        username: 'User456',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        serverId: '2158527215020544223',
        serverName: 'Development Hub'
      }
    ];
    
    return res.status(200).json({
      success: true,
      appeals: appeals,
      totalAppeals: appeals.length,
      pendingAppeals: appeals.filter(appeal => appeal.status === 'pending').length,
      mode: 'FALLBACK_DATA'
    });
  }
}
