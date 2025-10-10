export default async function handler(req, res) {
  const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3005';
  const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN;

  try {
    if (req.method === 'GET') {
      // Generate realistic analytics data
      const now = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          commands: Math.floor(Math.random() * 200) + 50,
          users: Math.floor(Math.random() * 100) + 20,
          messages: Math.floor(Math.random() * 1000) + 200,
          joins: Math.floor(Math.random() * 20) + 5,
          leaves: Math.floor(Math.random() * 15) + 2
        };
      });

      const commandUsage = [
        { command: 'help', count: 234, percentage: 18.5 },
        { command: 'ping', count: 445, percentage: 35.2 },
        { command: 'play', count: 156, percentage: 12.3 },
        { command: 'serverinfo', count: 78, percentage: 6.2 },
        { command: 'userinfo', count: 123, percentage: 9.7 },
        { command: 'ban', count: 45, percentage: 3.6 },
        { command: 'kick', count: 23, percentage: 1.8 },
        { command: 'ticket', count: 67, percentage: 5.3 },
        { command: 'queue', count: 134, percentage: 10.6 },
        { command: 'skip', count: 89, percentage: 7.0 }
      ];

      const serverStats = [
        {
          serverId: '1',
          serverName: 'Skyfall | Softworks',
          members: 1250,
          activeUsers: 342,
          messagesSent: 15420,
          commandsUsed: 1547,
          growthRate: 12.5
        },
        {
          serverId: '2',
          serverName: 'Development Hub',
          members: 45,
          activeUsers: 23,
          messagesSent: 892,
          commandsUsed: 234,
          growthRate: 8.3
        },
        {
          serverId: '3',
          serverName: 'Community Center',
          members: 892,
          activeUsers: 156,
          messagesSent: 8934,
          commandsUsed: 891,
          growthRate: 15.7
        },
        {
          serverId: '4',
          serverName: 'Gaming Lounge',
          members: 567,
          activeUsers: 89,
          messagesSent: 4567,
          commandsUsed: 445,
          growthRate: 6.2
        },
        {
          serverId: '5',
          serverName: 'Support Server',
          members: 234,
          activeUsers: 67,
          messagesSent: 2341,
          commandsUsed: 123,
          growthRate: 22.1
        }
      ];

      const moderationStats = {
        totalActions: 156,
        bans: 45,
        kicks: 23,
        mutes: 67,
        warnings: 21,
        autoModActions: 89,
        appealsSubmitted: 12,
        appealsApproved: 8,
        appealsDenied: 3,
        appealsPending: 1
      };

      res.status(200).json({
        success: true,
        analytics: {
          dailyStats: last7Days,
          commandUsage,
          serverStats,
          moderationStats,
          summary: {
            totalCommands: commandUsage.reduce((sum, cmd) => sum + cmd.count, 0),
            totalUsers: serverStats.reduce((sum, server) => sum + server.members, 0),
            averageGrowth: serverStats.reduce((sum, server) => sum + server.growthRate, 0) / serverStats.length,
            mostUsedCommand: commandUsage[0].command,
            mostActiveServer: serverStats[0].serverName
          }
        },
        timestamp: new Date().toISOString()
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
