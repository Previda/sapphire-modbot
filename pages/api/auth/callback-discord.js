// Discord OAuth Callback Handler
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    const clientId = process.env.DISCORD_CLIENT_ID || '1358527215020544222';
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback-discord`
      : 'https://skyfall-omega.vercel.app/api/auth/callback-discord';

    if (!clientSecret) {
      console.error('❌ DISCORD_CLIENT_SECRET not set');
      return res.redirect('/?error=missing_secret');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return res.redirect('/?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, token_type } = tokenData;

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    });

    const userData = await userResponse.json();

    // Get user's guilds
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    });

    const guildsData = await guildsResponse.json();
    
    console.log('✅ Fetched guilds from Discord:', guildsData.length);

    // Filter guilds where user has admin permissions
    const adminGuilds = guildsData.filter(guild => {
      const permissions = parseInt(guild.permissions);
      const hasAdmin = (permissions & 0x8) === 0x8; // Administrator permission
      const hasManageGuild = (permissions & 0x20) === 0x20; // Manage Server permission
      return hasAdmin || hasManageGuild;
    });
    
    console.log('✅ Admin guilds:', adminGuilds.length);
    
    // Fetch bot guilds from Pi to get additional data
    let botGuilds = [];
    try {
      const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3004';
      const botGuildsResponse = await fetch(`${PI_BOT_URL}/api/guilds`, {
        headers: { 'User-Agent': 'Skyfall-Dashboard/1.0' },
        signal: AbortSignal.timeout(3000)
      });
      if (botGuildsResponse.ok) {
        const botData = await botGuildsResponse.json();
        botGuilds = botData.guilds || [];
        console.log('✅ Fetched bot guilds:', botGuilds.length);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch bot guilds:', error.message);
    }

    // Store user data in session/cookie
    const authData = {
      user: {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
      },
      guilds: adminGuilds.map(guild => {
        // Find matching bot guild for additional data
        const botGuild = botGuilds.find(bg => bg.id === guild.id);
        return {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          owner: guild.owner,
          permissions: guild.permissions,
          // Add bot data if available
          memberCount: botGuild?.memberCount || 0,
          hasBot: !!botGuild,
          botOnline: !!botGuild,
        };
      }),
      accessToken: access_token,
      isAdmin: adminGuilds.length > 0,
      timestamp: Date.now(),
    };

    // Set session cookie
    res.setHeader('Set-Cookie', [
      `skyfall_auth=${encodeURIComponent(JSON.stringify(authData))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
    ]);

    // Redirect to dashboard
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect('/?error=auth_failed');
  }
}
