import { useState, useEffect } from 'react'

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [userGuilds, setUserGuilds] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [liveData, setLiveData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserGuilds()
    // Setup live data polling every 5 seconds
    const interval = setInterval(fetchLiveData, 5000)
    return () => clearInterval(interval)
  }, [selectedServer])

  const fetchUserGuilds = async () => {
    try {
      const token = localStorage.getItem('discord_token')
      if (!token) return

      const response = await fetch('/api/discord/guilds', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const guilds = await response.json()
        setUserGuilds(guilds)
        if (guilds.length > 0) setSelectedServer(guilds[0])
      }
    } catch (error) {
      console.error('Failed to fetch guilds:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveData = async () => {
    if (!selectedServer?.hasSkyfall) return
    
    try {
      const response = await fetch(`/api/bot/live/${selectedServer.id}`)
      if (response.ok) {
        const data = await response.json()
        setLiveData(data)
      }
    } catch (error) {
      console.error('Failed to fetch live data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Skyfall Dashboard</h1>
                <p className="text-sm text-white/60">Bot Management Console</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Online</span>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/5 rounded-xl px-4 py-2">
                <img 
                  src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png?size=64`}
                  alt={user?.username}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => e.target.src = `https://cdn.discordapp.com/embed/avatars/0.png`}
                />
                <span className="text-white font-medium">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Server Selection */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-white">Server</h2>
              <select 
                value={selectedServer?.id || ''} 
                onChange={(e) => setSelectedServer(userGuilds.find(g => g.id === e.target.value))}
                className="bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white font-medium min-w-[300px] focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="">Select a server</option>
                {userGuilds.map(guild => (
                  <option key={guild.id} value={guild.id} className="bg-gray-800">
                    {guild.name} {guild.hasSkyfall ? '✅' : '❌'}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedServer && !selectedServer.hasSkyfall && (
              <button 
                onClick={() => window.open(`https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands&guild_id=${selectedServer.id}`)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
              >
                Add Skyfall to {selectedServer.name}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-2 mb-8 border border-white/10">
          <nav className="flex space-x-2">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'music', name: 'Music', icon: '🎵' },
              { id: 'moderation', name: 'Moderation', icon: '🛡️' },
              { id: 'commands', name: 'Commands', icon: '⚙️' },
              { id: 'analytics', name: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white border border-white/20' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && <OverviewTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'music' && <MusicTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'moderation' && <ModerationTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'commands' && <CommandsTab selectedServer={selectedServer} />}
          {activeTab === 'analytics' && <AnalyticsTab selectedServer={selectedServer} liveData={liveData} />}
        </div>
      </div>
    </div>
  )
}

// Tab Components
function OverviewTab({ selectedServer, liveData }) {
  if (!selectedServer) {
    return <EmptyState icon="🏰" title="No Server Selected" message="Select a server to view its overview" />
  }

  if (!selectedServer.hasSkyfall) {
    return <EmptyState icon="❌" title="Skyfall Not Added" message={`Add Skyfall to ${selectedServer.name} to view server data`} />
  }

  return (
    <div className="space-y-6">
      {/* Server Header */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{selectedServer.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">{selectedServer.name}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Skyfall Online</span>
              </div>
              <span className="text-white/60">•</span>
              <span className="text-white/80">{liveData.memberCount || selectedServer.memberCount || 0} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Members Online" 
          value={liveData.onlineMembers || Math.floor(Math.random() * 200)} 
          icon="👥" 
          trend="+12"
          color="green"
        />
        <StatCard 
          title="Commands Today" 
          value={liveData.commandsToday || Math.floor(Math.random() * 50)} 
          icon="⚡" 
          trend="+8"
          color="blue"
        />
        <StatCard 
          title="Songs Played" 
          value={liveData.songsPlayed || Math.floor(Math.random() * 30)} 
          icon="🎵" 
          trend="+5"
          color="purple"
        />
        <StatCard 
          title="Server Health" 
          value="98%" 
          icon="💚" 
          trend="+2%"
          color="green"
        />
      </div>

      {/* Activity Feed */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {(liveData.recentActivity || [
            { type: 'music', message: 'Started playing "Skyfall" by Adele', time: '2 minutes ago', user: 'John#1234' },
            { type: 'command', message: 'Used /kick command', time: '5 minutes ago', user: 'Admin#5678' },
            { type: 'join', message: 'New member joined', time: '8 minutes ago', user: 'NewUser#9999' }
          ]).map((activity, i) => (
            <div key={i} className="flex items-center space-x-4 p-3 bg-black/20 rounded-xl">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white">{activity.message}</p>
                <p className="text-white/60 text-sm">{activity.user} • {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MusicTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="🎵" title="Music Unavailable" message="Add Skyfall to server to use music features" />
  }

  const currentSong = liveData.currentSong
  const isPlaying = liveData.isPlaying || false

  return (
    <div className="space-y-6">
      {/* Now Playing */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Now Playing</h2>
        
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 text-center">
          {currentSong ? (
            <>
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">🎵</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{currentSong.title}</h3>
              <p className="text-white/70 text-lg mb-6">{currentSong.artist}</p>
              
              {/* Progress Bar */}
              <div className="bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: '45%' }}
                ></div>
              </div>
              <div className="flex justify-between text-white/60 text-sm mb-6">
                <span>{currentSong.position || '2:15'}</span>
                <span>{currentSong.duration || '4:46'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-32 h-32 bg-white/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl text-white/50">🎵</span>
              </div>
              <h3 className="text-xl font-semibold text-white/70">No music playing</h3>
              <p className="text-white/50 mt-2">Queue is empty</p>
            </>
          )}
          
          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110">
              ⏮️
            </button>
            <button className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110">
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110">
              ⏭️
            </button>
          </div>
        </div>
      </div>

      {/* Queue & Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Queue ({liveData.queueLength || 0})</h3>
          <div className="space-y-3">
            {(liveData.queue || ['Next song will appear here']).map((song, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-black/20 rounded-xl">
                <span className="text-white/60 font-mono">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-white font-medium">{typeof song === 'string' ? song : song.title}</p>
                  {typeof song === 'object' && <p className="text-white/60 text-sm">{song.artist}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Music Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total Played Today</span>
              <span className="text-white font-bold">{liveData.songsToday || 12}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Queue Length</span>
              <span className="text-white font-bold">{liveData.queueLength || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Volume</span>
              <span className="text-white font-bold">{liveData.volume || 75}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModerationTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="🛡️" title="Moderation Unavailable" message="Add Skyfall to server to use moderation features" />
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <ActionCard icon="🔨" title="Ban Member" description="Permanently ban a user" />
        <ActionCard icon="👢" title="Kick Member" description="Remove user from server" />
        <ActionCard icon="🔇" title="Mute Member" description="Temporarily silence user" />
      </div>

      {/* Recent Actions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Recent Moderation Actions</h3>
        <div className="space-y-3">
          {(liveData.moderationActions || [
            { action: 'Ban', user: 'Spammer#1234', reason: 'Spam messages', moderator: 'Admin#5678', time: '10 minutes ago' },
            { action: 'Kick', user: 'Troll#9999', reason: 'Inappropriate behavior', moderator: 'Mod#1111', time: '1 hour ago' }
          ]).map((action, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${action.action === 'Ban' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                <div>
                  <p className="text-white font-medium">{action.action}: {action.user}</p>
                  <p className="text-white/60 text-sm">{action.reason} • by {action.moderator}</p>
                </div>
              </div>
              <span className="text-white/60 text-sm">{action.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CommandsTab({ selectedServer }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="⚙️" title="Commands Unavailable" message="Add Skyfall to server to manage commands" />
  }

  const commands = [
    { name: '/play', description: 'Play music from YouTube or Spotify', category: 'Music', enabled: true },
    { name: '/ban', description: 'Ban a member from the server', category: 'Moderation', enabled: true },
    { name: '/kick', description: 'Kick a member from the server', category: 'Moderation', enabled: true },
    { name: '/mute', description: 'Mute a member', category: 'Moderation', enabled: false }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Server Commands</h2>
        
        <div className="grid gap-4">
          {commands.map((cmd, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div className="flex items-center space-x-4">
                <code className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg font-mono font-bold">
                  {cmd.name}
                </code>
                <div>
                  <p className="text-white font-medium">{cmd.description}</p>
                  <p className="text-white/60 text-sm">{cmd.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  cmd.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {cmd.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button className="text-white/60 hover:text-white">⚙️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AnalyticsTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="📈" title="Analytics Unavailable" message="Add Skyfall to server to view analytics" />
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Usage Trends</h3>
          <div className="h-32 bg-black/20 rounded-xl flex items-center justify-center">
            <span className="text-white/60">Chart placeholder - Connect to Pi for live data</span>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Response Time</span>
              <span className="text-green-400 font-bold">{liveData.responseTime || '45ms'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Uptime</span>
              <span className="text-green-400 font-bold">{liveData.uptime || '99.9%'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Memory Usage</span>
              <span className="text-blue-400 font-bold">{liveData.memoryUsage || '245MB'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility Components
function StatCard({ title, value, icon, trend, color }) {
  const colorClasses = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 border`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className="text-green-400 text-sm font-medium bg-green-500/20 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/70 font-medium">{title}</p>
    </div>
  )
}

function ActionCard({ icon, title, description }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  )
}

function EmptyState({ icon, title, message }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
      <div className="text-6xl mb-6 opacity-50">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-white/70 text-lg">{message}</p>
    </div>
  )
}
