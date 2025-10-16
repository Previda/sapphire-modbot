// Discord OAuth Authentication API
export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    // Redirect to Discord OAuth with full permissions
    const clientId = process.env.DISCORD_CLIENT_ID || '1358527215020544222';
    const redirectUri = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback-discord`
      : 'https://skyfall-omega.vercel.app/api/auth/callback-discord';
    
    // Request full permissions: identity, guilds, email, guild member data
    const scope = 'identify guilds guilds.members.read email';
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=none`;
    
    return res.redirect(discordAuthUrl);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
