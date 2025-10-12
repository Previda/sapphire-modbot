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
      
      // NO DEMO USER - Require real Discord login
      console.log(' No valid session found - authentication required');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login with Discord to access real data',
        loginUrl: '/api/auth/discord-login'
      });
    } catch (error) {
      console.error('User auth error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
