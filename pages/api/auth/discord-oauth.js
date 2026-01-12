// Discord OAuth Authentication API
export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    // Redirect to Discord OAuth with full permissions
    const clientId = process.env.DISCORD_CLIENT_ID || '1358527215020544222';
    // MUST match exactly with callback-discord.js and Discord Developer Portal
    // Build redirect URL dynamically from the current request host
    const host = req.headers.host || 'localhost:3000';
    let protocol = req.headers['x-forwarded-proto'];
    if (!protocol) {
      // Use HTTP for localhost/dev, HTTPS for everything else
      if (host.includes('localhost') || host.startsWith('127.0.0.1')) {
        protocol = 'http';
      } else {
        protocol = 'https';
      }
    }
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/callback-discord`;
    
    console.log('🔐 Starting Discord OAuth...');
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    
    // Request full permissions: identity, guilds, email, guild member data
    const scope = 'identify guilds guilds.members.read email';
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    
    console.log('Redirecting to Discord...');
    return res.redirect(discordAuthUrl);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
