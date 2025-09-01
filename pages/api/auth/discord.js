// Discord OAuth API endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' })
  }

  try {
    console.log('🔐 Starting token exchange with Discord API...')
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || '1358527215020544222',
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://skyfall-omega.vercel.app/auth/callback',
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log('📡 Discord token response status:', tokenResponse.status)

    if (!tokenResponse.ok) {
      console.error('❌ Token exchange failed:', tokenData)
      return res.status(400).json({ 
        error: 'Failed to exchange code for token',
        details: tokenData.error_description || tokenData.error || 'Unknown error'
      })
    }

    // Get user information
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      return res.status(400).json({ error: 'Failed to fetch user data' })
    }

    // Get user guilds
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const guildsData = await guildsResponse.json()

    // Return success response
    res.status(200).json({
      access_token: tokenData.access_token,
      user: userData,
      guilds: guildsData,
    })

  } catch (error) {
    console.error('Discord OAuth error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
