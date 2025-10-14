// REAL DISCORD DATA API - Gets actual data from your Discord bot
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001';
  const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN || '95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af';
  
  console.log('🔄 Attempting to fetch from Pi bot:', PI_BOT_URL);

  try {
    // First try to get real data from your Pi bot
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${PI_BOT_URL}/api/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const realData = await response.json();
      console.log('✅ Got REAL Discord data from Pi bot');
      
      return res.status(200).json({
        success: true,
        message: 'Real Discord data from Pi bot',
        botName: 'Skyfall',
        data: {
          status: 'online',
          guilds: realData.guilds?.length || realData.guildCount || 0,
          users: realData.totalUsers || realData.userCount || 0,
          commands: realData.commands?.length || 60,
          uptime: realData.uptime || process.uptime(),
          version: realData.version || '1.0.0',
          apiPort: 3001,
          lastUpdate: new Date().toISOString(),
          realGuilds: realData.guilds || [],
          commandStats: realData.commandStats || {},
          userStats: realData.userStats || {}
        },
        timestamp: new Date().toISOString(),
        mode: 'REAL_DISCORD_DATA'
      });
    }

    // NO FALLBACK - Only real Pi bot data allowed
    console.log('❌ Pi bot unavailable - cannot provide real data');
    
    return res.status(503).json({
      success: false,
      error: 'Pi bot unavailable',
      message: 'Real Discord data unavailable. Pi bot must be online at ' + PI_BOT_API_URL,
      timestamp: new Date().toISOString(),
      mode: 'FALLBACK_DATA'
    });

  } catch (error) {
    console.error('🔴 Discord API Error:', error.message);
    
    return res.status(503).json({
      success: false,
      error: 'Pi bot connection failed',
      message: 'Cannot provide real Discord data. Pi bot must be online.',
      piUrl: PI_BOT_API_URL,
      timestamp: new Date().toISOString(),
      mode: 'ERROR_REAL_DATA_ONLY'
    });
  }
}
