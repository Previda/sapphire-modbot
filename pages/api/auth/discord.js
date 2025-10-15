// Discord webhook error reporting
async function sendErrorToDiscord(error, context = {}) {
  const webhookUrl = process.env.DISCORD_ERROR_WEBHOOK_URL
  if (!webhookUrl) return
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "🚨 Auth Error",
          description: `**Error:** ${error.message}\n**Context:** ${JSON.stringify(context)}`,
          color: 0xff0000,
          timestamp: new Date().toISOString()
        }]
      })
    })
  } catch (e) { console.error('Webhook failed:', e) }
}

// Discord OAuth API route
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' })
  }

  try {
    const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1358527215020544222'
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'demo_secret'
    const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://skyfall-omega.vercel.app/login'

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Missing Discord OAuth credentials')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error(`User fetch failed: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    // Check if user is admin (for now, allow all users)
    const isAdmin = true; // You can add admin checking logic here

    return res.status(200).json({
      access_token: tokenData.access_token,
      user: {
        ...userData,
        isAdmin: isAdmin
      },
      isAdmin: isAdmin
    })

  } catch (error) {
    console.error('Discord OAuth error:', error)
    await sendErrorToDiscord(error, { 
      endpoint: '/api/auth/discord',
      code: code?.substring(0, 10) + '...' // Partial code for debugging
    })
    res.status(500).json({ error: 'Authentication failed' })
  }
}
