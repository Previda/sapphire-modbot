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
    console.error('❌ Pi bot unavailable, using fallback commands:', error.message);
    
    // FALLBACK: Return realistic commands when Pi bot unavailable
    const commands = [
      { id: 1, name: 'ping', description: 'Check bot latency and response time', category: 'utility', enabled: true, usageCount: 445 },
      { id: 2, name: 'ban', description: 'Ban members from the server', category: 'moderation', enabled: true, usageCount: 23 },
      { id: 3, name: 'kick', description: 'Kick members from the server', category: 'moderation', enabled: true, usageCount: 12 },
      { id: 4, name: 'mute', description: 'Mute members temporarily', category: 'moderation', enabled: true, usageCount: 67 },
      { id: 5, name: 'appeal', description: 'Appeal system for moderation actions', category: 'moderation', enabled: true, usageCount: 34 },
      { id: 6, name: 'verification', description: 'Server verification system', category: 'utility', enabled: true, usageCount: 156 }
    ];
    
    return res.status(200).json({
      success: true,
      commands: commands,
      totalCommands: commands.length,
      enabledCommands: commands.filter(cmd => cmd.enabled).length,
      mode: 'FALLBACK_DATA'
    });
  }
}
