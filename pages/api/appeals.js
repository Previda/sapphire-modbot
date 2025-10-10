export default async function handler(req, res) {
  const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3005';
  const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN;

  try {
    if (req.method === 'GET') {
      // Fetch appeals from Pi bot or return mock data
      const mockAppeals = [
        {
          id: 1,
          type: 'Ban',
          reason: 'I was wrongfully banned for spam. I was just sharing helpful links.',
          status: 'pending',
          userId: '123456789',
          username: 'User123',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          serverId: '1',
          serverName: 'Skyfall | Softworks'
        },
        {
          id: 2,
          type: 'Mute',
          reason: 'The mute was too harsh for a minor offense. I apologize for my behavior.',
          status: 'approved',
          userId: '987654321',
          username: 'User456',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          serverId: '1',
          serverName: 'Skyfall | Softworks'
        },
        {
          id: 3,
          type: 'Kick',
          reason: 'I was kicked by mistake during a raid cleanup.',
          status: 'denied',
          userId: '456789123',
          username: 'User789',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          serverId: '2',
          serverName: 'Development Hub'
        }
      ];

      res.status(200).json({ success: true, appeals: mockAppeals });

    } else if (req.method === 'POST') {
      // Submit new appeal
      const { type, reason, serverId } = req.body;
      
      if (!type || !reason || !serverId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // In production, save to database via Pi bot API
      const newAppeal = {
        id: Date.now(),
        type,
        reason,
        status: 'pending',
        userId: '123456789', // Get from auth
        username: 'Current User',
        createdAt: new Date().toISOString(),
        serverId,
        serverName: 'Server Name'
      };

      res.status(201).json({ success: true, appeal: newAppeal });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Appeals API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
