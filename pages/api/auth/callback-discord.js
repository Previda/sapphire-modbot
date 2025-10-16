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
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback`
      : 'https://skyfall-omega.vercel.app/api/auth/callback';

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

    // Filter guilds where user has admin permissions
    const adminGuilds = guildsData.filter(guild => {
      const permissions = parseInt(guild.permissions);
      const hasAdmin = (permissions & 0x8) === 0x8; // Administrator permission
      const hasManageGuild = (permissions & 0x20) === 0x20; // Manage Server permission
      return hasAdmin || hasManageGuild;
    });

    // Store user data in session/cookie
    const authData = {
      user: {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
      },
      guilds: adminGuilds.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner,
        permissions: guild.permissions,
      })),
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
