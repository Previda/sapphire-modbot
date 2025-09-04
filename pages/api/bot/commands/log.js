export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { command, user, guild, timestamp } = req.body;
    
    // Validate required fields
    if (!command || !user || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields: command, user, timestamp' });
    }

    // Store command usage in memory for dashboard analytics
    if (!global.commandUsage) {
      global.commandUsage = [];
    }
    
    global.commandUsage.unshift({
      id: Date.now(),
      command,
      user,
      guild,
      timestamp
    });
    
    // Keep only last 1000 command logs
    if (global.commandUsage.length > 1000) {
      global.commandUsage = global.commandUsage.slice(0, 1000);
    }

    // Update command stats
    if (!global.commandStats) {
      global.commandStats = {};
    }
    
    if (!global.commandStats[command]) {
      global.commandStats[command] = { count: 0, lastUsed: timestamp };
    }
    
    global.commandStats[command].count++;
    global.commandStats[command].lastUsed = timestamp;

    res.status(200).json({ 
      success: true, 
      message: 'Command usage logged',
      totalCommands: global.commandUsage.length
    });
    
  } catch (error) {
    console.error('Error logging command usage:', error);
    res.status(500).json({ error: 'Failed to log command usage' });
  }
}
