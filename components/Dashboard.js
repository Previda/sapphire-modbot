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
            <div className="flex items-center space-x-6">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <span>🏠</span>
                <span>Server</span>
              </h2>
              <div className="relative">
                <select 
                  value={selectedServer?.id || ''} 
                  onChange={(e) => {
                    const guild = userGuilds.find(g => g.id === e.target.value)
                    if (guild?.isCreateButton) {
                      window.open('https://discord.com/channels/@me', '_blank')
                      return
                    }
                    setSelectedServer(guild)
                  }}
                  className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl px-6 py-4 text-white font-medium min-w-[450px] focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none backdrop-blur-sm transition-all duration-200 hover:border-purple-400/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-900 text-gray-300">🔍 Select a server you can manage</option>
                  {userGuilds.map(guild => (
                    <option key={guild.id} value={guild.id} className="bg-gray-900 text-white">
                      🏛️ {guild.name} • {guild.userRole} • {guild.hasSkyfall ? '✅' : '❌'} • {guild.memberCount} members
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedServer && (
                <div className="text-right">
                  <p className="text-white/80 font-medium">{selectedServer.userRole}</p>
                  <p className="text-white/60 text-sm">{selectedServer.canManageBot ? 'Can Edit Commands' : 'View Only'}</p>
                </div>
              )}
              
              {selectedServer && !selectedServer.hasSkyfall && (
                <button 
                  onClick={() => {
                    if (selectedServer.isCreateButton) {
                      window.open('https://discord.com/channels/@me', '_blank')
                    } else {
                      window.open(`https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands&guild_id=${selectedServer.id}`, '_blank')
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
                >
                  {selectedServer.isCreateButton ? 'Create Discord Server' : `Add Skyfall to ${selectedServer.name}`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-2 mb-8 border border-white/10">
          <nav className="flex space-x-2">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'music', name: 'Music', icon: '🎵' },
              { id: 'moderation', name: 'Moderation', icon: '🛡️' },
              { id: 'cases', name: 'Cases', icon: '📋' },
              { id: 'tickets', name: 'Tickets', icon: '🎫' },
              { id: 'logs', name: 'Logs', icon: '📜' },
              { id: 'commands', name: 'Commands', icon: '⚙️' },
              { id: 'analytics', name: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <TabButton 
                key={tab.id}
                active={activeTab === tab.id} 
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
              >
                {tab.name}
              </TabButton>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && <OverviewTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'music' && <MusicTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'moderation' && <ModerationTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'cases' && <CasesTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'tickets' && <TicketsTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'logs' && <LogsTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'commands' && <CommandsTab selectedServer={selectedServer} liveData={liveData} />}
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
              <span className="text-white/80">{selectedServer.memberCount || 0} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Members Online" 
          value={selectedServer.onlineMembers || 0} 
          icon="👥" 
          trend={selectedServer.onlineMembers > 0 ? "Live" : "No data"}
          color="green"
        />
        <StatCard 
          title="Commands Today" 
          value={liveData.stats?.commandsToday || 0} 
          icon="⚡" 
          trend={liveData.stats?.commandsToday > 0 ? "+8" : "No data"}
          color="blue"
        />
        <StatCard 
          title="Active Cases" 
          value={liveData.moderation?.cases?.length || 0} 
          icon="📋" 
          trend={liveData.moderation?.cases?.length > 0 ? `${liveData.moderation.cases.filter(c => c.status === 'pending').length} pending` : "No cases"}
          color="purple"
        />
        <StatCard 
          title="Open Tickets" 
          value={liveData.tickets?.active?.length || 0} 
          icon="🎫" 
          trend={liveData.tickets?.active?.length > 0 ? `${liveData.tickets.active.length} active` : "No tickets"}
          color="yellow"
        />
      </div>

      {/* Activity Feed */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {liveData.logs?.recent?.length > 0 ? (
            liveData.logs.recent.map((activity, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 bg-black/20 rounded-xl">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white">{activity.action}</p>
                  <p className="text-white/60 text-sm">{activity.user} • {new Date(activity.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-white/60">No recent activity data available</p>
              <p className="text-white/40 text-sm">Activity will appear here once the bot starts logging events</p>
            </div>
          )}
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
          {(liveData.moderation?.recentActions || []).map((action, i) => (
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

function CommandsTab({ selectedServer, liveData }) {
  const [editingCommand, setEditingCommand] = useState(null)
  
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="⚙️" title="Commands Unavailable" message="Add Skyfall to server to manage commands" />
  }

  const commands = [
    { id: 'play', name: '/play', description: 'Play music from YouTube or Spotify', category: 'Music', enabled: true, cooldown: 3, permissions: ['everyone'] },
    { id: 'skip', name: '/skip', description: 'Skip current song', category: 'Music', enabled: true, cooldown: 1, permissions: ['everyone'] },
    { id: 'ban', name: '/ban', description: 'Ban a member from the server', category: 'Moderation', enabled: true, cooldown: 0, permissions: ['ban_members'] },
    { id: 'kick', name: '/kick', description: 'Kick a member from the server', category: 'Moderation', enabled: true, cooldown: 0, permissions: ['kick_members'] },
    { id: 'warn', name: '/warn', description: 'Warn a member', category: 'Moderation', enabled: true, cooldown: 2, permissions: ['moderate_members'] },
    { id: 'mute', name: '/mute', description: 'Timeout a member', category: 'Moderation', enabled: selectedServer.canManageBot, cooldown: 1, permissions: ['moderate_members'] },
    { id: 'help', name: '/help', description: 'Show bot commands and help', category: 'Utility', enabled: true, cooldown: 5, permissions: ['everyone'] }
  ]

  const toggleCommand = (commandId) => {
    if (!selectedServer.canManageBot) return
    // This would connect to Pi bot API to toggle command
    console.log(`Toggling command ${commandId} for server ${selectedServer.id}`)
  }

  const editCommand = (command) => {
    if (!selectedServer.canManageBot) return
    setEditingCommand(command)
  }

  return (
    <div className="space-y-6">
      {/* Permission Notice */}
      {!selectedServer.canManageBot && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-yellow-400 font-medium">View Only Access</p>
              <p className="text-yellow-300/80 text-sm">You need Administrator or Manage Server permissions to edit commands</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Server Commands</h2>
          <div className="flex items-center space-x-3">
            <span className="text-white/60">Role: {selectedServer.userRole}</span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedServer.canManageBot ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {selectedServer.canManageBot ? 'Can Edit' : 'Read Only'}
            </div>
          </div>
        </div>
        
        <div className="grid gap-4">
          {commands.map((cmd, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div className="flex items-center space-x-4">
                <code className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg font-mono font-bold">
                  {cmd.name}
                </code>
                <div>
                  <p className="text-white font-medium">{cmd.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-white/60 text-sm">{cmd.category}</span>
                    <span className="text-white/60 text-sm">•</span>
                    <span className="text-white/60 text-sm">Cooldown: {cmd.cooldown}s</span>
                    <span className="text-white/60 text-sm">•</span>
                    <span className="text-white/60 text-sm">Perms: {cmd.permissions.join(', ')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  cmd.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {cmd.enabled ? 'Enabled' : 'Disabled'}
                </span>
                {selectedServer.canManageBot ? (
                  <>
                    <button 
                      onClick={() => toggleCommand(cmd.id)}
                      className="text-white/60 hover:text-white transition-colors"
                      title={cmd.enabled ? 'Disable command' : 'Enable command'}
                    >
                      {cmd.enabled ? '🔴' : '🟢'}
                    </button>
                    <button 
                      onClick={() => editCommand(cmd)}
                      className="text-white/60 hover:text-white transition-colors"
                      title="Edit command settings"
                    >
                      ⚙️
                    </button>
                  </>
                ) : (
                  <span className="text-white/40">🔒</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CasesTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="📋" title="Cases Unavailable" message="Add Skyfall to server to view moderation cases" />
  }

  const cases = liveData.moderation?.cases || []

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Moderation Cases</h2>
          <div className="flex items-center space-x-3">
            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
              {cases.filter(c => c.status === 'pending').length} Pending
            </span>
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
              {cases.filter(c => c.status === 'investigating').length} Active
            </span>
          </div>
        </div>
        
        <div className="grid gap-4">
          {cases.map((modCase, i) => (
            <div key={i} className="bg-black/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    modCase.status === 'pending' ? 'bg-yellow-400' : 
                    modCase.status === 'investigating' ? 'bg-blue-400' : 'bg-green-400'
                  }`}></div>
                  <div>
                    <h3 className="text-white font-bold">{modCase.caseId}</h3>
                    <p className="text-white/60 text-sm">{modCase.type} • {modCase.priority} priority</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  modCase.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  modCase.status === 'investigating' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {modCase.status}
                </span>
              </div>
              <p className="text-white mb-3">{modCase.reason}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-white/60">User: <span className="text-white">{modCase.user}</span></span>
                  <span className="text-white/60">Assigned: <span className="text-white">{modCase.assignedTo}</span></span>
                </div>
                <span className="text-white/60">{new Date(modCase.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {cases.length === 0 && (
            <div className="text-center py-8">
              <span className="text-white/50 text-lg">No active cases</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TicketsTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="🎫" title="Tickets Unavailable" message="Add Skyfall to server to view support tickets" />
  }

  const tickets = liveData.tickets?.active || []

  return (
    <div className="space-y-6">
      {/* Ticket Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Tickets" 
          value={tickets.length} 
          icon="🎫" 
          color="blue"
        />
        <StatCard 
          title="Resolved Today" 
          value={liveData.tickets?.resolvedToday || 0} 
          icon="✅" 
          color="green"
        />
        <StatCard 
          title="Avg Response Time" 
          value={`${liveData.tickets?.avgResponseTime || 0}m`} 
          icon="⏱️" 
          color="purple"
        />
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Support Tickets</h2>
        
        <div className="grid gap-4">
          {tickets.map((ticket, i) => (
            <div key={i} className="bg-black/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    ticket.status === 'open' ? 'bg-green-400' : 
                    ticket.status === 'in-progress' ? 'bg-blue-400' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <h3 className="text-white font-bold">{ticket.ticketId}</h3>
                    <p className="text-white/60 text-sm">{ticket.category} • {ticket.priority} priority</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.status === 'open' ? 'bg-green-500/20 text-green-400' :
                  ticket.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-white mb-3">{ticket.subject}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-white/60">User: <span className="text-white">{ticket.user}</span></span>
                  <span className="text-white/60">Assigned: <span className="text-white">{ticket.assignedTo}</span></span>
                </div>
                <span className="text-white/60">
                  Last activity: {new Date(ticket.lastActivity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="text-center py-8">
              <span className="text-white/50 text-lg">No active tickets</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LogsTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="📜" title="Logs Unavailable" message="Add Skyfall to server to view activity logs" />
  }

  const logs = liveData.logs?.recent || []

  return (
    <div className="space-y-6">
      {/* Log Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard 
          title="Events Today" 
          value={liveData.logs?.totalToday || 0} 
          icon="📊" 
          color="blue"
        />
        <StatCard 
          title="Errors" 
          value={liveData.logs?.errorCount || 0} 
          icon="🚨" 
          color="red"
        />
        <StatCard 
          title="Warnings" 
          value={liveData.logs?.warningCount || 0} 
          icon="⚠️" 
          color="yellow"
        />
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Activity Logs</h2>
        
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  log.type === 'command' ? 'bg-blue-400' :
                  log.type === 'moderation' ? 'bg-red-400' :
                  log.type === 'join' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <div>
                  <p className="text-white font-medium">{log.action}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-white/60">User: <span className="text-white">{log.user}</span></span>
                    <span className="text-white/60">Channel: <span className="text-white">{log.channel}</span></span>
                    {log.details && <span className="text-white/60">Details: <span className="text-white">{log.details}</span></span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-white/60 text-sm">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <p className="text-white/40 text-xs capitalize">{log.type}</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-8">
              <span className="text-white/50 text-lg">No recent activity</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CommandsTab({ selectedServer, liveData }) {
  const [editingCommand, setEditingCommand] = useState(null)
  const [commands, setCommands] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fetch real commands from Discord API
  useEffect(() => {
    if (selectedServer?.hasSkyfall) {
      fetchCommands()
    }
  }, [selectedServer])

  const fetchCommands = async () => {
    try {
      const response = await fetch(`/api/commands/${selectedServer.id}`)
      if (response.ok) {
        const data = await response.json()
        setCommands(data.commands || [])
      }
    } catch (error) {
      console.error('Failed to fetch commands:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCommand = async (command) => {
    if (!selectedServer.canManageBot) return
    
    try {
      const response = await fetch(`/api/commands/${selectedServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: command.id,
          enabled: !command.enabled
        })
      })
      
      if (response.ok) {
        setCommands(commands.map(cmd => 
          cmd.id === command.id ? {...cmd, enabled: !cmd.enabled} : cmd
        ))
      }
    } catch (error) {
      console.error('Failed to toggle command:', error)
    }
  }

  const updateCooldown = async (command, newCooldown) => {
    if (!selectedServer.canManageBot) return
    
    try {
      const response = await fetch(`/api/commands/${selectedServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: command.id,
          cooldown: newCooldown
        })
      })
      
      if (response.ok) {
        setCommands(commands.map(cmd => 
          cmd.id === command.id ? {...cmd, cooldown: newCooldown} : cmd
        ))
        setEditingCommand(null)
      }
    } catch (error) {
      console.error('Failed to update cooldown:', error)
    }
  }
  
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="⚙️" title="Commands Unavailable" message="Add Skyfall to server to manage commands" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  const categories = [...new Set(commands.map(cmd => cmd.category))]

  return (
    <div className="space-y-6">
      {/* Command Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Commands" 
          value={commands.length} 
          icon="⚡" 
          color="blue"
        />
        <StatCard 
          title="Commands Used Today" 
          value={commands.reduce((sum, cmd) => sum + (cmd.usage || 0), 0)} 
          icon="📊" 
          color="green"
        />
        <StatCard 
          title="Active Commands" 
          value={commands.filter(cmd => cmd.enabled).length} 
          icon="✅" 
          color="purple"
        />
        <StatCard 
          title="Categories" 
          value={categories.length} 
          icon="📂" 
          color="orange"
        />
      </div>

      {/* Command Categories */}
      {categories.map(category => {
        const categoryCommands = commands.filter(cmd => cmd.category === category)
        
        return (
          <div key={category} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{category} Commands</h2>
              <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl border border-blue-500/30 transition-all duration-200">
                ⚙️ Settings
              </button>
            </div>
            
            <div className="grid gap-4">
              {categoryCommands.map((command, i) => (
                <div key={command.id || i} className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${command.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <h3 className="text-white font-bold text-lg">/{command.name}</h3>
                        <p className="text-white/60">Used {command.usage || 0} times</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {editingCommand?.id === command.id ? (
                        <div className="flex items-center space-x-2">
                          <input 
                            type="number" 
                            min="0" 
                            max="30"
                            defaultValue={command.cooldown}
                            className="w-16 px-2 py-1 bg-black/40 text-white rounded border border-white/20 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCooldown(command, parseInt(e.target.value))
                              }
                              if (e.key === 'Escape') {
                                setEditingCommand(null)
                              }
                            }}
                          />
                          <button 
                            onClick={() => setEditingCommand(null)}
                            className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setEditingCommand(command)}
                          className="text-white/60 text-sm hover:text-white cursor-pointer"
                        >
                          Cooldown: {command.cooldown}s
                        </button>
                      )}
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={command.enabled}
                          onChange={() => toggleCommand(command)}
                          disabled={!selectedServer.canManageBot}
                        />
                        <div className={`w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${!selectedServer.canManageBot ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}></div>
                      </label>
                      
                      <button 
                        onClick={() => setEditingCommand(command)}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all duration-200 text-sm"
                        disabled={!selectedServer.canManageBot}
                      >
                        ⚙️ Edit
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Description:</span>
                      <p className="text-white mt-1">{command.description}</p>
                    </div>
                    
                    <div>
                      <span className="text-white/60">Permissions:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {command.permissions?.map((perm, idx) => (
                          <span key={idx} className={`px-2 py-1 rounded text-xs border ${
                            perm.includes('MANAGE') || perm.includes('BAN') || perm.includes('KICK') ? 
                            'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {perm.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {categoryCommands.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-white/50 text-lg">No {category.toLowerCase()} commands</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
      
      {commands.length === 0 && (
        <div className="text-center py-20">
          <span className="text-white/50 text-xl">No commands registered</span>
          <p className="text-white/40 mt-2">Run the command registration script on your bot</p>
        </div>
      )}
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
              <span className="text-blue-400 font-bold">{liveData.memoryUsage || '234MB'}</span>
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
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30'
  }

  const trendColor = color === 'red' ? 'text-red-400 bg-red-500/20' : 
                    color === 'yellow' ? 'text-yellow-400 bg-yellow-500/20' :
                    'text-green-400 bg-green-500/20'

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 border`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${trendColor}`}>
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
