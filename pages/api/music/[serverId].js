export default async function handler(req, res) {
  const { serverId } = req.query;
  
  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' });
  }

  try {
    // Fetch music data from bot API
    const botApiUrl = process.env.PI_BOT_API_URL || 'http://localhost:3001';
    const botToken = process.env.PI_BOT_TOKEN || 'default_token';
    
    const response = await fetch(`${botApiUrl}/music/status/${serverId}`, {
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const musicData = await response.json();
      return res.status(200).json(musicData);
    } else {
      // Fallback to demo data if bot API unavailable
      return res.status(200).json({
        connected: false,
        isPlaying: false,
        currentSong: null,
        queue: [],
        volume: 0,
        loopMode: 'Off',
        stats: {
          songsToday: 0
        }
      });
    }
  } catch (error) {
    console.error('Music API error:', error);
    
    // Return offline state
    return res.status(200).json({
      connected: false,
      isPlaying: false,
      currentSong: null,
      queue: [],
      volume: 0,
      loopMode: 'Off',
      stats: {
        songsToday: 0
      }
    });
  }
}
