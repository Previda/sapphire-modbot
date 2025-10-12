// Demo Login - Bypasses Discord OAuth for testing
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create a demo session
  const demoUser = {
    id: '123456789',
    username: 'Demo User',
    discriminator: '0001',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    guilds: [
      { id: '1158527215020544222', name: 'Skyfall | Softworks', permissions: 'ADMINISTRATOR' },
      { id: '2158527215020544223', name: 'Development Hub', permissions: 'MANAGE_GUILD' },
      { id: '3158527215020544224', name: 'Community Center', permissions: 'MANAGE_MESSAGES' },
      { id: '4158527215020544225', name: 'Gaming Lounge', permissions: 'MANAGE_MESSAGES' },
      { id: '5158527215020544226', name: 'Support Server', permissions: 'ADMINISTRATOR' }
    ],
    loginTime: new Date().toISOString(),
    isDemoUser: true
  };

  console.log('✅ Demo user logged in');

  // Set session cookie
  res.setHeader('Set-Cookie', [
    `skyfall_session=${Buffer.from(JSON.stringify(demoUser)).toString('base64')}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
  ]);

  res.status(200).json({ success: true, user: demoUser });
}
