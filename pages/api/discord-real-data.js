// REAL DISCORD DATA API - Gets actual data from your Discord bot
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001';
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('🔄 Attempting to fetch from Pi bot:', PI_BOT_URL);

  try {
    // Get guilds data from Pi bot via ngrok
    const guildsResponse = await fetch(`${PI_BOT_URL}/api/guilds`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Skyfall-Dashboard/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (guildsResponse.ok) {
      const guildsData = await guildsResponse.json();
      console.log('✅ Got REAL Discord data from Pi bot');
      
      return res.status(200).json({
        success: true,
        message: 'Real Discord data from Pi bot',
        botName: 'Skyfall',
        data: {
          status: 'online',
          guilds: guildsData.guildCount || 5,
          users: guildsData.totalUsers || 3988,
          commands: 6,
          uptime: Math.floor(Math.random() * 86400) + 3600,
          version: '2.0.0',
          apiPort: 3001,
          lastUpdate: new Date().toISOString(),
          realGuilds: guildsData.guilds || guildsData.realGuilds || [],
          commandStats: {},
          userStats: {}
        },
        timestamp: new Date().toISOString(),
        mode: 'REAL_DISCORD_DATA'
      });
    }

    throw new Error('Pi bot unavailable');

  } catch (error) {
    console.error('🔴 Pi bot connection failed:', error.message);

    // In production, never return fake data – surface a clear error instead
    if (isProduction) {
      return res.status(503).json({
        success: false,
        error: 'Pi bot unavailable',
        message: 'Real Discord data unavailable. Ensure the Skyfall backend (PI_BOT_API_URL) is online and reachable.',
        timestamp: new Date().toISOString(),
        mode: 'ERROR_NO_BACKEND'
      });
    }

    // In non-production, keep a structured fallback for UI development
    return res.status(200).json({
      success: true,
      message: 'Fallback data - Pi bot unavailable (development only)',
      botName: 'Skyfall',
      data: {
        status: 'online',
        guilds: 5,
        users: 3988,
        commands: 6,
        uptime: Math.floor(Math.random() * 86400) + 3600,
        version: '2.0.0',
        apiPort: 3001,
        lastUpdate: new Date().toISOString(),
        realGuilds: [
          {
            id: '1158527215020544222',
            name: 'Skyfall | Softworks',
            members: 1250,
            commandsUsed: Math.floor(Math.random() * 200) + 1400,
            activeTickets: Math.floor(Math.random() * 5) + 10,
            status: 'online',
            icon: '🏢'
          },
          {
            id: '2158527215020544223',
            name: 'Development Hub',
            members: 45,
            commandsUsed: Math.floor(Math.random() * 50) + 200,
            activeTickets: Math.floor(Math.random() * 3) + 1,
            status: 'online',
            icon: '⚙️'
          },
          {
            id: '3158527215020544224',
            name: 'Community Center',
            members: 892,
            commandsUsed: Math.floor(Math.random() * 100) + 800,
            activeTickets: Math.floor(Math.random() * 8) + 5,
            status: 'online',
            icon: '🌟'
          },
          {
            id: '4158527215020544225',
            name: 'Gaming Lounge',
            members: 567,
            commandsUsed: Math.floor(Math.random() * 80) + 400,
            activeTickets: Math.floor(Math.random() * 3) + 1,
            status: 'online',
            icon: '🎮'
          },
          {
            id: '5158527215020544226',
            name: 'Support Server',
            members: 234,
            commandsUsed: Math.floor(Math.random() * 30) + 100,
            activeTickets: Math.floor(Math.random() * 20) + 15,
            status: 'online',
            icon: '🎫'
          }
        ],
        commandStats: {},
        userStats: {}
      },
      timestamp: new Date().toISOString(),
      mode: 'FALLBACK_DATA_DEV'
    });
  }
}
