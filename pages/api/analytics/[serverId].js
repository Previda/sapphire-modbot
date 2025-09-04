export default async function handler(req, res) {
  const { serverId } = req.query;
  
  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' });
  }

  try {
    // Fetch analytics data from bot API
    const botApiUrl = process.env.PI_BOT_API_URL || 'http://localhost:3001';
    const botToken = process.env.PI_BOT_TOKEN || 'default_token';
    
    const response = await fetch(`${botApiUrl}/analytics/${serverId}`, {
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const analyticsData = await response.json();
      return res.status(200).json(analyticsData);
    } else {
      // Fallback to basic system stats if bot API unavailable
      const fallbackData = {
        uptime: '0%',
        uptimeStatus: 'Offline',
        responseTime: '0ms',
        responseStatus: 'No connection',
        memoryUsage: '0MB',
        memoryPercent: '0%',
        cpuUsage: '0%',
        cpuStatus: 'Unknown',
        topCommands: [],
        messagesPerDay: 0,
        activeUsers: 0,
        voiceSessions: 0,
        modActions: 0,
        ticketsCreated: 0,
        errorLogs: []
      };
      
      return res.status(200).json(fallbackData);
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    
    // Return offline state with basic structure
    return res.status(200).json({
      uptime: '0%',
      uptimeStatus: 'Connection Error',
      responseTime: 'N/A',
      responseStatus: 'Error',
      memoryUsage: 'N/A',
      memoryPercent: 'N/A',
      cpuUsage: 'N/A',
      cpuStatus: 'Error',
      topCommands: [],
      messagesPerDay: 0,
      activeUsers: 0,
      voiceSessions: 0,
      modActions: 0,
      ticketsCreated: 0,
      errorLogs: [{
        error: 'Failed to connect to bot API',
        level: 'ERROR',
        timestamp: new Date().toLocaleString(),
        command: 'Analytics'
      }]
    });
  }
}
