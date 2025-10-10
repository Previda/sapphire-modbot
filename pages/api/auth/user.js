export default async function handler(req, res) {
  if (req.method === 'GET') {
    // For demo purposes, return a mock user
    // In production, this would validate JWT tokens or session cookies
    
    const mockUser = {
      id: '123456789',
      username: 'Previda',
      discriminator: '0001',
      avatar: 'https://cdn.discordapp.com/avatars/123456789/avatar.png',
      guilds: [
        { id: '1', name: 'Skyfall | Softworks', permissions: 'ADMINISTRATOR' },
        { id: '2', name: 'Development Hub', permissions: 'MANAGE_GUILD' }
      ]
    };

    // Check if user is authenticated (mock check)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // Return mock user for demo - in production, return 401
      return res.status(200).json(mockUser);
    }

    res.status(200).json(mockUser);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
