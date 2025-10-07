// Deployment status API endpoint for debugging
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        url: process.env.VERCEL_URL || 'localhost',
        deployment: process.env.VERCEL_GIT_COMMIT_SHA || 'local'
      },
      pi_connection: {
        api_url: process.env.PI_BOT_API_URL || 'not_configured',
        token_configured: !!process.env.PI_BOT_TOKEN,
        discord_configured: !!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
      },
      features: {
        dashboard: true,
        real_time_data: !!process.env.PI_BOT_API_URL,
        authentication: !!process.env.DISCORD_CLIENT_SECRET,
        nextauth: !!process.env.NEXTAUTH_SECRET
      },
      version: '2.0.0',
      last_updated: '2024-10-06'
    };

    // Test Pi connection if configured
    if (process.env.PI_BOT_API_URL && process.env.PI_BOT_TOKEN) {
      try {
        const piResponse = await fetch(`${process.env.PI_BOT_API_URL}/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.PI_BOT_TOKEN}`
          },
          timeout: 5000
        });
        
        status.pi_connection.status = piResponse.ok ? 'connected' : 'error';
        status.pi_connection.response_time = Date.now();
      } catch (error) {
        status.pi_connection.status = 'offline';
        status.pi_connection.error = error.message;
      }
    } else {
      status.pi_connection.status = 'not_configured';
    }

    res.status(200).json(status);
  } catch (error) {
    console.error('Deployment status error:', error);
    res.status(500).json({ 
      error: 'Failed to get deployment status',
      message: error.message 
    });
  }
}
