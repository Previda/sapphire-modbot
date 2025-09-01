import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    console.log('Dashboard loading, checking auth state...')
    
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('discord_token')
    const userData = localStorage.getItem('user_data')
    
    console.log('Auth check:', { token: !!token, userData: !!userData })
    
    if (token && userData) {
      console.log('Found auth data, setting logged in state')
      const parsedUser = JSON.parse(userData)
      setIsLoggedIn(true)
      setUser(parsedUser)
      setShowDashboard(true) // Auto-show dashboard if logged in
      setIsLoading(false)
    } else {
      console.log('No auth data found, showing login screen')
      setIsLoggedIn(false)
      setIsLoading(false)
    }

    // Clean URL without redirect if there are params
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.toString()) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    // Clean up any leftover flags
    localStorage.removeItem('auth_completed')
    localStorage.removeItem('force_dashboard')
  }, [])

  const handleDiscordLogin = () => {
    // Discord OAuth URL for user authentication only (not bot installation)
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1358527215020544222'
    const redirectUri = encodeURIComponent('https://skyfall-omega.vercel.app/auth/callback')
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`
    
    console.log('Discord OAuth URL:', discordUrl)
    console.log('Redirect URI:', redirectUri)
    
    window.location.href = discordUrl
  }


  return (
    <>
      <Head>
        <title>Skyfall Dashboard</title>
        <meta name="description" content="Skyfall Bot Management Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen gradient-bg">
        {/* Navigation Bar */}
        <nav className="absolute top-0 left-0 right-0 z-10 p-6">
          <div className="glass-card compact-padding">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌌</span>
                <span className="text-xl font-bold text-white">Skyfall</span>
              </div>
              <div className="flex items-center space-x-6">
                <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
                <a href="#faq" className="text-white/80 hover:text-white transition-colors">FAQ</a>
                <a href="#terms" className="text-white/80 hover:text-white transition-colors">Terms</a>
                <button 
                  onClick={() => isLoggedIn ? setShowDashboard(true) : handleDiscordLogin()}
                  className="btn-secondary text-white font-semibold hover:scale-105 transition-transform"
                >
                  {isLoggedIn ? 'Dashboard' : 'Login'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        {!isLoggedIn && !showDashboard && (
          <div className="flex items-center justify-center min-h-screen px-6 animate-fade-in">
            <div className="text-center max-w-5xl mx-auto">
              {/* Logo/Title */}
              <div className="mb-20">
                <div className="mb-12">
                  <div className="text-9xl mb-8 animate-float">🌌</div>
                  <h1 className="text-8xl font-black heading-gradient mb-8 tracking-tighter leading-none">
                    SKYFALL
                  </h1>
                </div>
                <p className="text-3xl text-white/85 font-extralight animate-fade-in leading-relaxed max-w-3xl mx-auto" style={{animationDelay: '0.3s'}}>
                  Next-Generation Discord Bot Management
                </p>
                <p className="text-lg text-white/60 font-light mt-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  Experience seamless server control with advanced automation
                </p>
              </div>

              {/* Feature Cards */}
              <div id="features" className="grid-auto-fit mb-16 animate-fade-in" style={{animationDelay: '0.6s'}}>
                <div className="glass-card card-padding card-hover group">
                  <div className="text-6xl mb-8 animate-float group-hover:scale-110 transition-transform duration-500">🎵</div>
                  <h3 className="text-2xl font-bold heading-gradient mb-4">Music Engine</h3>
                  <p className="text-white/70 leading-relaxed text-lg">Advanced audio streaming with YouTube & Spotify integration</p>
                  <div className="mt-6 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/60 text-sm">Active</span>
                  </div>
                </div>
                
                <div className="glass-card card-padding card-hover group">
                  <div className="text-6xl mb-8 animate-float group-hover:scale-110 transition-transform duration-500" style={{animationDelay: '0.5s'}}>⚖️</div>
                  <h3 className="text-2xl font-bold heading-gradient mb-4">Justice System</h3>
                  <p className="text-white/70 leading-relaxed text-lg">Automated moderation with intelligent appeal processing</p>
                  <div className="mt-6 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-white/60 text-sm">Monitoring</span>
                  </div>
                </div>
                
                <div className="glass-card card-padding card-hover group">
                  <div className="text-6xl mb-8 animate-float group-hover:scale-110 transition-transform duration-500" style={{animationDelay: '1s'}}>⚙️</div>
                  <h3 className="text-2xl font-bold heading-gradient mb-4">Command Arsenal</h3>
                  <p className="text-white/70 leading-relaxed text-lg">Comprehensive toolkit for server management and automation</p>
                  <div className="mt-6 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-white/60 text-sm">Ready</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center space-y-6 animate-fade-in" style={{animationDelay: '0.9s'}}>
                <button
                  onClick={handleDiscordLogin}
                  className="btn-primary text-white font-bold text-xl flex-center space-x-4 px-12 py-6 shadow-2xl"
                >
                  <span className="text-2xl">🚀</span>
                  <span>Launch Dashboard</span>
                </button>
                <p className="text-white/60 text-sm font-medium tracking-wide">Secure Discord OAuth Authentication</p>
              </div>

              {/* Status Indicator */}
              <div className="mt-16 animate-fade-in" style={{animationDelay: '1.2s'}}>
                <div className="glass-card compact-padding inline-block">
                  <div className="flex-center space-x-4">
                    <div className="w-3 h-3 status-online rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-white/90 font-medium tracking-wide">System Status: Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {!isLoggedIn && (
          <div id="faq" className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold heading-gradient mb-12 text-center">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="glass-card card-padding">
                  <h3 className="text-xl font-semibold text-white mb-3">How do I add Skyfall to my server?</h3>
                  <p className="text-white/70">Click the Launch Dashboard button and authorize Skyfall with your Discord account. Then select your server and configure the bot settings.</p>
                </div>
                <div className="glass-card card-padding">
                  <h3 className="text-xl font-semibold text-white mb-3">What permissions does Skyfall need?</h3>
                  <p className="text-white/70">Skyfall requires basic permissions for moderation, music playback, and server management. All permissions are clearly listed during the authorization process.</p>
                </div>
                <div className="glass-card card-padding">
                  <h3 className="text-xl font-semibold text-white mb-3">Is Skyfall free to use?</h3>
                  <p className="text-white/70">Yes! Skyfall offers a comprehensive free tier with all core features. Premium features may be available in the future.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms Section */}
        {!isLoggedIn && (
          <div id="terms" className="py-20 px-6 bg-black/20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold heading-gradient mb-12 text-center">Terms of Service</h2>
              <div className="glass-card card-padding">
                <div className="text-white/70 space-y-4 leading-relaxed">
                  <p>By using Skyfall, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the bot responsibly and in accordance with Discord's Terms of Service</li>
                    <li>Not abuse or exploit the bot's features for malicious purposes</li>
                    <li>Respect other users and maintain appropriate conduct</li>
                    <li>Understand that service availability may vary</li>
                  </ul>
                  <p className="mt-6 text-sm text-white/50">
                    Last updated: January 2025. For questions, contact us through our Discord server.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {isLoggedIn && showDashboard && <DashboardMain user={user} />}
        
        {/* Logged in but not showing dashboard - show landing with dashboard button */}
        {isLoggedIn && !showDashboard && (
          <div className="flex items-center justify-center min-h-screen px-6 animate-fade-in">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-16">
                <div className="text-8xl mb-8 animate-float">🌌</div>
                <h1 className="text-6xl font-black heading-gradient mb-6 tracking-tight">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-xl text-white/80 mb-12 leading-relaxed">
                  Ready to manage your Discord servers with Skyfall?
                </p>
                
                <button 
                  onClick={() => setShowDashboard(true)}
                  className="btn-primary text-xl px-12 py-4 rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  Open Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Dashboard Component
function DashboardMain({ user }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [userGuilds, setUserGuilds] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [serverCommands, setServerCommands] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const token = localStorage.getItem('discord_token')
        if (!token) {
          setLoading(false)
          return
        }

        // For development, use mock data if API fails
        try {
          const response = await fetch('/api/bot/servers', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            setUserGuilds(data.guilds)
            if (data.guilds.length > 0) {
              setSelectedServer(data.guilds[0])
            }
          } else {
            throw new Error('API failed, using mock data')
          }
        } catch (apiError) {
          console.log('Using mock data for development:', apiError.message)
          // Fallback to mock data
          const mockGuilds = [
            { 
              id: '1234567890123456789', 
              name: 'Skyfall Test Server', 
              icon: null, 
              owner: true, 
              permissions: '8',
              hasSkyfall: true,
              memberCount: 1234,
              status: 'online'
            },
            { 
              id: '9876543210987654321', 
              name: 'My Gaming Community', 
              icon: null, 
              owner: false, 
              permissions: '36',
              hasSkyfall: false,
              memberCount: 567,
              status: 'offline'
            },
            { 
              id: '1111222233334444555', 
              name: 'Cool Discord Server', 
              icon: null, 
              owner: true, 
              permissions: '8',
              hasSkyfall: true,
              memberCount: 890,
              status: 'online'
            }
          ]
          
          setUserGuilds(mockGuilds)
          setSelectedServer(mockGuilds[0])
        }
      } catch (error) {
        console.error('Error fetching guilds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGuilds()
  }, [])

  return (
    <div className="min-h-screen p-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-8 mb-8 rounded-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center space-x-3 hover:scale-105 transition-transform"
            >
              <div className="text-5xl animate-float">🌌</div>
              <div>
                <h1 className="text-4xl font-black heading-gradient">Skyfall</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 status-online rounded-full animate-pulse"></div>
                  <span className="text-white/60 text-sm">Dashboard</span>
                </div>
              </div>
            </button>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => window.open(`https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands`, '_blank')}
              className="btn-secondary text-white font-semibold flex items-center space-x-3 px-6 py-3 rounded-xl"
            >
              <span>➕</span>
              <span>Add to Server</span>
            </button>
            <div className="flex items-center space-x-4 bg-black/20 rounded-xl px-4 py-3">
              <img 
                src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png?size=64`}
                alt={user?.username || 'User'}
                className="w-12 h-12 rounded-full border-2 border-purple-400/50"
                onError={(e) => {
                  e.target.src = `https://cdn.discordapp.com/embed/avatars/${(user?.id || '0') % 5}.png`
                }}
              />
              <div>
                <div className="text-white font-semibold">{user?.username || 'SkyfallCommander'}</div>
                <div className="text-white/60 text-sm">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Server Selector */}
      <div className="glass-card p-8 mb-8 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <span className="text-white font-bold text-lg">🏰 Server:</span>
              <select 
                value={selectedServer?.id || ''} 
                onChange={(e) => {
                  const server = userGuilds.find(g => g.id === e.target.value)
                  setSelectedServer(server)
                }}
                className="bg-black/40 border border-white/30 rounded-xl px-6 py-4 text-white focus:border-purple-400 focus:outline-none min-w-[350px] text-lg font-semibold"
              >
                <option value="" className="bg-gray-800 text-white">
                  {loading ? '🔄 Loading servers...' : userGuilds.length === 0 ? '❌ No servers found' : '📋 Select a server'}
                </option>
                {userGuilds.map(guild => (
                  <option key={guild.id} value={guild.id} className="bg-gray-800 text-white">
                    {guild.hasSkyfall ? '✅' : '❌'} {guild.name} ({guild.memberCount || 0} members)
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedServer && !selectedServer.hasSkyfall && (
            <button 
              onClick={() => window.open(`https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands&guild_id=${selectedServer.id}`, '_blank')}
              className="btn-primary text-white font-bold flex items-center space-x-3 px-8 py-4 rounded-xl text-lg hover:scale-105 transition-all duration-300"
            >
              <span>🚀</span>
              <span>Add Skyfall to {selectedServer.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card p-6 mb-8 rounded-2xl">
        <nav className="flex space-x-4 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: '🏰' },
            { id: 'music', name: 'Music', icon: '🎵' },
            { id: 'appeals', name: 'Justice', icon: '⚖️' },
            { id: 'commands', name: 'Commands', icon: '⚙️' },
            { id: 'moderation', name: 'Moderation', icon: '🛡️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-bold transition-all duration-300 whitespace-nowrap text-lg ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-purple-500/40 to-blue-500/40 text-white border-2 border-white/30 shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10 border-2 border-transparent'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && <OverviewTab selectedServer={selectedServer} />}
        {activeTab === 'commands' && <CommandsTab selectedServer={selectedServer} serverCommands={serverCommands} setServerCommands={setServerCommands} />}
        {activeTab === 'music' && <MusicTab selectedServer={selectedServer} />}
        {activeTab === 'appeals' && <AppealsTab selectedServer={selectedServer} />}
        {activeTab === 'moderation' && <ModerationTab selectedServer={selectedServer} />}
      </div>
    </div>
  )
}

// Tab Components
function OverviewTab({ selectedServer }) {
  const [serverStats, setServerStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedServer && selectedServer.hasSkyfall) {
      setLoading(true)
      fetch(`/api/bot/stats?serverId=${selectedServer.id}`)
        .then(res => res.json())
        .then(data => {
          setServerStats(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch server stats:', err)
          setLoading(false)
        })
    }
  }, [selectedServer])

  if (!selectedServer) {
    return (
      <div className="glass-card card-padding text-center">
        <div className="text-4xl mb-4">🏰</div>
        <h3 className="text-xl font-bold text-white mb-2">No Server Selected</h3>
        <p className="text-white/70">Please select a server to view its overview</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Server Info */}
      <div className="glass-card card-padding">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl text-white font-bold">
            {selectedServer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold heading-gradient">{selectedServer.name}</h2>
            <p className="text-white/70 flex items-center space-x-2">
              {selectedServer.hasSkyfall ? (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>✅ Skyfall Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>❌ Skyfall Not Added</span>
                </>
              )}
            </p>
          </div>
        </div>
        
        {selectedServer.hasSkyfall && (
          <div className="grid grid-cols-3 gap-4">
            {loading ? (
              <>
                <div className="bg-blue-500/20 rounded-lg p-4 text-center animate-pulse">
                  <div className="text-2xl font-bold text-white">...</div>
                  <div className="text-white/70 text-sm">Members</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-4 text-center animate-pulse">
                  <div className="text-2xl font-bold text-white">...</div>
                  <div className="text-white/70 text-sm">Commands Used</div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4 text-center animate-pulse">
                  <div className="text-2xl font-bold text-white">...</div>
                  <div className="text-white/70 text-sm">Songs Played</div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{serverStats?.memberCount || 0}</div>
                  <div className="text-white/70 text-sm">Members</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{serverStats?.commandsUsed || 0}</div>
                  <div className="text-white/70 text-sm">Commands Used</div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{serverStats?.songsPlayed || 0}</div>
                  <div className="text-white/70 text-sm">Songs Played</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Live Bot Status */}
      {selectedServer.hasSkyfall && serverStats && (
        <div className="glass-card card-padding">
          <h3 className="text-lg font-bold text-white mb-4">🤖 Bot Status</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  serverStats.botStatus === 'online' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {serverStats.botStatus?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Uptime</span>
                <span className="text-white font-semibold">{serverStats.uptime}</span>
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-white/70 text-sm mb-1">Last Activity</div>
              <div className="text-white font-semibold">{new Date(serverStats.lastActivity).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function AppealsTab({ selectedServer }) {
  if (!selectedServer || !selectedServer.hasSkyfall) {
    return (
      <div className="glass-card card-padding text-center">
        <div className="text-4xl mb-4">⚖️</div>
        <h3 className="text-xl font-bold text-white mb-2">
          {!selectedServer ? 'No Server Selected' : 'Skyfall Not Added'}
        </h3>
        <p className="text-white/70">
          {!selectedServer ? 'Select a server to view justice system' : `Add Skyfall to ${selectedServer.name} to use justice features`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card card-padding">
        <h2 className="text-2xl font-bold heading-gradient">Justice System for {selectedServer.name}</h2>
        <p className="text-white/70">Manage appeals and moderation cases</p>
      </div>
      
      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card card-padding text-center">
          <div className="text-3xl font-bold text-white mb-2">4</div>
          <div className="text-white/70">Pending Appeals</div>
        </div>
        <div className="glass-card card-padding text-center">
          <div className="text-3xl font-bold text-white mb-2">89</div>
          <div className="text-white/70">Resolved Cases</div>
        </div>
      </div>
    </div>
  )
}

function CommandsTab({ selectedServer, serverCommands, setServerCommands }) {
  const [editingCommand, setEditingCommand] = useState(null)
  
  if (!selectedServer) {
    return (
      <div className="glass-card card-padding text-center">
        <div className="text-4xl mb-4">⚙️</div>
        <h3 className="text-xl font-bold text-white mb-2">No Server Selected</h3>
        <p className="text-white/70">Select a server to customize its commands</p>
      </div>
    )
  }

  if (!selectedServer.hasSkyfall) {
    return (
      <div className="glass-card card-padding text-center">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-white mb-2">Skyfall Not Added</h3>
        <p className="text-white/70 mb-6">Add Skyfall to {selectedServer.name} to customize commands</p>
        <button 
          onClick={() => window.open(`https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands&guild_id=${selectedServer.id}`, '_blank')}
          className="btn-primary text-white font-semibold"
        >
          Add Skyfall to {selectedServer.name}
        </button>
      </div>
    )
  }

  const commands = [
    { id: 'play', name: 'play', category: 'Music', description: 'Play music from YouTube or Spotify', enabled: true },
    { id: 'skip', name: 'skip', category: 'Music', description: 'Skip current song', enabled: true },
    { id: 'queue', name: 'queue', category: 'Music', description: 'Show music queue', enabled: true },
    { id: 'ban', name: 'ban', category: 'Moderation', description: 'Ban a user from the server', enabled: true },
    { id: 'kick', name: 'kick', category: 'Moderation', description: 'Kick a user from the server', enabled: true },
    { id: 'warn', name: 'warn', category: 'Moderation', description: 'Warn a user', enabled: true },
    { id: 'appeal', name: 'appeal', category: 'Justice', description: 'Submit an appeal', enabled: true },
    { id: 'dice', name: 'dice', category: 'Fun', description: 'Roll dice', enabled: true }
  ]

  const currentServerCommands = serverCommands[selectedServer.id] || commands

  const updateCommand = (commandId, updates) => {
    const newCommands = currentServerCommands.map(cmd => 
      cmd.id === commandId ? { ...cmd, ...updates } : cmd
    )
    setServerCommands({
      ...serverCommands,
      [selectedServer.id]: newCommands
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card card-padding">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold heading-gradient">Commands for {selectedServer.name}</h2>
            <p className="text-white/70">Customize bot commands for this server</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm">{currentServerCommands.filter(c => c.enabled).length} Active</span>
          </div>
        </div>
      </div>

      {/* Commands List */}
      <div className="space-y-4">
        {['Music', 'Moderation', 'Justice', 'Fun'].map(category => {
          const categoryCommands = currentServerCommands.filter(cmd => cmd.category === category)
          
          return (
            <div key={category} className="glass-card card-padding">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>{category === 'Music' ? '🎵' : category === 'Moderation' ? '🛡️' : category === 'Justice' ? '⚖️' : '🎮'}</span>
                <span>{category} Commands</span>
              </h3>
              
              <div className="space-y-2">
                {categoryCommands.map(command => (
                  <div key={command.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${command.enabled ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <div>
                        <div className="text-white font-semibold">/{command.name}</div>
                        <div className="text-white/60 text-sm">{command.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCommand(command.id, { enabled: !command.enabled })}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                          command.enabled 
                            ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                        }`}
                      >
                        {command.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      
                      <button
                        onClick={() => setEditingCommand(command)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded-full text-sm font-semibold hover:bg-blue-500/30 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Command Editor Modal */}
      {editingCommand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card card-padding max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit /{editingCommand.name}</h3>
              <button 
                onClick={() => setEditingCommand(null)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Command Description</label>
                <input
                  type="text"
                  value={editingCommand.description}
                  onChange={(e) => setEditingCommand({...editingCommand, description: e.target.value})}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editingCommand.enabled}
                  onChange={(e) => setEditingCommand({...editingCommand, enabled: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="enabled" className="text-white/80">Enabled</label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    updateCommand(editingCommand.id, editingCommand)
                    setEditingCommand(null)
                  }}
                  className="btn-primary text-white font-semibold flex-1"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingCommand(null)}
                  className="btn-secondary text-white font-semibold flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MusicTab({ selectedServer }) {
  const [serverStats, setServerStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedServer && selectedServer.hasSkyfall) {
      setLoading(true)
      fetch(`/api/bot/stats?serverId=${selectedServer.id}`)
        .then(res => res.json())
        .then(data => {
          setServerStats(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch music stats:', err)
          setLoading(false)
        })
    }
  }, [selectedServer])

  if (!selectedServer || !selectedServer.hasSkyfall) {
    return (
      <div className="glass-card card-padding text-center">
        <div className="text-4xl mb-4">🎵</div>
        <h3 className="text-xl font-bold text-white mb-2">
          {!selectedServer ? 'No Server Selected' : 'Skyfall Not Added'}
        </h3>
        <p className="text-white/70">
          {!selectedServer ? 'Select a server to view music controls' : `Add Skyfall to ${selectedServer.name} to use music features`}
        </p>
      </div>
    )
  }

  const currentSong = serverStats?.musicQueue?.currentSong
  const isPlaying = serverStats?.musicQueue?.isPlaying || false
  const queueLength = serverStats?.musicQueue?.queueLength || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card card-padding">
        <h2 className="text-2xl font-bold heading-gradient">Music for {selectedServer.name}</h2>
        <p className="text-white/70">Control music playback in your server</p>
      </div>
      
      {/* Current Player */}
      <div className="glass-card card-padding">
        <h3 className="text-lg font-bold text-white mb-4">🎵 Now Playing</h3>
        <div className="bg-black/30 rounded-xl p-6 text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="text-white/60 mb-2">Loading...</div>
              <div className="text-white font-semibold mb-4">Fetching current song</div>
            </div>
          ) : (
            <>
              <div className="text-white/60 mb-2">Currently Playing</div>
              <div className="text-white font-semibold mb-4">
                {currentSong ? `${currentSong.title} - ${currentSong.artist}` : 'No song active'}
              </div>
            </>
          )}
          <div className="flex justify-center space-x-4 mb-4">
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">⏮️</button>
            <button className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white hover:scale-110 transition-transform">
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">⏭️</button>
          </div>
          {currentSong && (
            <>
              <div className="bg-white/10 rounded-full h-1 mb-2">
                <div className="bg-gradient-to-r from-purple-400 to-blue-400 h-1 rounded-full w-1/2"></div>
              </div>
              <div className="text-white/60 text-xs">{currentSong.position} / {currentSong.duration}</div>
            </>
          )}
        </div>
      </div>

      {/* Quick Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card card-padding">
          <h4 className="text-white font-semibold mb-3">🎮 Quick Controls</h4>
          <div className="space-y-2">
            <button className="w-full bg-black/20 hover:bg-black/30 text-white p-3 rounded-lg text-left transition-colors flex items-center space-x-3">
              <span>🔀</span>
              <span>Shuffle Queue</span>
            </button>
            <button className="w-full bg-black/20 hover:bg-black/30 text-white p-3 rounded-lg text-left transition-colors flex items-center space-x-3">
              <span>🔁</span>
              <span>Loop Mode</span>
            </button>
            <button className="w-full bg-black/20 hover:bg-black/30 text-white p-3 rounded-lg text-left transition-colors flex items-center space-x-3">
              <span>⏹️</span>
              <span>Stop Playback</span>
            </button>
          </div>
        </div>
        
        <div className="glass-card card-padding">
          <h4 className="text-white font-semibold mb-3">📊 Live Music Stats</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Songs in Queue</span>
              <span className="text-white font-semibold">{queueLength}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Total Played</span>
              <span className="text-white font-semibold">{serverStats?.songsPlayed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Status</span>
              <span className={`font-semibold ${isPlaying ? 'text-green-400' : 'text-white/60'}`}>
                {isPlaying ? '🎵 Playing' : '⏸️ Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModerationTab({ selectedServer }) {
  if (!selectedServer || !selectedServer.hasSkyfall) {
    return (
      <div className="glass-card card-padding text-center">
        <div className="text-4xl mb-4">🛡️</div>
        <h3 className="text-xl font-bold text-white mb-2">
          {!selectedServer ? 'No Server Selected' : 'Skyfall Not Added'}
        </h3>
        <p className="text-white/70">
          {!selectedServer ? 'Select a server to view moderation tools' : `Add Skyfall to ${selectedServer.name} to use moderation features`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card card-padding">
        <h2 className="text-2xl font-bold heading-gradient">Moderation for {selectedServer.name}</h2>
        <p className="text-white/70">Server protection and user management tools</p>
      </div>
      
      {/* Server Health */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card card-padding text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">98.7%</div>
          <div className="text-white/70">Server Health</div>
        </div>
        <div className="glass-card card-padding text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">2</div>
          <div className="text-white/70">Active Warnings</div>
        </div>
        <div className="glass-card card-padding text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">0</div>
          <div className="text-white/70">Security Threats</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card card-padding">
        <h3 className="text-lg font-bold text-white mb-4">🚀 Quick Actions</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <button className="w-full bg-black/20 hover:bg-black/30 text-white p-3 rounded-lg text-left transition-colors flex items-center space-x-3">
            <span>🔨</span>
            <span>Ban Management</span>
          </button>
          <button className="w-full bg-black/20 hover:bg-black/30 text-white p-3 rounded-lg text-left transition-colors flex items-center space-x-3">
            <span>⚠️</span>
            <span>Warning System</span>
          </button>
          <button className="w-full bg-black/20 hover:bg-black/30 text-white p-3 rounded-lg text-left transition-colors flex items-center space-x-3">
            <span>📝</span>
            <span>Audit Logs</span>
          </button>
          <button className="w-full bg-black/20 hover:bg-black/30 text-white p-3 rounded-lg text-left transition-colors flex items-center space-x-3">
            <span>⚙️</span>
            <span>Auto-Mod Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value }) {
  return (
    <div className="glass-card card-padding card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className="text-4xl animate-float">{icon}</div>
      </div>
    </div>
  )
}