import React, { useState, useEffect } from 'react'
import { useToast } from './Toast'

const Dashboard = ({ user }) => {
  const { showToast, ToastContainer } = useToast()

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
      <ToastContainer />
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

function CommandsTab({ selectedServer, commands, editingCommand, setEditingCommand }) {
  const { showToast } = useToast()
  
  const updateCommand = async (command, updates) => {
    const safeServer = selectedServer || {}
    if (!safeServer.canManageBot && safeServer.id) {
      showToast('You do not have permission to manage commands on this server.', 'error')
      return
    }
    
    // Optimistic update for smooth UX
    const updatedCommands = commands.map(cmd => 
      cmd.id === command.id ? {...cmd, ...updates} : cmd
    )
    
    setEditingCommand(null)
    
    if (!safeServer.id) {
      showToast('Command updated successfully!', 'success')
      return // Demo mode - just update locally
    }
    
    try {
      const response = await fetch(`/api/commands/${safeServer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: command.id,
          updates
        })
      })
      
      if (response.ok) {
        showToast('Command updated successfully!', 'success')
      } else {
        showToast('Failed to update command. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Failed to update command:', error)
      showToast('Network error. Please check your connection.', 'error')
    }
  }

  const toggleCommand = async (command) => {
    const safeServer = selectedServer || {}
    if (!safeServer.canManageBot && safeServer.id) {
      showToast('You do not have permission to manage commands on this server.', 'error')
      return
    }
    
    if (!safeServer.id) {
      showToast(`Command ${!command.enabled ? 'enabled' : 'disabled'} successfully!`, 'success')
      return // Demo mode - just toggle locally
    }
    
    try {
      const response = await fetch(`/api/commands/${safeServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: command.id,
          enabled: !command.enabled
        })
      })
      
      if (response.ok) {
        showToast(`Command ${!command.enabled ? 'enabled' : 'disabled'} successfully!`, 'success')
      } else {
        showToast('Failed to update command. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Failed to toggle command:', error)
      showToast('Network error. Please check your connection.', 'error')
    }
  }

  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="⚙️" title="Commands Unavailable" message="Add Skyfall to server to manage commands" />
  }

  if (!commands || commands.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <span className="text-white/50 text-xl">Loading commands...</span>
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
  const { showToast } = useToast()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!selectedServer?.id) {
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch(`/api/analytics/${selectedServer.id}`)
        if (response.ok) {
          const data = await response.json()
          setAnalyticsData(data)
        } else {
          setAnalyticsData(null)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        setAnalyticsData(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAnalyticsData()
    // Refresh analytics every 60 seconds
    const interval = setInterval(fetchAnalyticsData, 60000)
    return () => clearInterval(interval)
  }, [selectedServer?.id])

  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="📈" title="Analytics Unavailable" message="Add Skyfall to server to view analytics" />
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <span className="text-white/50 text-xl">Loading analytics...</span>
      </div>
    )
  }

  const stats = analyticsData || {}
  
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Bot Uptime" 
          value={stats.uptime || '0%'} 
          icon="⏰" 
          color="green"
          trend={stats.uptimeStatus || 'Unknown'}
        />
        <StatCard 
          title="Response Time" 
          value={stats.responseTime || '0ms'} 
          icon="⚡" 
          color="blue"
          trend={stats.responseStatus || 'Unknown'}
        />
        <StatCard 
          title="Memory Usage" 
          value={stats.memoryUsage || '0MB'} 
          icon="💾" 
          color="purple"
          trend={stats.memoryPercent || '0%'}
        />
        <StatCard 
          title="CPU Usage" 
          value={stats.cpuUsage || '0%'} 
          icon="📊" 
          color="yellow"
          trend={stats.cpuStatus || 'Unknown'}
        />
      </div>

      {/* Command Usage Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Command Usage Today</h3>
          <div className="space-y-3">
            {stats.topCommands?.length > 0 ? stats.topCommands.map((cmd, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-white/60 font-mono w-6">{i + 1}</span>
                  <span className="text-white font-medium">/{cmd.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-white/70">{cmd.uses} uses</span>
                  <div className="w-16 bg-white/10 h-1 rounded-full">
                    <div 
                      className="bg-blue-400 h-1 rounded-full"
                      style={{ width: `${(cmd.uses / (stats.topCommands[0]?.uses || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-white/60">No command usage data available</p>
                <p className="text-white/40 text-sm">Data will appear once commands are used</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Server Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Messages Today</span>
              <span className="text-white font-bold">{stats.messagesPerDay || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Active Users</span>
              <span className="text-white font-bold">{stats.activeUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Voice Sessions</span>
              <span className="text-white font-bold">{stats.voiceSessions || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Moderation Actions</span>
              <span className="text-white font-bold">{stats.modActions || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Tickets Created</span>
              <span className="text-white font-bold">{stats.ticketsCreated || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Recent Error Logs</h3>
          <button 
            className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 bg-blue-500/10 rounded hover:bg-blue-500/20 transition-all"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stats.errorLogs?.length > 0 ? stats.errorLogs.slice(0, 10).map((log, i) => (
            <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-red-400 font-medium">{log.error}</p>
                  <p className="text-white/60 text-sm">{log.command || 'System'} • {log.timestamp || 'Recently'}</p>
                </div>
                <span className="text-red-400/70 text-xs bg-red-500/20 px-2 py-1 rounded">
                  {log.level || 'ERROR'}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <h4 className="text-white/70 font-medium mb-2">No Recent Errors</h4>
              <p className="text-white/50 text-sm">Your bot is running smoothly!</p>
            </div>
          )}
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
  const { showToast } = useToast()
  const [selectedUser, setSelectedUser] = useState('')
  const [moderationAction, setModerationAction] = useState('')
  const [actionReason, setActionReason] = useState('')
  const [actionDuration, setActionDuration] = useState('')
  const [serverMembers, setServerMembers] = useState([])
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [filteredMembers, setFilteredMembers] = useState([])
  
  useEffect(() => {
    if (selectedServer?.id) {
      fetchServerMembers()
    }
  }, [selectedServer?.id])
  
  useEffect(() => {
    if (selectedUser && serverMembers.length > 0) {
      const filtered = serverMembers.filter(member => 
        member.displayName.toLowerCase().includes(selectedUser.toLowerCase()) ||
        member.username.toLowerCase().includes(selectedUser.toLowerCase())
      ).slice(0, 5)
      setFilteredMembers(filtered)
      setShowUserDropdown(filtered.length > 0 && selectedUser.length > 0)
    } else {
      setShowUserDropdown(false)
    }
  }, [selectedUser, serverMembers])
  
  const fetchServerMembers = async () => {
    if (!selectedServer?.id) return
    
    try {
      const response = await fetch(`/api/members/${selectedServer.id}`)
      if (response.ok) {
        const data = await response.json()
        setServerMembers(data.members || [])
      }
    } catch (error) {
      console.error('Failed to fetch server members:', error)
    }
  }
  
  const handleMemberSelect = (member) => {
    setSelectedUser(`${member.displayName} (${member.username}#${member.discriminator})`)
    setShowUserDropdown(false)
  }
  
  const executeModerationAction = async () => {
    if (!selectedUser || !moderationAction || !actionReason) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    try {
      const response = await fetch(`/api/moderation/${selectedServer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: selectedUser,
          action: moderationAction,
          reason: actionReason,
          duration: actionDuration
        })
      })
      
      if (response.ok) {
        showToast(`${moderationAction} action executed successfully`, 'success')
        setSelectedUser('')
        setModerationAction('')
        setActionReason('')
        setActionDuration('')
      } else {
        showToast('Failed to execute moderation action', 'error')
      }
    } catch (error) {
      console.error('Moderation action failed:', error)
      showToast('Network error occurred', 'error')
    }
  }
  
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="🛡️" title="Moderation Unavailable" message="Add Skyfall to server to use moderation features" />
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Moderation Control</h2>
          <p className="text-white/60">Manage server discipline and member actions</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => window.open(`/logs/${selectedServer.id}`, '_blank')}
            className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 px-4 py-2 rounded-xl text-yellow-400 font-medium transition-all">
            📊 View Logs
          </button>
          <button 
            onClick={() => setShowModerationModal(true)}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-4 py-2 rounded-xl text-red-400 font-medium transition-all">
            🚨 Emergency
          </button>
        </div>
      </div>

      {/* Quick Moderation Panel */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">⚡</span> Quick Action
        </h3>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* User Selection */}
            <div className="relative">
              <label className="block text-white/80 text-sm font-medium mb-3">Target User</label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Type username to search..."
                />
                {showUserDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden z-10">
                    {filteredMembers.map((member, i) => (
                      <button
                        key={i}
                        onClick={() => handleMemberSelect(member)}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                          {member.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.displayName}</p>
                          <p className="text-white/60 text-sm">{member.username}#{member.discriminator}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Moderation Action</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'warn', label: '⚠️ Warn', color: 'yellow' },
                  { value: 'timeout', label: '⏰ Timeout', color: 'orange' },
                  { value: 'kick', label: '👢 Kick', color: 'red' },
                  { value: 'ban', label: '🔨 Ban', color: 'red' }
                ].map((action) => (
                  <button
                    key={action.value}
                    onClick={() => setModerationAction(action.value)}
                    className={`p-3 rounded-xl border font-medium transition-all ${
                      moderationAction === action.value
                        ? `bg-${action.color}-500/20 border-${action.color}-500/50 text-${action.color}-400`
                        : 'bg-black/20 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Reason */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Reason <span className="text-red-400">*</span></label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors resize-none"
                rows="4"
                placeholder="Describe the reason for this action..."
              />
            </div>

            {/* Duration */}
            {(moderationAction === 'timeout' || moderationAction === 'ban') && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '1h', label: '1 Hour' },
                    { value: '1d', label: '1 Day' },
                    { value: '7d', label: '7 Days' },
                    { value: '30d', label: '30 Days' },
                    { value: 'permanent', label: 'Permanent' },
                    { value: 'custom', label: 'Custom' }
                  ].map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => setActionDuration(duration.value)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        actionDuration === duration.value
                          ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                          : 'bg-black/20 border border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
                {actionDuration === 'custom' && (
                  <input
                    type="text"
                    value={actionDuration === 'custom' ? '' : actionDuration}
                    onChange={(e) => setActionDuration(e.target.value)}
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors mt-2"
                    placeholder="e.g., 2h, 5d, 1w"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Execute Button */}
        <div className="flex justify-end mt-8">
          <button 
            onClick={executeModerationAction}
            disabled={!selectedUser || !moderationAction || !actionReason}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl text-white font-bold transition-all transform hover:scale-105 disabled:hover:scale-100"
          >
            {!selectedUser || !moderationAction || !actionReason 
              ? 'Fill Required Fields' 
              : `Execute ${moderationAction ? moderationAction.charAt(0).toUpperCase() + moderationAction.slice(1) : 'Action'}`
            }
          </button>
        </div>
      </div>

      {/* Recent Actions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <span>📋</span>
          <span>Recent Moderation Actions</span>
        </h3>
        <div className="space-y-3">
          {(liveData?.moderation?.recentActions || []).length > 0 ? (
            liveData.moderation.recentActions.slice(0, 5).map((action, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    {action.action === 'ban' ? '🔨' : action.action === 'kick' ? '👢' : action.action === 'timeout' ? '⏰' : '⚠️'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{action.action} • {action.user}</p>
                    <p className="text-white/60 text-sm">{action.reason || 'No reason provided'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">{action.moderator}</p>
                  <p className="text-white/40 text-xs">{new Date(action.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-50">🛡️</div>
              <h4 className="text-white/70 font-medium mb-2">No Recent Actions</h4>
              <p className="text-white/50 text-sm">Moderation actions will appear here</p>
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

function TicketsTab({ selectedServer, showTicketModal, setShowTicketModal }) {
  const { showToast } = useToast()
  const [ticketsData, setTicketsData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchTicketsData = async () => {
      if (!selectedServer?.id) {
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch(`/api/tickets/${selectedServer.id}`)
        if (response.ok) {
          const data = await response.json()
          setTicketsData(data)
        } else {
          setTicketsData({ stats: { total: 0, open: 0, closed: 0 }, tickets: [] })
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error)
        setTicketsData({ stats: { total: 0, open: 0, closed: 0 }, tickets: [] })
      } finally {
        setLoading(false)
      }
    }
    
    fetchTicketsData()
    // Refresh tickets every 30 seconds
    const interval = setInterval(fetchTicketsData, 30000)
    return () => clearInterval(interval)
  }, [selectedServer?.id])
  
  const closeTicket = async (ticketId) => {
    if (!selectedServer?.id) return
    
    try {
      const response = await fetch(`/api/tickets/${selectedServer.id}/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' })
      })
      
      if (response.ok) {
        showToast('Ticket closed successfully!', 'success')
        // Refresh data
        setTicketsData(prev => ({
          ...prev,
          tickets: prev.tickets.map(t => t.id === ticketId ? {...t, status: 'closed'} : t),
          stats: {
            ...prev.stats,
            open: prev.stats.open - 1,
            closed: prev.stats.closed + 1
          }
        }))
      } else {
        showToast('Failed to close ticket', 'error')
      }
    } catch (error) {
      console.error('Failed to close ticket:', error)
      showToast('Network error occurred', 'error')
    }
  }

  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="🎫" title="Tickets Unavailable" message="Add Skyfall to server to use ticket system" />
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <span className="text-white/50 text-xl">Loading tickets...</span>
      </div>
    )
  }

  const safeTickets = ticketsData || { 
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
                    <button 
                      className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 bg-blue-500/10 rounded hover:bg-blue-500/20 transition-all"
                      onClick={() => window.open(`https://discord.com/channels/${selectedServer.id}/${ticket.channelId}`, '_blank')}
                    >
                      View
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 rounded hover:bg-red-500/20 transition-all"
                      onClick={() => closeTicket(ticket.id)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎫</div>
              <h4 className="text-white/70 font-medium mb-2">No Active Tickets</h4>
              <p className="text-white/50 text-sm">Users can create tickets with /ticket command</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                onClick={() => window.location.reload()}
              >
                Refresh Tickets
              </button>
            </div>
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
    <div className="text-center py-20">
      <div className="text-6xl mb-6 opacity-50">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-white/70 text-lg">{message}</p>
    </div>
  )
}

export default Dashboard
