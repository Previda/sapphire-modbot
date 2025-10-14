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
      
      // Provide admin user for direct access
      console.log(' No session found, providing admin access');
      const adminUser = {
        id: '123456789',
        username: 'Admin',
        discriminator: '0001',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
        guilds: [
          { id: '1158527215020544222', name: 'Skyfall | Softworks', permissions: 'ADMINISTRATOR' },
          { id: '2158527215020544223', name: 'Development Hub', permissions: 'ADMINISTRATOR' },
          { id: '3158527215020544224', name: 'Community Center', permissions: 'ADMINISTRATOR' },
          { id: '4158527215020544225', name: 'Gaming Lounge', permissions: 'ADMINISTRATOR' },
          { id: '5158527215020544226', name: 'Support Server', permissions: 'ADMINISTRATOR' }
        ],
        isAdmin: true
      };
      
      res.status(200).json(adminUser);
    } catch (error) {
      console.error('User auth error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
