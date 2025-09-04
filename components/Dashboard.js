import { useState, useEffect } from 'react'

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [userGuilds, setUserGuilds] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [liveData, setLiveData] = useState({ stats: { commandsToday: 0 }, moderation: { cases: [] }, tickets: { active: [] } })
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [tickets, setTickets] = useState({ stats: { total: 0, open: 0, closed: 0 }, tickets: [] })
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [commands, setCommands] = useState([])
  const [editingCommand, setEditingCommand] = useState(null)
  const [showModerationModal, setShowModerationModal] = useState(null)

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

      setDataLoading(true)
      const response = await fetch('/api/discord/guilds', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserGuilds(data.guilds || [])
        if (data.guilds?.length > 0 && !selectedServer) {
          setSelectedServer(data.guilds[0])
          await fetchLiveDataForServer(data.guilds[0])
        }
      } else {
        console.error('Failed to fetch guilds')
      }
    } catch (error) {
      console.error('Error fetching guilds:', error)
    } finally {
      setDataLoading(false)
      setLoading(false)
      setInitialLoad(false)
    }
  }

  const fetchLiveDataForServer = async (server) => {
    if (!server) return
    
    try {
      setDataLoading(true)
      const [liveResponse, ticketsResponse, commandsResponse] = await Promise.all([
        fetch(`/api/bot/live/${server.id}`),
        fetch(`/api/tickets/${server.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('discord_token')}` }
        }),
        fetch(`/api/commands/${server.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('discord_token')}` }
        })
      ])
      
      if (liveResponse.ok) {
        const data = await liveResponse.json()
        setLiveData(data)
      }
      
      if (ticketsResponse.ok) {
        const ticketData = await ticketsResponse.json()
        setTickets(ticketData)
      }
      
      if (commandsResponse.ok) {
        const commandData = await commandsResponse.json()
        setCommands(commandData.commands || [])
      }
    } catch (error) {
      console.error('Error fetching live data:', error)
    } finally {
      setDataLoading(false)
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

  if (initialLoad && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏰</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Skyfall Dashboard</h1>
            <p className="text-white/60">Loading your Discord servers...</p>
          </div>

          {/* Loading Animation */}
          <div className="relative">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin" style={{animationDuration: '3s'}}></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="w-80 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-1000 ease-out" 
                     style={{width: dataLoading ? '85%' : '35%'}}></div>
              </div>
              <p className="text-white/70 text-sm font-medium">
                {dataLoading ? 'Loading server data...' : 'Connecting to Discord...'}
              </p>
            </div>
          </div>

          {/* Loading Steps */}
          <div className="space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-center space-x-4 transition-all duration-500 ease-out">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-white/80 font-medium">Discord Connected</span>
            </div>
            
            <div className="flex items-center space-x-4 transition-all duration-700 ease-out">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                dataLoading 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-400/50' 
                  : 'bg-white/20 border-2 border-white/30'
              }`}>
                {dataLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-white/60 text-sm font-bold">2</span>
                )}
              </div>
              <span className={`font-medium transition-colors duration-300 ${
                dataLoading ? 'text-white' : 'text-white/50'
              }`}>Fetching Servers</span>
            </div>
            
            <div className="flex items-center space-x-4 transition-all duration-500 ease-out">
              <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                <span className="text-white/40 text-sm font-bold">3</span>
              </div>
              <span className="text-white/40 font-medium">Loading Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Skyfall Dashboard</h1>
                <p className="text-white/60 text-sm">Discord Bot Management</p>
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
        <div className="space-y-6">
          {activeTab === 'overview' && <OverviewTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'moderation' && <ModerationTab selectedServer={selectedServer} liveData={liveData} showModerationModal={showModerationModal} setShowModerationModal={setShowModerationModal} />}
          {activeTab === 'tickets' && <TicketsTab selectedServer={selectedServer} tickets={tickets} showTicketModal={showTicketModal} setShowTicketModal={setShowTicketModal} />}
          {activeTab === 'commands' && <CommandsTab selectedServer={selectedServer} commands={commands} editingCommand={editingCommand} setEditingCommand={setEditingCommand} />}
          {activeTab === 'settings' && <SettingsTab selectedServer={selectedServer} />}
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

  // Safe defaults for all data
  const safeLiveData = liveData || { stats: {}, moderation: { cases: [] }, tickets: { active: [] }, logs: { recent: [] } }
  const safeServer = selectedServer || {}

  if (!safeServer.hasSkyfall) {
    return <EmptyState icon="❌" title="Skyfall Not Added" message={`Add Skyfall to ${safeServer.name || 'this server'} to view server data`} />
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
          value={safeServer.onlineMembers || 0} 
          icon="👥" 
          trend={(safeServer.onlineMembers || 0) > 0 ? "Live" : "Updating..."}
          color="green"
        />
        <StatCard 
          title="Commands Today" 
          value={safeLiveData.stats?.commandsToday || 0} 
          icon="⚡" 
          trend={(safeLiveData.stats?.commandsToday || 0) > 0 ? "+8" : "Ready"}
          color="blue"
        />
        <StatCard 
          title="Active Cases" 
          value={safeLiveData.moderation?.cases?.length || 0} 
          icon="📋" 
          trend={(safeLiveData.moderation?.cases?.length || 0) > 0 ? `${(safeLiveData.moderation.cases || []).filter(c => c?.status === 'pending').length} pending` : "All Clear"}
          color="purple"
        />
        <StatCard 
          title="Open Tickets" 
          value={safeLiveData.tickets?.active?.length || 0} 
          icon="🎫" 
          trend={(safeLiveData.tickets?.active?.length || 0) > 0 ? `${safeLiveData.tickets.active?.length || 0} active` : "Ready"}
          color="yellow"
        />
      </div>

      {/* Activity Feed */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {(safeLiveData.logs?.recent?.length || 0) > 0 ? (
            (safeLiveData.logs.recent || []).filter(activity => activity?.action && activity?.user).map((activity, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 bg-black/20 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'moderation' ? 'bg-red-400' :
                  activity.type === 'command' ? 'bg-blue-400' :
                  activity.type === 'join' ? 'bg-green-400' : 'bg-purple-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white">{activity.action || 'Unknown action'}</p>
                  <p className="text-white/60 text-sm">{activity.user || 'Unknown User'} • {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : 'Recently'}</p>
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

  const [musicData, setMusicData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => {
    const fetchMusicData = async () => {
      if (!selectedServer?.id) {
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch(`/api/music/${selectedServer.id}`)
        if (response.ok) {
          const data = await response.json()
          setMusicData(data)
        } else {
          setMusicData(null)
        }
      } catch (error) {
        console.error('Failed to fetch music data:', error)
        setMusicData(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMusicData()
    // Refresh music data every 5 seconds
    const interval = setInterval(fetchMusicData, 5000)
    return () => clearInterval(interval)
  }, [selectedServer?.id])
  
  const currentSong = musicData?.currentSong
  const isPlaying = musicData?.isPlaying || false
  const queue = musicData?.queue || []
  const volume = musicData?.volume || 0
  const isConnected = musicData?.connected || false
  
  const controlMusic = async (action) => {
    if (!selectedServer?.id) return
    
    try {
      await fetch(`/api/music/${selectedServer.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
    } catch (error) {
      console.error('Failed to control music:', error)
    }
  }
  
  const removeFromQueue = async (index) => {
    if (!selectedServer?.id) return
    
    try {
      await fetch(`/api/music/${selectedServer.id}/queue/${index}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to remove from queue:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Now Playing */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Now Playing</h2>
        
        {loading ? (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 text-center">
            <div className="w-32 h-32 bg-white/5 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse">
              <span className="text-4xl">🎵</span>
            </div>
            <h3 className="text-xl font-semibold text-white/70">Loading music data...</h3>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 text-center">
            {!isConnected ? (
              <>
                <div className="w-32 h-32 bg-red-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-red-500/30">
                  <span className="text-4xl">🔌</span>
                </div>
                <h3 className="text-xl font-semibold text-white/70 mb-2">Voice Channel Disconnected</h3>
                <p className="text-white/50">Bot is not connected to any voice channel</p>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                  onClick={() => window.location.reload()}
                >
                  Refresh Status
                </button>
              </>
            ) : currentSong ? (
              <>
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center relative overflow-hidden">
                  {currentSong.thumbnail ? (
                    <img src={currentSong.thumbnail} alt="Album art" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <span className="text-4xl">🎵</span>
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse rounded-2xl"></div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 truncate">{currentSong.title}</h3>
                <p className="text-white/70 text-lg mb-6 truncate">{currentSong.artist || 'Unknown Artist'}</p>
                
                {/* Progress Bar */}
                <div className="bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${currentSong.progress || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-white/60 text-sm mb-6">
                  <span>{currentSong.currentTime || '0:00'}</span>
                  <span>{currentSong.duration || '0:00'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-32 h-32 bg-white/5 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/10">
                  <span className="text-4xl text-white/30">🎵</span>
                </div>
                <h3 className="text-xl font-semibold text-white/50 mb-2">No music playing</h3>
                <p className="text-white/30">Use /play command to start music</p>
              </>
            )}
          </div>
        )}
          
          {/* Controls */}
          {!loading && (
            <div className="flex justify-center space-x-4">
              <button 
                className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isConnected || queue.length === 0}
                onClick={() => controlMusic('previous')}
                title="Previous track"
              >
                ⏮️
              </button>
              <button 
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isConnected}
                onClick={() => controlMusic(isPlaying ? 'pause' : 'resume')}
                title={isPlaying ? 'Pause' : 'Resume'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button 
                className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isConnected || queue.length === 0}
                onClick={() => controlMusic('skip')}
                title="Skip track"
              >
                ⏭️
              </button>
            </div>
          )}
      </div>

      {/* Queue & Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Queue ({queue.length})</h3>
            {queue.length > 0 && (
              <button 
                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all"
                onClick={() => controlMusic('clear')}
              >
                Clear Queue
              </button>
            )}
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                <span className="text-white/50">Loading queue...</span>
              </div>
            ) : queue.length > 0 ? queue.map((song, i) => (
              <div key={song.id || i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl hover:bg-black/30 transition-all duration-200 group">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-white/60 font-mono w-6 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{song.title}</p>
                    <p className="text-white/60 text-sm truncate">{song.artist || song.requestedBy || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-white/50 text-sm">{song.duration || '0:00'}</span>
                  <button 
                    className="text-red-400 hover:text-red-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromQueue(i)}
                    title="Remove from queue"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🎶</div>
                <h4 className="text-white/70 font-medium mb-2">Queue is empty</h4>
                <p className="text-white/50 text-sm">Use /play command to add songs</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Music Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Connection Status</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className={`font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Songs Played Today</span>
              <span className="text-white font-bold">{musicData?.stats?.songsToday || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Queue Length</span>
              <span className="text-white font-bold">{queue.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Volume</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">{volume}%</span>
                <div className="w-20 bg-white/10 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-1 rounded-full"
                    style={{ width: `${volume}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Loop Mode</span>
              <span className="text-white font-bold">{musicData?.loopMode || 'Off'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



function CasesTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="📋" title="Cases Unavailable" message="Add Skyfall to server to view moderation cases" />
  }

  const safeLiveData = liveData || { moderation: { cases: [] } }
  const cases = safeLiveData.moderation?.cases || []

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


function LogsTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="📜" title="Logs Unavailable" message="Add Skyfall to server to view activity logs" />
  }

  const safeLiveData = liveData || { logs: { recent: [], totalToday: 0, errorCount: 0, warningCount: 0 } }
  const logs = safeLiveData.logs?.recent || []

  return (
    <div className="space-y-6">
      {/* Log Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard 
          title="Events Today" 
          value={safeLiveData.logs?.totalToday || 0} 
          icon="📊" 
          color="blue"
        />
        <StatCard 
          title="Errors" 
          value={safeLiveData.logs?.errorCount || 0} 
          icon="🚨" 
          color="red"
        />
        <StatCard 
          title="Warnings" 
          value={safeLiveData.logs?.warningCount || 0} 
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
  
  // Safe defaults
  const safeServer = selectedServer || {}
  
  // Fetch real commands from Discord API
  useEffect(() => {
    if (safeServer?.hasSkyfall && safeServer.id) {
      fetchCommands()
    } else {
      // Set demo commands for display
      setCommands([
        { id: '1', name: 'ban', description: 'Ban a user from the server', category: 'moderation', enabled: true, cooldown: 5, usage: 23 },
        { id: '2', name: 'kick', description: 'Kick a user from the server', category: 'moderation', enabled: true, cooldown: 3, usage: 15 },
        { id: '3', name: 'timeout', description: 'Timeout a user', category: 'moderation', enabled: true, cooldown: 2, usage: 8 },
        { id: '4', name: 'play', description: 'Play music from YouTube', category: 'music', enabled: true, cooldown: 1, usage: 45 },
        { id: '5', name: 'skip', description: 'Skip the current song', category: 'music', enabled: true, cooldown: 0, usage: 12 },
        { id: '6', name: 'queue', description: 'Show the music queue', category: 'music', enabled: true, cooldown: 0, usage: 8 },
        { id: '7', name: 'help', description: 'Show available commands', category: 'utility', enabled: true, cooldown: 5, usage: 67 },
        { id: '8', name: 'ping', description: 'Check bot latency', category: 'utility', enabled: true, cooldown: 3, usage: 34 },
        { id: '9', name: 'avatar', description: 'Show user avatar', category: 'utility', enabled: false, cooldown: 2, usage: 5 }
      ])
      setLoading(false)
    }
  }, [safeServer])

  const fetchCommands = async () => {
    try {
      const response = await fetch(`/api/commands/${safeServer.id}`)
      if (response.ok) {
        const data = await response.json()
        setCommands(data.commands || [])
      }
    } catch (error) {
      console.error('Failed to fetch commands:', error)
      // Fallback to demo commands on error
      setCommands([
        { id: '1', name: 'ban', description: 'Ban a user from the server', category: 'moderation', enabled: true, cooldown: 5, usage: 23 },
        { id: '2', name: 'kick', description: 'Kick a user from the server', category: 'moderation', enabled: true, cooldown: 3, usage: 15 },
        { id: '3', name: 'play', description: 'Play music from YouTube', category: 'music', enabled: true, cooldown: 1, usage: 45 },
        { id: '4', name: 'help', description: 'Show available commands', category: 'utility', enabled: true, cooldown: 5, usage: 67 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleCommand = async (command) => {
    if (!safeServer.canManageBot && safeServer.id) {
      alert('You do not have permission to manage commands on this server.')
      return
    }
    
    // Optimistic update for smooth UX
    setCommands(commands.map(cmd => 
      cmd.id === command.id ? {...cmd, enabled: !cmd.enabled} : cmd
    ))
    
    if (!safeServer.id) return // Demo mode - just toggle locally
    
    try {
      const response = await fetch(`/api/commands/${safeServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: command.id,
          enabled: !command.enabled
        })
      })
      
      if (!response.ok) {
        // Revert on failure
        setCommands(commands.map(cmd => 
          cmd.id === command.id ? {...cmd, enabled: command.enabled} : cmd
        ))
        alert('Failed to update command. Please try again.')
      }
    } catch (error) {
      console.error('Failed to toggle command:', error)
      // Revert on error
      setCommands(commands.map(cmd => 
        cmd.id === command.id ? {...cmd, enabled: command.enabled} : cmd
      ))
      alert('Network error. Please check your connection.')
    }
  }

  const updateCommand = async (command, updates) => {
    if (!safeServer.canManageBot && safeServer.id) {
      alert('You do not have permission to edit commands on this server.')
      return
    }
    
    // Optimistic update
    setCommands(commands.map(cmd => 
      cmd.id === command.id ? {...cmd, ...updates} : cmd
    ))
    setEditingCommand(null)
    
    if (!safeServer.id) return // Demo mode - just update locally
    
    try {
      const response = await fetch(`/api/commands/${safeServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: command.id,
          ...updates
        })
      })
      
      if (!response.ok) {
        // Revert on failure
        setCommands(commands.map(cmd => 
          cmd.id === command.id ? command : cmd
        ))
        alert('Failed to update command. Please try again.')
      }
    } catch (error) {
      console.error('Failed to update command:', error)
      // Revert on error
      setCommands(commands.map(cmd => 
        cmd.id === command.id ? command : cmd
      ))
    }
  }
  
  if (!safeServer?.hasSkyfall) {
    return <EmptyState icon="⚙️" title="Commands Unavailable" message="Add Skyfall to server to manage commands" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  const categoryColors = {
    moderation: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    music: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    utility: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    fun: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' }
  }

  const groupedCommands = commands.reduce((acc, cmd) => {
    const category = cmd.category || 'utility'
    if (!acc[category]) acc[category] = []
    acc[category].push(cmd)
    return acc
  }, {})

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

      {/* Commands Overview */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Bot Commands</h2>
          <div className="flex items-center space-x-4">
            <span className="text-green-400 font-medium">{commands.filter(c => c.enabled).length} enabled</span>
            <span className="text-red-400 font-medium">{commands.filter(c => !c.enabled).length} disabled</span>
          </div>
        </div>

        {/* Command Categories */}
        {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
          <div key={category} className="mb-8 last:mb-0">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[category]?.bg || categoryColors.utility.bg} ${categoryColors[category]?.text || categoryColors.utility.text}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryCommands.length})
              </div>
            </div>
            
            <div className="space-y-3">
              {categoryCommands.map(command => (
                <div key={command.id} className={`bg-white/5 rounded-xl p-4 border transition-all duration-200 hover:bg-white/10 ${
                  command.enabled ? 'border-white/20' : 'border-white/5'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                        command.enabled 
                          ? (categoryColors[command.category]?.bg || categoryColors.utility.bg) + ' ' + (categoryColors[command.category]?.text || categoryColors.utility.text)
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        /{command.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-semibold text-lg">/{command.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            command.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {command.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mb-2">{command.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-white/50">
                          <span>Cooldown: {command.cooldown}s</span>
                          <span>Usage: {command.usage || 0} times</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {editingCommand === command.id ? (
                        <div className="bg-black/20 rounded-lg p-4 mt-4 border border-white/10">
                          <h4 className="text-white font-medium mb-3">Edit Command: /{command.name}</h4>
                          <div className="space-y-4">
                            {/* Description */}
                            <div>
                              <label className="block text-white/70 text-sm mb-1">Command Description</label>
                              <input
                                type="text"
                                defaultValue={command.description || ''}
                                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                placeholder="What this command does"
                                id={`desc-${command.id}`}
                              />
                            </div>
                            
                            {/* Dynamic fields based on command type */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Cooldown - for all commands */}
                              <div>
                                <label className="block text-white/70 text-sm mb-1">Cooldown (seconds)</label>
                                <select
                                  defaultValue={command.cooldown}
                                  className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                  id={`cooldown-${command.id}`}
                                >
                                  <option value="0">No cooldown</option>
                                  <option value="1">1 second</option>
                                  <option value="3">3 seconds</option>
                                  <option value="5">5 seconds</option>
                                  <option value="10">10 seconds</option>
                                  <option value="30">30 seconds</option>
                                  <option value="60">1 minute</option>
                                  <option value="300">5 minutes</option>
                                </select>
                              </div>
                              
                              {/* Alias - for all commands */}
                              <div>
                                <label className="block text-white/70 text-sm mb-1">Command Alias</label>
                                <input
                                  type="text"
                                  defaultValue={command.alias || ''}
                                  className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                  placeholder="Alternative name (optional)"
                                  id={`alias-${command.id}`}
                                />
                              </div>
                              
                              {/* Moderation-specific fields */}
                              {(['ban', 'kick', 'mute', 'warn', 'timeout'].includes(command.name.toLowerCase()) || command.category === 'moderation') && (
                                <>
                                  <div>
                                    <label className="block text-white/70 text-sm mb-1">Default Reason</label>
                                    <input
                                      type="text"
                                      defaultValue={command.defaultReason || ''}
                                      className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                      placeholder="Default moderation reason"
                                      id={`reason-${command.id}`}
                                    />
                                  </div>
                                  
                                  {/* Ban duration only for ban/timeout commands */}
                                  {(['ban', 'timeout'].includes(command.name.toLowerCase())) && (
                                    <div>
                                      <label className="block text-white/70 text-sm mb-1">Ban Duration</label>
                                      <select
                                        defaultValue={command.banDuration || 0}
                                        className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                        id={`duration-${command.id}`}
                                      >
                                        <option value="0">Permanent</option>
                                        <option value="1">1 hour</option>
                                        <option value="6">6 hours</option>
                                        <option value="12">12 hours</option>
                                        <option value="24">1 day</option>
                                        <option value="72">3 days</option>
                                        <option value="168">1 week</option>
                                        <option value="720">30 days</option>
                                      </select>
                                    </div>
                                  )}
                                </>
                              )}
                              
                              {/* Music-specific fields */}
                              {(command.category === 'music' || ['play', 'skip', 'queue', 'stop'].includes(command.name.toLowerCase())) && (
                                <>
                                  <div>
                                    <label className="block text-white/70 text-sm mb-1">Max Queue Size</label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="100"
                                      defaultValue={command.maxQueue || 50}
                                      className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                      placeholder="Maximum songs in queue"
                                      id={`maxqueue-${command.id}`}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-white/70 text-sm mb-1">DJ Role Required</label>
                                    <select
                                      defaultValue={command.djOnly || false}
                                      className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                      id={`djonly-${command.id}`}
                                    >
                                      <option value="false">Anyone can use</option>
                                      <option value="true">DJ role required</option>
                                    </select>
                                  </div>
                                </>
                              )}
                              
                              {/* Utility commands */}
                              {(command.category === 'utility' || ['help', 'ping', 'info', 'avatar'].includes(command.name.toLowerCase())) && (
                                <div>
                                  <label className="block text-white/70 text-sm mb-1">Show in Help</label>
                                  <select
                                    defaultValue={command.showInHelp !== false}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                    id={`help-${command.id}`}
                                  >
                                    <option value="true">Show in help menu</option>
                                    <option value="false">Hide from help</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 mt-4">
                            <button
                              onClick={() => {
                                const description = document.getElementById(`desc-${command.id}`).value
                                const cooldown = document.getElementById(`cooldown-${command.id}`).value
                                const alias = document.getElementById(`alias-${command.id}`).value
                                
                                let updates = {
                                  description,
                                  cooldown: parseInt(cooldown), 
                                  alias
                                }
                                
                                // Add moderation-specific fields
                                if (['ban', 'kick', 'mute', 'warn', 'timeout'].includes(command.name.toLowerCase()) || command.category === 'moderation') {
                                  const reasonEl = document.getElementById(`reason-${command.id}`)
                                  if (reasonEl) updates.defaultReason = reasonEl.value
                                  
                                  if (['ban', 'timeout'].includes(command.name.toLowerCase())) {
                                    const durationEl = document.getElementById(`duration-${command.id}`)
                                    if (durationEl) updates.banDuration = parseInt(durationEl.value)
                                  }
                                }
                                
                                // Add music-specific fields
                                if (command.category === 'music' || ['play', 'skip', 'queue', 'stop'].includes(command.name.toLowerCase())) {
                                  const maxQueueEl = document.getElementById(`maxqueue-${command.id}`)
                                  const djOnlyEl = document.getElementById(`djonly-${command.id}`)
                                  if (maxQueueEl) updates.maxQueue = parseInt(maxQueueEl.value)
                                  if (djOnlyEl) updates.djOnly = djOnlyEl.value === 'true'
                                }
                                
                                // Add utility-specific fields
                                if (command.category === 'utility' || ['help', 'ping', 'info', 'avatar'].includes(command.name.toLowerCase())) {
                                  const helpEl = document.getElementById(`help-${command.id}`)
                                  if (helpEl) updates.showInHelp = helpEl.value === 'true'
                                }
                                
                                updateCommand(command, updates)
                              }}
                              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 border border-green-500/30 transition-all duration-200"
                            >
                              ✅ Save
                            </button>
                            <button
                              onClick={() => setEditingCommand(null)}
                              className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg text-sm hover:bg-gray-500/30 transition-all duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingCommand(command.id)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-all duration-200"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => toggleCommand(command)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                          command.enabled 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                        }`}
                      >
                        {command.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(groupedCommands).length === 0 && (
          <div className="text-center py-20">
            <span className="text-white/50 text-xl">No commands registered</span>
            <p className="text-white/40 mt-2">Run the command registration script on your bot</p>
          </div>
        )}
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
              <span className="text-green-400 font-bold">{liveData?.responseTime || '45ms'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Uptime</span>
              <span className="text-green-400 font-bold">{liveData?.uptime || '99.9%'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Memory Usage</span>
              <span className="text-blue-400 font-bold">{liveData?.memoryUsage || '234MB'}</span>
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

function ModerationTab({ selectedServer, liveData, showModerationModal, setShowModerationModal }) {
  const [selectedUser, setSelectedUser] = useState('')
  const [moderationAction, setModerationAction] = useState('')
  const [actionReason, setActionReason] = useState('')
  const [actionDuration, setActionDuration] = useState('')
  
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="🛡️" title="Moderation Unavailable" message="Add Skyfall to server to use moderation features" />
  }

  const safeLiveData = liveData || { recentActions: [], moderation: { cases: [] } }
  // Show actual recent actions data
  const recentActions = Array.isArray(safeLiveData.recentActions) ? safeLiveData.recentActions : []
  
  const executeModeration = async () => {
    if (!selectedUser?.trim() || !moderationAction) {
      return // Remove alert, just return silently
    }
    
    const newAction = {
      type: moderationAction,
      moderator: 'Dashboard User',
      action: moderationAction + 'ed',
      target: selectedUser.includes('#') ? selectedUser : `User#${selectedUser}`,
      targetId: selectedUser.includes('#') ? selectedUser.split('#')[1] : selectedUser,
      reason: actionReason || 'No reason provided',
      timestamp: 'Just now',
      duration: actionDuration
    }
    
    // Add to recent actions immediately for UI feedback
    safeLiveData.recentActions = [newAction, ...safeLiveData.recentActions]
    
    // Here you would make API call to execute the moderation action
    console.log('Executing moderation:', newAction)
    
    // Reset form
    setSelectedUser('')
    setModerationAction('')
    setActionReason('')
    setActionDuration('')
  }

  return (
    <div className="space-y-6">
      {/* User Targeting & Quick Actions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <span>⚡</span>
          <span>Moderation Actions</span>
        </h3>
        
        {/* User Selection */}
        <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10">
          <h4 className="text-white font-medium mb-3">Target User</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">Username or User ID</label>
              <input
                type="text"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                placeholder="@username#1234 or 123456789"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Action</label>
              <select
                value={moderationAction}
                onChange={(e) => setModerationAction(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
              >
                <option value="">Select action...</option>
                <option value="ban">Ban User</option>
                <option value="kick">Kick User</option>
                <option value="timeout">Timeout User</option>
                <option value="warn">Warn User</option>
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Reason</label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                placeholder="Reason for moderation action"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Duration (for timeout/ban)</label>
              <input
                type="text"
                value={actionDuration}
                onChange={(e) => setActionDuration(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                placeholder="1h, 1d, permanent"
              />
            </div>
          </div>
          <button
            onClick={executeModeration}
            className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-200"
          >
            🔨 Execute Action
          </button>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'ban', icon: '🔨', title: 'Ban User', desc: 'Permanently ban a user', color: 'red' },
            { type: 'kick', icon: '👢', title: 'Kick User', desc: 'Remove user from server', color: 'orange' },
            { type: 'timeout', icon: '⏰', title: 'Timeout User', desc: 'Temporarily restrict user', color: 'yellow' }
          ].map(action => (
            <button 
              key={action.type}
              onClick={() => setModerationAction(action.type)}
              className={`bg-${action.color}-500/20 hover:bg-${action.color}-500/30 border border-${action.color}-500/30 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 ${
                moderationAction === action.type ? 'ring-2 ring-' + action.color + '-400' : ''
              }`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h4 className="text-white font-medium mb-1">{action.title}</h4>
              <p className="text-white/60 text-sm">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Actions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <span>📋</span>
          <span>Recent Moderation Actions</span>
        </h3>
        <div className="space-y-3">
          {recentActions.length > 0 ? (
            recentActions.map((action, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                    action.type === 'ban' ? 'bg-red-500/20 text-red-400' :
                    action.type === 'kick' ? 'bg-orange-500/20 text-orange-400' :
                    action.type === 'timeout' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {action.type === 'ban' ? '🔨' : action.type === 'kick' ? '👢' : action.type === 'timeout' ? '⏰' : '🛡️'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{action.moderator} {action.action} {action.target}</p>
                    <p className="text-white/60 text-sm">{action.reason}</p>
                  </div>
                </div>
                <span className="text-white/50 text-sm">{action.timestamp}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-white/80 font-medium mb-2">Monitoring Server Activity</h3>
              <p className="text-white/60">Live updates will appear here as members interact with your server</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



function SettingsTab({ selectedServer }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="⚙️" title="Settings Unavailable" message="Add Skyfall to server to configure settings" />
  }

  return (
    <div className="space-y-6">
      {/* Bot Settings */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">🤖 Bot Configuration</h3>
        <div className="space-y-4">
          {[
            { label: 'Bot Prefix', desc: 'Command prefix for the bot', type: 'text', value: '!', width: 'w-16' },
            { label: 'Auto Moderation', desc: 'Automatically moderate spam and inappropriate content', type: 'toggle', value: true },
            { label: 'Welcome Messages', desc: 'Send welcome messages to new members', type: 'toggle', value: true },
            { label: 'Logging Level', desc: 'Detail level for bot logs', type: 'select', value: 'Info', options: ['Debug', 'Info', 'Warn', 'Error'] }
          ].map(setting => (
            <div key={setting.label} className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{setting.label}</p>
                <p className="text-white/60 text-sm">{setting.desc}</p>
              </div>
              {setting.type === 'text' && (
                <input 
                  type="text" 
                  defaultValue={setting.value}
                  className={`${setting.width} px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center`}
                />
              )}
              {setting.type === 'toggle' && (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={setting.value} />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              )}
              {setting.type === 'select' && (
                <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" defaultValue={setting.value}>
                  {setting.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Channel Settings */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">📢 Channel Configuration</h3>
        <div className="space-y-4">
          {[
            { label: 'Log Channel', options: ['Select a channel...', '#logs', '#audit'] },
            { label: 'Welcome Channel', options: ['Select a channel...', '#welcome', '#general'] },
            { label: 'Ticket Category', options: ['Select a category...', '🎫 Tickets', '🛠️ Support'] }
          ].map(setting => (
            <div key={setting.label}>
              <label className="block text-white font-medium mb-2">{setting.label}</label>
              <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                {setting.options.map(option => (
                  <option key={option} value={option.replace(/[^a-zA-Z0-9]/g, '')}>{option}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Role Settings */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">👥 Role Configuration</h3>
        <div className="space-y-4">
          {[
            { label: 'Moderator Role', options: ['Select a role...', 'Moderator', 'Staff'] },
            { label: 'Admin Role', options: ['Select a role...', 'Admin', 'Owner'] },
            { label: 'Muted Role', options: ['Select a role...', 'Muted', 'Restricted'] }
          ].map(setting => (
            <div key={setting.label}>
              <label className="block text-white font-medium mb-2">{setting.label}</label>
              <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                {setting.options.map(option => (
                  <option key={option} value={option.replace(/[^a-zA-Z0-9]/g, '')}>{option}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
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

function TicketsTab({ selectedServer, tickets, showTicketModal, setShowTicketModal }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="🎫" title="Tickets Unavailable" message="Add Skyfall to server to use ticket system" />
  }

  // Use actual tickets data from API
  const safeTickets = tickets || { 
    stats: { total: 0, open: 0, closed: 0 }, 
    tickets: []
  }

  return (
    <div className="space-y-6">
      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Tickets" value={safeTickets.stats?.total || 0} icon="🎫" color="blue" />
        <StatCard title="Open Tickets" value={safeTickets.stats?.open || 0} icon="🔓" color="yellow" />
        <StatCard title="Closed Tickets" value={safeTickets.stats?.closed || 0} icon="🔒" color="purple" />
      </div>

      {/* Create Ticket */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowTicketModal(true)}
          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create Ticket</span>
        </button>
      </div>

      {/* Active Tickets */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Active Tickets</h3>
        <div className="space-y-3">
          {safeTickets?.tickets?.filter(ticket => ticket.status === 'open')?.length > 0 ? (
            safeTickets.tickets.filter(ticket => ticket.status === 'open').map((ticket) => (
              <div key={ticket.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      ticket.priority === 'High' ? 'bg-red-400' : 
                      ticket.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></div>
                    <div>
                      <p className="text-white font-medium">#{ticket.id.slice(-6)} - {ticket.title}</p>
                      <p className="text-white/60 text-sm">
                        {ticket.category} • {ticket.messages} messages • {ticket.priority} priority
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                    <button className="text-red-400 hover:text-red-300 text-sm">Close</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon="🎫" title="No Active Tickets" message="Tickets will appear here when created" />
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
        active 
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </button>
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
