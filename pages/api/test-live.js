export default function handler(req, res) {
  const serverId = "1340417327518191697";
  
  // Return same structure as live endpoint but with test data
  const testData = {
    serverId,
    lastUpdated: new Date().toISOString(),
    source: 'test-endpoint',
    stats: {
      memberCount: 1543,
      onlineMembers: 327,
      botUptime: Math.floor((Date.now() - 1640995200000) / 1000),
      commandsToday: 156,
      serverHealth: 98,
      messagesPerHour: 45,
      activeChannels: 8
    },
    music: {
      isPlaying: false,
      currentSong: null,
      queue: [],
      volume: 75,
      repeat: 'off',
      shuffle: false
    },
    moderation: {
      recentActions: [],
      automodStats: {
        messagesScanned: 2340,
        actionsToday: 12,
        blockedSpam: 8,
        filteredWords: 4,
        autoTimeouts: 2
      }
    }
  }
  
  res.status(200).json(testData)
}
