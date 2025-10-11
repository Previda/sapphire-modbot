// Discord OAuth Login - Works for everyone
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1358527215020544222';
  const REDIRECT_URI = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api/auth/callback`
    : 'https://skyfall-omega.vercel.app/api/auth/callback';

  // Discord OAuth URL
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?` +
    `client_id=${DISCORD_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=identify%20guilds`;

  console.log('🔗 Discord OAuth redirect:', discordAuthUrl);
  
  // Redirect to Discord OAuth
  res.redirect(302, discordAuthUrl);
}
