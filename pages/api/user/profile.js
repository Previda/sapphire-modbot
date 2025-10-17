export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session from cookie
    const sessionCookie = req.cookies['discord_session'];
    
    if (!sessionCookie) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Parse session data
    let authData;
    try {
      authData = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'));
    } catch (error) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Check if session is still valid (within 24 hours)
    if (!authData.timestamp || Date.now() - authData.timestamp > 24 * 60 * 60 * 1000) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Fetch additional guild data from Pi bot if available
    let enrichedGuilds = authData.guilds || [];
    
    try {
      const piResponse = await fetch(`${process.env.PI_BOT_API_URL}/api/guilds`, {
        headers: {
          'Authorization': `Bearer ${process.env.PI_BOT_API_KEY || 'default-key'}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (piResponse.ok) {
        const piData = await piResponse.json();
        const piGuilds = piData.guilds || [];

        // Enrich user guilds with Pi bot data
        enrichedGuilds = authData.guilds.map(userGuild => {
          const piGuild = piGuilds.find(g => g.id === userGuild.id);
          
          if (piGuild) {
            return {
              ...userGuild,
              memberCount: piGuild.memberCount || 0,
              onlineMembers: piGuild.onlineMembers || 0,
              hasBot: true,
              botOnline: true,
              channels: piGuild.channels || [],
              categories: piGuild.categories || []
            };
          }
          
          return {
            ...userGuild,
            hasBot: false,
            botOnline: false
          };
        });
      }
    } catch (error) {
      console.log('Could not fetch Pi bot data:', error.message);
      // Continue with user data only
    }

    // Return comprehensive profile data
    return res.status(200).json({
      success: true,
      user: {
        id: authData.user.id,
        username: authData.user.username,
        discriminator: authData.user.discriminator,
        avatar: authData.user.avatar,
        email: authData.user.email,
        banner: authData.user.banner,
        accent_color: authData.user.accent_color
      },
      guilds: {
        all: authData.allGuilds || [],
        manageable: enrichedGuilds,
        total: (authData.allGuilds || []).length,
        manageableCount: enrichedGuilds.length
      },
      permissions: {
        isAdmin: authData.isAdmin || false,
        hasManageableGuilds: enrichedGuilds.length > 0
      },
      session: {
        createdAt: new Date(authData.timestamp).toISOString(),
        expiresAt: new Date(authData.timestamp + 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message 
    });
  }
}
