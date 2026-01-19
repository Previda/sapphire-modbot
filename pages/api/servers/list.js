// Multi-Server Management API - Get all accessible servers
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // First, check if user is authenticated and has guilds in session
    const cookies = req.headers.cookie || '';
    const authCookie = cookies.split(';').find(c => c.trim().startsWith('skyfall_auth='));
    
    if (authCookie) {
      try {
        const authData = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
        
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - (authData.timestamp || 0);
        const sessionGuilds = Array.isArray(authData.guilds) ? authData.guilds : [];

        if (sessionAge < 86400000 && sessionGuilds.length > 0) {
          console.log('✅ User has', sessionGuilds.length, 'guilds from Discord');
          
          // Attempt to enrich with Pi bot guild data, but do NOT hide servers if bot is missing
          let botGuilds = [];
          try {
            const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3004';
            const botResponse = await fetch(`${PI_BOT_URL}/api/guilds`, {
              headers: { 'User-Agent': 'Skyfall-Dashboard/1.0' },
              signal: AbortSignal.timeout(5000)
            });
            
            if (botResponse.ok) {
              const botData = await botResponse.json();
              botGuilds = botData.guilds || [];
              console.log('✅ Bot is in', botGuilds.length, 'guilds');
            }
          } catch (error) {
            console.log('⚠️ Could not fetch bot guilds:', error.message);
          }

          // Build servers list. If bot guilds are available, mark hasBot for matching guilds.
          const enhancedServers = sessionGuilds.map(userGuild => {
            const botGuild = botGuilds.find(bg => bg.id === userGuild.id);
            const hasBot = !!botGuild;

            return {
              id: userGuild.id,
              name: userGuild.name,
              icon: userGuild.icon ? `https://cdn.discordapp.com/icons/${userGuild.id}/${userGuild.icon}.png` : null,
              memberCount: botGuild?.memberCount || 0,
              onlineMembers: botGuild?.onlineMembers || 0,
              botPermissions: botGuild?.botPermissions || ['ADMINISTRATOR'],
              features: botGuild?.features || [],
              isOwner: userGuild.owner,
              canManage: true,
              hasBot,
              botOnline: hasBot,
            };
          });

          const anyWithBot = enhancedServers.some(s => s.hasBot);

          return res.status(200).json({
            success: true,
            servers: enhancedServers,
            totalServers: enhancedServers.length,
            source: anyWithBot ? 'user_session_with_bot' : 'user_session_no_bot',
            user: authData.user,
            message: anyWithBot
              ? undefined
              : 'Showing servers you can manage. Add Skyfall to a server to enable live controls.'
          });
        }
      } catch (error) {
        console.error('Session parse error:', error);
      }
    }
    
    const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3004';
    
    // Try to get real server data from Pi bot
    try {
      const response = await fetch(`${PI_BOT_URL}/api/guilds`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'Skyfall-Dashboard/1.0'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Enhanced server data with additional info
        const enhancedServers = data.guilds?.map(guild => ({
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          memberCount: guild.memberCount || Math.floor(Math.random() * 1000) + 50,
          onlineMembers: guild.onlineMembers || Math.floor(Math.random() * 200) + 10,
          botPermissions: guild.botPermissions || ['ADMINISTRATOR'],
          features: guild.features || ['COMMUNITY', 'MODERATION'],
          region: guild.region || 'us-east',
          verificationLevel: guild.verificationLevel || 2,
          boostLevel: guild.boostLevel || 0,
          boostCount: guild.boostCount || 0,
          isOwner: guild.isOwner || false,
          canManage: guild.canManage !== false,
          joinedAt: guild.joinedAt || new Date().toISOString(),
          lastActivity: guild.lastActivity || new Date().toISOString()
        })) || [];

        // If Pi bot has at least one guild, return them. If it's empty,
        // fall through to the premium fallback servers below so the
        // dashboard never sees an empty list just because guilds
        // haven't been synced yet.
        if (enhancedServers.length > 0) {
          return res.status(200).json({
            success: true,
            servers: enhancedServers,
            totalServers: enhancedServers.length,
            source: 'pi_bot'
          });
        } else {
          console.log('⚠️ Pi bot responded but returned 0 guilds - falling back to premium demo servers');
        }
      }
    } catch (error) {
      console.log('⚠️ Pi bot unavailable, using premium fallback servers');
    }

    // Premium fallback servers for demo/development (disabled in production)
    if (process.env.NODE_ENV !== 'production') {
      const premiumFallbackServers = [
        {
          id: '1234567890123456789',
          name: 'Skyfall Community',
          icon: 'https://cdn.discordapp.com/icons/1234567890123456789/example.png',
          memberCount: 1247,
          onlineMembers: 342,
          botPermissions: ['ADMINISTRATOR', 'MANAGE_MESSAGES', 'KICK_MEMBERS'],
          features: ['COMMUNITY', 'MODERATION', 'PREMIUM'],
          region: 'us-east',
          verificationLevel: 3,
          boostLevel: 2,
          boostCount: 14,
          isOwner: true,
          canManage: true,
          joinedAt: '2024-01-15T10:30:00Z',
          lastActivity: new Date().toISOString(),
          description: 'Main community server with full moderation suite'
        },
        {
          id: '9876543210987654321',
          name: 'Gaming Hub',
          icon: 'https://cdn.discordapp.com/icons/9876543210987654321/gaming.png',
          memberCount: 856,
          onlineMembers: 178,
          botPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
          features: ['GAMING', 'VOICE_CHANNELS'],
          region: 'us-west',
          verificationLevel: 2,
          boostLevel: 1,
          boostCount: 7,
          isOwner: false,
          canManage: true,
          joinedAt: '2024-02-20T14:15:00Z',
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          description: 'Gaming community with event management'
        },
        {
          id: '5555666677778888999',
          name: 'Developer Workspace',
          icon: 'https://cdn.discordapp.com/icons/5555666677778888999/dev.png',
          memberCount: 423,
          onlineMembers: 89,
          botPermissions: ['ADMINISTRATOR'],
          features: ['DEVELOPER', 'COMMUNITY', 'THREADS'],
          region: 'europe',
          verificationLevel: 4,
          boostLevel: 3,
          boostCount: 28,
          isOwner: false,
          canManage: true,
          joinedAt: '2024-03-10T09:45:00Z',
          lastActivity: new Date(Date.now() - 7200000).toISOString(),
          description: 'Professional development team coordination'
        },
        {
          id: '1111222233334444555',
          name: 'Art & Creative',
          icon: 'https://cdn.discordapp.com/icons/1111222233334444555/art.png',
          memberCount: 692,
          onlineMembers: 156,
          botPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES'],
          features: ['COMMUNITY', 'CREATIVE'],
          region: 'us-central',
          verificationLevel: 1,
          boostLevel: 1,
          boostCount: 5,
          isOwner: false,
          canManage: true,
          joinedAt: '2024-04-05T16:20:00Z',
          lastActivity: new Date(Date.now() - 1800000).toISOString(),
          description: 'Creative community for artists and designers'
        },
        {
          id: '7777888899990000111',
          name: 'Study Group',
          icon: 'https://cdn.discordapp.com/icons/7777888899990000111/study.png',
          memberCount: 234,
          onlineMembers: 67,
          botPermissions: ['MANAGE_MESSAGES', 'MUTE_MEMBERS'],
          features: ['EDUCATION', 'STUDY_GROUPS'],
          region: 'asia',
          verificationLevel: 2,
          boostLevel: 0,
          boostCount: 0,
          isOwner: true,
          canManage: true,
          joinedAt: '2024-05-12T11:30:00Z',
          lastActivity: new Date(Date.now() - 900000).toISOString(),
          description: 'Educational server for collaborative learning'
        }
      ];

      return res.status(200).json({
        success: true,
        servers: premiumFallbackServers,
        totalServers: premiumFallbackServers.length,
        source: 'fallback',
        message: 'Using premium demo servers - connect Pi bot for real data'
      });
    }

    // In production, if we reach here there is no real data available
    return res.status(200).json({
      success: true,
      servers: [],
      totalServers: 0,
      source: 'none',
      message: 'No servers available - log in with Discord and connect the KSyfall bot to your servers for live data'
    });

  } catch (error) {
    console.error('Server list error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch servers',
      message: error.message
    });
  }
}
