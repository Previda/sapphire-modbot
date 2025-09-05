export default function handler(req, res) {
  res.status(200).json({
    message: 'Live API test working',
    serverId: req.query.serverId || 'none',
    timestamp: new Date().toISOString(),
    stats: {
      memberCount: 1543,
      onlineMembers: 327,
      commandsToday: 156
    }
  })
}
