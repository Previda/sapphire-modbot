// Get current user session
export default async function handler(req, res) {
  try {
    // Get session from cookie
    const cookies = req.headers.cookie || '';
    const authCookie = cookies.split(';').find(c => c.trim().startsWith('skyfall_auth='));
    
    if (!authCookie) {
      return res.status(200).json({
        authenticated: false,
        user: null,
        guilds: [],
      });
    }

    const authData = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
    
    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - (authData.timestamp || 0);
    if (sessionAge > 86400000) {
      // Session expired
      res.setHeader('Set-Cookie', 'skyfall_auth=; Path=/; Max-Age=0');
      return res.status(200).json({
        authenticated: false,
        user: null,
        guilds: [],
        expired: true,
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: authData.user,
      guilds: authData.guilds,
      isAdmin: authData.isAdmin,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return res.status(200).json({
      authenticated: false,
      user: null,
      guilds: [],
      error: 'Invalid session',
    });
  }
}
