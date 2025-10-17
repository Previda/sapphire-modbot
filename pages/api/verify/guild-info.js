export default async function handler(req, res) {
  const { guild } = req.query;

  if (!guild) {
    return res.status(400).json({ error: 'Guild ID required' });
  }

  try {
    // Fetch guild info from Pi bot
    const response = await fetch(`${process.env.PI_BOT_API_URL}/api/guilds/${guild}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PI_BOT_API_KEY || 'default-key'}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        id: data.id,
        name: data.name,
        icon: data.icon,
        memberCount: data.memberCount
      });
    } else {
      return res.status(404).json({ error: 'Guild not found' });
    }
  } catch (error) {
    console.error('Failed to fetch guild info:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
