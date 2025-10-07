// Health check endpoint for Vercel dashboard
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const startTime = Date.now()
    
    // Check Pi bot connection if configured
    const piApiUrl = process.env.PI_BOT_API_URL
    const piToken = process.env.PI_BOT_TOKEN
    
    let piStatus = 'not_configured'
    let piData = null
    
    if (piApiUrl && piToken) {
      try {
        const response = await fetch(`${piApiUrl}/health`, {
          method: 'GET',
          timeout: 5000
        })
        
        if (response.ok) {
          piData = await response.json()
          piStatus = 'connected'
        } else {
          piStatus = 'error'
        }
      } catch (error) {
        piStatus = 'unreachable'
      }
    }

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      pi_status: piStatus,
      pi_data: piData,
      response_time: Date.now() - startTime
    }

    // Add cache-busting headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
