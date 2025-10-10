import { NextApiRequest, NextApiResponse } from 'next';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DASHBOARD_API_URL + '/api/auth/callback';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Redirect to Discord OAuth
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    
    res.redirect(discordAuthUrl);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}