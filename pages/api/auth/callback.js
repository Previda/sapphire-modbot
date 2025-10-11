// Discord OAuth Callback - Handles login for everyone
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, error } = req.query;

  if (error) {
    console.error('Discord OAuth error:', error);
    return res.redirect('/dashboard?error=oauth_error');
  }

  if (!code) {
    return res.redirect('/dashboard?error=no_code');
  }

  try {
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1358527215020544222';
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const REDIRECT_URI = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/auth/callback`
      : 'https://skyfall-omega.vercel.app/api/auth/callback';

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();

    // Get user guilds
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    let userGuilds = [];
    if (guildsResponse.ok) {
      userGuilds = await guildsResponse.json();
    }

    // Create session data
    const sessionData = {
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar 
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`,
      guilds: userGuilds,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      loginTime: new Date().toISOString()
    };

    console.log('✅ User logged in:', userData.username);

    // Set session cookie and redirect
    res.setHeader('Set-Cookie', [
      `skyfall_session=${Buffer.from(JSON.stringify(sessionData)).toString('base64')}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    ]);

    res.redirect('/dashboard');

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/dashboard?error=auth_failed');
  }
}
