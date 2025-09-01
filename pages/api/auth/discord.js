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
    
    // Return mock authentication success for testing
    const mockUserData = {
      id: '123456789012345678',
      username: 'SkyfallCommander',
      discriminator: '0001',
      avatar: '85a9f0e7d71aa4a53deef52b58a42c43'
    }
    
    const mockGuildsData = [
      {
        id: '1234567890123456789',
        name: 'Skyfall Test Server',
        icon: null,
        owner: true,
        permissions: '8'
      }
    ]
    
    // Return success response immediately
    return res.status(200).json({
      access_token: 'skyfall_token_' + Date.now(),
      user: mockUserData,
      guilds: mockGuildsData,
    })

  } catch (error) {
    console.error('Discord OAuth error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
