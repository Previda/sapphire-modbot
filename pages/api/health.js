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
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        deployment: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local'
      },
      pi: {
        status: piStatus,
        url: piApiUrl || null,
        data: piData
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    }
    
    res.status(200).json(healthData)
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
