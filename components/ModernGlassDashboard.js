import React, { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { 
  HomeIcon,
  MusicNoteIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  CommandLineIcon,
  BellIcon,
  ServerIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const ModernGlassDashboard = () => {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [userGuilds, setUserGuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session?.accessToken) {
      fetchUserGuilds()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchUserGuilds = async () => {
    try {
      const response = await fetch('/api/discord/user-guilds', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserGuilds(data.guilds || [])
      } else {
        // Fallback to demo data if API fails
        setUserGuilds([
          { id: 'demo-1', name: '🎮 Gaming Hub', members: 1337, online: 420, hasSkyfall: true, icon: null },
          { id: 'demo-2', name: '💼 Business Server', members: 256, online: 89, hasSkyfall: true, icon: null },
          { id: 'demo-3', name: '🎨 Creative Community', members: 892, online: 234, hasSkyfall: false, icon: null }
        ])
      }
    } catch (error) {
      console.error('Error fetching guilds:', error)
      // Fallback data
      setUserGuilds([
        { id: 'demo-1', name: '🎮 Gaming Hub', members: 1337, online: 420, hasSkyfall: true, icon: null }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="glass-card p-12 text-center max-w-md mx-4 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Skyfall</h1>
          <p className="text-white/70 mb-8">Sign in with Discord to manage your servers</p>
          <button
            onClick={() => signIn('discord')}
            className="glass-button w-full py-4 px-6 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-3">
              <UserIcon className="w-5 h-5" />
              <span>Sign in with Discord</span>
            </div>
          </button>
        </div>
      </div>
    )
  }

  const navigation = [
    { name: 'Overview', icon: HomeIcon, id: 'overview' },
    { name: 'Servers', icon: ServerIcon, id: 'servers' },
    { name: 'Moderation', icon: ShieldCheckIcon, id: 'moderation' },
    { name: 'Music', icon: MusicNoteIcon, id: 'music' },
    { name: 'Analytics', icon: ChartBarIcon, id: 'analytics' },
    { name: 'Settings', icon: CogIcon, id: 'settings' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/50 via-slate-900/50 to-blue-900/50"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="glass-sidebar h-full p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-white">Skyfall</span>
          </div>

          {/* User Profile */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={session.user?.image || '/api/default-avatar'}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-purple-400/30"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{session.user?.name || 'Discord User'}</p>
                <p className="text-white/60 text-sm truncate">#{session.user?.discriminator || '0000'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? 'glass-button-active text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center space-x-3 px-4 py-3 text-white/70 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-300"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 relative z-10">
        {/* Header */}
        <header className="glass-header p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden glass-button p-2 rounded-xl"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="w-6 h-6 text-white" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-white" />
                )}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {navigation.find(nav => nav.id === activeTab)?.name || 'Dashboard'}
                </h1>
                <p className="text-white/60">Manage your Discord servers with Skyfall</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="glass-card px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-sm font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {activeTab === 'servers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGuilds.map((guild, index) => (
                  <div 
                    key={guild.id}
                    className="glass-card p-6 hover:scale-105 transition-all duration-300 group"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {guild.icon ? (
                          <img
                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                            alt={guild.name}
                            className="w-12 h-12 rounded-xl"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">{guild.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-semibold truncate max-w-32">{guild.name}</h3>
                          <p className="text-white/60 text-sm">{guild.members?.toLocaleString() || 0} members</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${guild.hasSkyfall ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Online</span>
                        <span className="text-green-400 font-semibold">{guild.online || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Status</span>
                        <span className={`font-semibold ${guild.hasSkyfall ? 'text-green-400' : 'text-gray-400'}`}>
                          {guild.hasSkyfall ? 'Active' : 'Not Added'}
                        </span>
                      </div>
                    </div>

                    {guild.hasSkyfall ? (
                      <button className="w-full glass-button py-3 px-4 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300">
                        Manage Server
                      </button>
                    ) : (
                      <a 
                        href={`https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center glass-button-secondary py-3 px-4 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300"
                      >
                        Add Skyfall
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Servers</p>
                      <p className="text-2xl font-bold text-white">{userGuilds.length}</p>
                    </div>
                    <ServerIcon className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Active Bots</p>
                      <p className="text-2xl font-bold text-white">{userGuilds.filter(g => g.hasSkyfall).length}</p>
                    </div>
                    <ShieldCheckIcon className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Members</p>
                      <p className="text-2xl font-bold text-white">{userGuilds.reduce((acc, g) => acc + (g.members || 0), 0).toLocaleString()}</p>
                    </div>
                    <UserGroupIcon className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Commands Used</p>
                      <p className="text-2xl font-bold text-white">15.6K</p>
                    </div>
                    <CommandLineIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {[
                    { action: 'Bot added to Gaming Hub', time: '2 minutes ago', type: 'success' },
                    { action: 'Moderation action in Business Server', time: '1 hour ago', type: 'warning' },
                    { action: 'Music session started', time: '3 hours ago', type: 'info' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-white/5">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-400' :
                        activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.action}</p>
                        <p className="text-white/60 text-sm">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content can be added here */}
          {activeTab !== 'servers' && activeTab !== 'overview' && (
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                {navigation.find(nav => nav.id === activeTab)?.name}
              </h2>
              <p className="text-white/60">This section is coming soon!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ModernGlassDashboard
