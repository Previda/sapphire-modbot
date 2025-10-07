// Generate bot invite link
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1358527215020544222';
  
  // Bot permissions (Administrator = 8)
  const permissions = '8';
  
  // Scopes for slash commands
  const scopes = 'bot%20applications.commands';
  
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes}`;
  
  res.status(200).json({
    invite_url: inviteUrl,
    client_id: clientId,
    permissions: permissions,
    scopes: 'bot applications.commands'
  });
}
