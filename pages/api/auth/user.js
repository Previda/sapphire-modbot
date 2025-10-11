export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Check for session cookie
      const sessionCookie = req.cookies.skyfall_session;
      
      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
          
          // Validate session (check if not expired)
          const loginTime = new Date(sessionData.loginTime);
          const now = new Date();
          const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
          
          if (hoursSinceLogin < 24) { // Session valid for 24 hours
            console.log(' Valid session for user:', sessionData.username);
            return res.status(200).json(sessionData);
          } else {
            console.log(' Session expired for user:', sessionData.username);
          }
        } catch (parseError) {
          console.error('Session parse error:', parseError);
        }
      }
      
      // No valid session - return demo user for development
      console.log(' No session found, using demo user');
      const demoUser = {
        id: '123456789',
        username: 'Demo User',
        discriminator: '0001',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
        guilds: [
          { id: '1', name: 'Skyfall | Softworks', permissions: 'ADMINISTRATOR' },
          { id: '2', name: 'Development Hub', permissions: 'MANAGE_GUILD' },
          { id: '3', name: 'Community Center', permissions: 'MANAGE_MESSAGES' },
          { id: '4', name: 'Gaming Lounge', permissions: 'MANAGE_MESSAGES' },
          { id: '5', name: 'Support Server', permissions: 'ADMINISTRATOR' }
        ],
        isDemoUser: true
      };
      
      res.status(200).json(demoUser);
    } catch (error) {
      console.error('User auth error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
