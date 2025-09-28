import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  UserGroupIcon, 
  CommandLineIcon, 
  MusicNoteIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  HomeIcon,
  ServerIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { handleDiscordLogin, logout } from '../utils/auth';
import MusicPlayer from './MusicPlayer';
import VerificationTab from './VerificationTab';
import VerificationPanel from './VerificationPanel';
import CommandEditor from './CommandEditor';
import { useToast } from './Toast';

const Dashboard = ({ user }) => {
  const { showToast, ToastContainer } = useToast()

  const [activeTab, setActiveTab] = useState('overview')
  const [userGuilds, setUserGuilds] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [liveData, setLiveData] = useState({ stats: { commandsToday: 0 }, moderation: { cases: [] }, tickets: { active: [] } })
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [fadeClass, setFadeClass] = useState('opacity-0')
  const [tabTransition, setTabTransition] = useState('')
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

  useEffect(() => {
    // Fade in effect after initial load
    if (!loading && !initialLoad) {
      setFadeClass('opacity-100 transition-opacity duration-500 ease-in-out')
    }
  }, [loading, initialLoad])

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
      setTimeout(() => {
        setLoading(false)
        setInitialLoad(false)
      }, 100)
    }
  }

  const fetchLiveDataForServer = async (server) => {
    if (!server) return
    
    try {
      setDataLoading(true)
      const [liveResponse, ticketsResponse, commandsResponse] = await Promise.all([
        fetch(`/api/live/${server.id}`),
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
    if (!selectedServer) return
    
    try {
      setDataLoading(true)
      
      // Use working endpoints with proper fallbacks
      const endpoints = [
        `/api/live-data`,
        `/api/bot-live-${selectedServer.id}`,
        `/api/test-live`
      ]
      
      let data = null
      let lastError = null
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint)
          if (response.ok) {
            data = await response.json()
            break
          }
          lastError = `${endpoint}: ${response.status}`
        } catch (err) {
          lastError = `${endpoint}: ${err.message}`
        }
      }
      
      if (data) {
        setLiveData(data)
      } else {
        console.error('All API endpoints failed:', lastError)
      }
    } catch (error) {
      console.error('Live data fetch error:', error)
    } finally {
      setDataLoading(false)
      if (initialLoad) {
        setLoading(false)
        setInitialLoad(false)
      }
    }
  }

  if (initialLoad && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="text-center space-y-12 z-10 relative">
          {/* Modern Logo */}
          <div className="mb-12">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <svg className="w-12 h-12 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.07l7 3.5v7.36l-7-3.5V9.07zm16 0v7.36l-7 3.5v-7.36l7-3.5z"/>
                </svg>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Skyfall
              </span>
              <span className="text-white/90"> Dashboard</span>
            </h1>
            <p className="text-white/50 text-lg font-medium tracking-wide">Initializing Discord integration...</p>
          </div>

          {/* Advanced Loading Animation */}
          <div className="relative">
            <div className="relative w-32 h-32 mx-auto mb-12">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
              
              {/* Middle Ring */}
              <div className="absolute inset-4 rounded-full border-3 border-blue-500/20"></div>
              <div className="absolute inset-4 rounded-full border-3 border-transparent border-r-blue-500 animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
              
              {/* Inner Ring */}
              <div className="absolute inset-8 rounded-full border-2 border-indigo-500/20"></div>
              <div className="absolute inset-8 rounded-full border-2 border-transparent border-b-indigo-500 animate-spin" style={{animationDuration: '1.5s'}}></div>
              
              {/* Center Core */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-6">
              <div className="w-96 max-w-sm mx-auto">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                  <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-2000 ease-out animate-pulse" 
                       style={{width: dataLoading ? '75%' : '25%'}}></div>
                </div>
              </div>
              
              {/* Status Text */}
              <div className="space-y-2">
                <p className="text-white/80 text-base font-semibold">
                  {dataLoading ? 'Fetching server analytics...' : 'Authenticating with Discord API...'}
                </p>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.07l7 3.5v7.36l-7-3.5V9.07zm16 0v7.36l-7 3.5v-7.36l7-3.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Skyfall</span>
                  <span className="text-white/90"> Dashboard</span>
                </h1>
                <p className="text-white/50 text-sm font-medium">Advanced Discord Bot Management</p>
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
                <label htmlFor="serverSelect" className="sr-only">Select Discord Server</label>
                <select 
                  id="serverSelect"
                  name="serverSelect"
                  aria-label="Select Discord Server"
                  value={selectedServer?.id || ''} 
                  onChange={(e) => {
                    const guild = userGuilds.find(g => g.id === e.target.value)
                    if (guild?.isCreateButton) {
                      window.open('https://discord.com/channels/@me', '_blank')
                      return
                    }
                    if (guild) {
                      setSelectedServer(guild)
                      fetchLiveDataForServer(guild)
                    }
                  }}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent appearance-none cursor-pointer"
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
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-3 mb-8 border border-white/10">
          <nav className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'music', name: 'Music', icon: '🎵' },
              { id: 'moderation', name: 'Moderation', icon: '🛡️' },
              { id: 'verification', name: 'Verification', icon: '🔐' },
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
          {activeTab === 'music' && selectedServer && <MusicPlayer serverId={selectedServer.id} />}
          {activeTab === 'moderation' && <ModerationTab selectedServer={selectedServer} liveData={liveData} showModerationModal={showModerationModal} setShowModerationModal={setShowModerationModal} />}
          {activeTab === 'verification' && <VerificationPanel selectedServer={selectedServer} />}
          {activeTab === 'cases' && <CasesTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'tickets' && <TicketsTab selectedServer={selectedServer} tickets={tickets} showTicketModal={showTicketModal} setShowTicketModal={setShowTicketModal} />}
          {activeTab === 'logs' && <LogsTab selectedServer={selectedServer} liveData={liveData} />}
          {activeTab === 'commands' && selectedServer && <CommandEditor serverId={selectedServer.id} />}
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
                              <label htmlFor={`cmd-desc-${command.name}`} className="block text-white/70 text-sm mb-1">Command Description</label>
                              <input
                                id={`cmd-desc-${command.name}`}
                                name={`commandDescription-${command.name}`}
                                type="text"
                                defaultValue={command.description || ''}
                                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                placeholder="What this command does"
                              />
                            </div>
                            
                            {/* Dynamic fields based on command type */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Cooldown - for all commands */}
                              <div>
                                <label htmlFor={`cooldown-${command.id}`} className="block text-white/70 text-sm mb-1">Cooldown (seconds)</label>
                                <select
                                  defaultValue={command.cooldown}
                                  className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                  id={`cooldown-${command.id}`}
                                  name={`cooldown-${command.id}`}
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
                                <label htmlFor={`cmd-alias-${command.name}`} className="block text-white/70 text-sm mb-1">Command Alias</label>
                                <input
                                  id={`cmd-alias-${command.name}`}
                                  name={`commandAlias-${command.name}`}
                                  type="text"
                                  defaultValue={command.alias || ''}
                                  className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                  placeholder="Alternative name (optional)"
                                />
                              </div>
                              
                              {/* Moderation-specific fields */}
                              {(['ban', 'kick', 'mute', 'warn', 'timeout'].includes(command.name.toLowerCase()) || command.category === 'moderation') && (
                                <>
                                  <div>
                                    <label htmlFor={`cmd-reason-${command.name}`} className="block text-white/70 text-sm mb-1">Default Reason</label>
                                    <input
                                      id={`cmd-reason-${command.name}`}
                                      name={`defaultReason-${command.name}`}
                                      type="text"
                                      defaultValue={command.defaultReason || ''}
                                      className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                      placeholder="Default moderation reason"
                                    />
                                  </div>
                                  
                                  {/* Ban duration only for ban/timeout commands */}
                                  {(['ban', 'timeout'].includes(command.name.toLowerCase())) && (
                                    <div>
                                      <label htmlFor={`duration-${command.id}`} className="block text-white/70 text-sm mb-1">Ban Duration</label>
                                      <select
                                        defaultValue={command.banDuration || 0}
                                        className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                        id={`duration-${command.id}`}
                                        name={`duration-${command.id}`}
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
                                      id={`cmd-queue-${command.name}`}
                                      name={`maxQueueSize-${command.name}`}
                                      type="number"
                                      min="1"
                                      max="100"
                                      defaultValue={command.maxQueueSize || 50}
                                      className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm"
                                      placeholder="Maximum songs in queue"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-t-2 border-purple-400 animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 animate-pulse">Loading Analytics</h2>
          <p className="text-white/60 animate-fade-in">Fetching server analytics...</p>
        </div>
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
  
  const fetchLiveData = async () => {
    try {
      if (!selectedServer) return
      
      setDataLoading(true)
      
      // Get Discord token from localStorage or handle auth
      const discordToken = localStorage.getItem('discord_token')
      if (!discordToken) {
        handleDiscordLogin()
        return
      }
      
      const response = await fetch(`/api/live-data?serverId=${selectedServer}`, {
        headers: {
          'Authorization': `Bearer ${discordToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('discord_token')
          handleDiscordLogin()
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setLiveData(data)
      
      // Show success toast if data is fresh
      if (data.stats && data.stats.memberCount > 0) {
        showToast('Live data updated successfully', 'success')
      }
    } catch (error) {
      console.error('Failed to fetch live data:', error)
      showToast('Failed to fetch live bot data. Bot may be offline.', 'error')
      
      // Set fallback data to prevent UI breaks
      setLiveData({
        stats: { commandsToday: 0, memberCount: 0, onlineMembers: 0 },
        moderation: { cases: [] },
        tickets: { active: [] },
        music: { isPlaying: false, queue: [] },
        error: 'Bot offline or unreachable'
      })
    } finally {
      setDataLoading(false)
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
                  id="targetUser"
                  name="targetUser"
                  type="text"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="Enter username or user ID"
                  className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
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
                id="reason"
                name="reason"
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
                    id="customDuration"
                    name="customDuration"
                    type="text"
                    value={actionDuration === 'custom' ? '' : actionDuration}
                    onChange={(e) => setActionDuration(e.target.value)}
                    placeholder="e.g., 1d, 2h, 30m"
                    className="px-3 py-2 bg-black/30 border border-white/20 rounded text-white text-sm placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors mt-2"
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
                  id={`setting-${setting.id}`}
                  name={`setting-${setting.id}`}
                  type="text" 
                  defaultValue={setting.value}
                  className={`${setting.width} px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center`}
                />
              )}
              {setting.type === 'toggle' && (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    id={`toggle-${setting.id}`}
                    name={`toggle-${setting.id}`}
                    type="checkbox" 
                    className="sr-only peer" 
                    defaultChecked={setting.value} 
                  />
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

function CasesTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="⚖️" title="Skyfall Not Added" message="Add Skyfall to view moderation cases" />
  }

  const cases = liveData?.moderation?.cases || []

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          ⚖️ Moderation Cases
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">{cases.length}</div>
            <div className="text-blue-300 text-sm">Total Cases</div>
          </div>
          <div className="bg-yellow-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400">{cases.filter(c => c.status === 'active').length}</div>
            <div className="text-yellow-300 text-sm">Active</div>
          </div>
          <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">{cases.filter(c => c.status === 'resolved').length}</div>
            <div className="text-green-300 text-sm">Resolved</div>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">{cases.filter(c => c.appealable).length}</div>
            <div className="text-purple-300 text-sm">Appealable</div>
          </div>
        </div>

        <div className="space-y-4">
          {cases.length > 0 ? cases.slice(0, 10).map((case_, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400 font-mono text-sm">#{case_.caseId || index + 1}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  case_.type === 'ban' ? 'bg-red-500/20 text-red-400' :
                  case_.type === 'timeout' ? 'bg-yellow-500/20 text-yellow-400' :
                  case_.type === 'kick' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {case_.type || case_.action}
                </span>
              </div>
              <div className="text-white font-medium mb-1">{case_.user || case_.target}</div>
              <div className="text-gray-300 text-sm mb-2">{case_.reason}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">By {case_.moderator}</span>
                <span className="text-gray-400">{new Date(case_.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">⚖️</div>
              <h4 className="text-white/70 font-medium mb-2">No Moderation Cases</h4>
              <p className="text-white/50 text-sm">Moderation actions will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LogsTab({ selectedServer, liveData }) {
  if (!selectedServer?.hasSkyfall) {
    return <EmptyState icon="📜" title="Skyfall Not Added" message="Add Skyfall to view server logs" />
  }

  const logs = liveData?.logs?.recent || []

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          📜 Server Logs
        </h2>
        
        <div className="space-y-3">
          {logs.length > 0 ? logs.slice(0, 20).map((log, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className={`w-3 h-3 rounded-full ${
                log.level === 'error' ? 'bg-red-400' :
                log.level === 'warn' ? 'bg-yellow-400' :
                log.level === 'info' ? 'bg-blue-400' :
                'bg-gray-400'
              }`}></div>
              <div className="flex-1">
                <div className="text-white text-sm">{log.message}</div>
                <div className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString()}</div>
              </div>
              {log.user && (
                <div className="text-gray-300 text-sm">{log.user}</div>
              )}
            </div>
          )) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📜</div>
              <h4 className="text-white/70 font-medium mb-2">No Recent Logs</h4>
              <p className="text-white/50 text-sm">Server activity logs will appear here</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                onClick={() => window.location.reload()}
              >
                Refresh Logs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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
