export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, guild, captchaAnswer, timeSpent, clickPattern, behaviorScore } = req.body;

  try {
    // Validate inputs
    if (!token || !guild) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check behavior score
    if (behaviorScore < 50) {
      return res.status(403).json({ error: 'Bot-like behavior detected' });
    }

    // Check time spent (must be between 5 and 300 seconds)
    if (timeSpent < 5 || timeSpent > 300) {
      return res.status(403).json({ error: 'Invalid verification time' });
    }

    // Forward to Pi bot API for verification
    const piResponse = await fetch(`${process.env.PI_BOT_API_URL}/api/verify/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PI_BOT_API_KEY || 'default-key'}`
      },
      body: JSON.stringify({
        token,
        guild,
        verified: true,
        timestamp: new Date().toISOString(),
        securityScore: behaviorScore
      })
    });

    if (piResponse.ok) {
      const data = await piResponse.json();
      return res.status(200).json({
        success: true,
        message: 'Verification complete',
        data
      });
    } else {
      const error = await piResponse.text();
      console.error('Pi bot verification failed:', error);
      return res.status(500).json({ error: 'Verification failed on server' });
    }

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
