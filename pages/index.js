import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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
                <button className="btn-secondary text-white font-semibold">
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        {!isLoggedIn && (
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

        {/* Dashboard View */}
        {isLoggedIn && (
          <DashboardMain user={user} />
        )}
      </div>
    </>
  )
}

// Dashboard Component
function DashboardMain({ user }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [userGuilds, setUserGuilds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user guilds from Discord API
    const fetchUserGuilds = async () => {
      try {
        const token = localStorage.getItem('discord_token')
        const response = await fetch('/api/auth/guilds', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const guilds = await response.json()
          setUserGuilds(guilds)
        }
      } catch (error) {
        console.error('Failed to fetch guilds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserGuilds()
  }, [])

  return (
    <div className="min-h-screen section-padding animate-fade-in">
      {/* Header with User Profile */}
      <div className="glass-card card-padding mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-5xl font-black heading-gradient">🌌 Skyfall</h1>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 status-online rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-white/90 font-medium">Online & Ready</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Add to Server Button */}
            <button 
              onClick={() => window.open(`https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands`, '_blank')}
              className="btn-secondary text-white font-semibold flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <span>➕</span>
              <span>Add to Server</span>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <img 
                src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png?size=64`}
                alt={user?.username || 'User'}
                className="w-14 h-14 rounded-full border-2 border-purple-400/50 shadow-xl"
                onError={(e) => {
                  e.target.src = `https://cdn.discordapp.com/embed/avatars/${(user?.id || '0') % 5}.png`
                }}
              />
              <div className="text-right">
                <div className="text-white font-bold text-lg">{user?.username || 'SkyfallCommander'}</div>
                <div className="text-white/60 text-sm">Access Level: Skyfall Commander</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card compact-padding mb-8">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: '🌌' },
            { id: 'music', name: 'Music', icon: '🎵' },
            { id: 'appeals', name: 'Justice', icon: '⚖️' },
            { id: 'commands', name: 'Commands', icon: '⚙️' },
            { id: 'moderation', name: 'Moderation', icon: '🛡️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button flex-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white border border-purple-400/50 shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && <OverviewTab user={user} userGuilds={userGuilds} loading={loading} />}
        {activeTab === 'music' && <MusicTab />}
        {activeTab === 'appeals' && <AppealsTab />}
        {activeTab === 'commands' && <CommandsTab />}
        {activeTab === 'moderation' && <ModerationTab />}
      </div>
    </div>
  )
}

// Tab Components
function OverviewTab({ user, userGuilds, loading }) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-card card-padding text-center">
        <div className="text-6xl mb-6 animate-float">🚀</div>
        <h2 className="text-4xl font-bold heading-gradient mb-4">Welcome to Skyfall</h2>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Your command center for advanced Discord server management and automation
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => window.open(`https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands`, '_blank')}
            className="btn-primary text-white font-bold flex items-center space-x-3 px-8 py-4"
          >
            <span>➕</span>
            <span>Add to New Server</span>
          </button>
          <button className="btn-secondary text-white font-semibold px-8 py-4">
            View Documentation
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card card-padding text-center group hover:scale-105 transition-transform duration-300">
          <div className="text-4xl mb-3 animate-float">👥</div>
          <div className="text-3xl font-bold text-white mb-2">1,234</div>
          <div className="text-white/70">Total Users</div>
        </div>
        <div className="glass-card card-padding text-center group hover:scale-105 transition-transform duration-300">
          <div className="text-4xl mb-3 animate-float" style={{animationDelay: '0.2s'}}>🎵</div>
          <div className="text-3xl font-bold text-white mb-2">5,678</div>
          <div className="text-white/70">Songs Played</div>
        </div>
        <div className="glass-card card-padding text-center group hover:scale-105 transition-transform duration-300">
          <div className="text-4xl mb-3 animate-float" style={{animationDelay: '0.4s'}}>⚖️</div>
          <div className="text-3xl font-bold text-white mb-2">12</div>
          <div className="text-white/70">Pending Appeals</div>
        </div>
        <div className="glass-card card-padding text-center group hover:scale-105 transition-transform duration-300">
          <div className="text-4xl mb-3 animate-float" style={{animationDelay: '0.6s'}}>🛡️</div>
          <div className="text-3xl font-bold text-white mb-2">3</div>
          <div className="text-white/70">Active Guards</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card card-padding">
        <h3 className="text-2xl font-bold heading-gradient mb-6 text-center">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <button className="glass-card card-padding card-hover group text-center">
            <div className="text-5xl mb-4 animate-float group-hover:scale-110 transition-transform duration-300">🎵</div>
            <h4 className="text-xl font-bold text-white mb-2">Music Controls</h4>
            <p className="text-white/70">Manage playlists and audio</p>
          </button>
          <button className="glass-card card-padding card-hover group text-center">
            <div className="text-5xl mb-4 animate-float group-hover:scale-110 transition-transform duration-300" style={{animationDelay: '0.3s'}}>⚙️</div>
            <h4 className="text-xl font-bold text-white mb-2">Bot Settings</h4>
            <p className="text-white/70">Configure commands and features</p>
          </button>
          <button className="glass-card card-padding card-hover group text-center">
            <div className="text-5xl mb-4 animate-float group-hover:scale-110 transition-transform duration-300" style={{animationDelay: '0.6s'}}>📊</div>
            <h4 className="text-xl font-bold text-white mb-2">Server Analytics</h4>
            <p className="text-white/70">View detailed statistics</p>
          </button>
        </div>
      </div>
    </div>
  )
}

function MusicTab() {
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState([])

  return (
    <div className="space-y-6">
      {/* Now Playing */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🌌 Skyfall Music Engine</h2>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl">{isPlaying ? '▶️' : '🎵'}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">
              {currentSong ? currentSong.title : 'Skyfall is silent'}
            </h3>
            <p className="text-white opacity-75">
              {currentSong ? `By ${currentSong.artist}` : 'Music queue awaits your command'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="glass px-4 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10">
              ⏮️
            </button>
            <button 
              className="glass px-4 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="glass px-4 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10">
              ⏭️
            </button>
          </div>
        </div>
      </div>

      {/* Music Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🎶 Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full glass px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 text-left">
              🔀 Shuffle Queue
            </button>
            <button className="w-full glass px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 text-left">
              🔁 Loop Current
            </button>
            <button className="w-full glass px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 text-left">
              ⏹️ Stop Playback
            </button>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Stats</h3>
        </div>
      </div>
    </div>
  )
}

function AppealsTab() {
  return (
    <div className="space-y-8">
      <div className="glass-card card-padding text-center">
        <div className="text-6xl mb-6 animate-float">⚖️</div>
        <h2 className="text-4xl font-bold heading-gradient mb-4">Justice System</h2>
        <p className="text-xl text-white/80 mb-8">Automated moderation with intelligent appeal processing</p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-blue-500/20 rounded-2xl p-6 border border-blue-400/30">
            <div className="text-3xl font-bold text-white mb-2">12</div>
            <div className="text-white/70">Pending Appeals</div>
          </div>
          <div className="bg-green-500/20 rounded-2xl p-6 border border-green-400/30">
            <div className="text-3xl font-bold text-white mb-2">156</div>
            <div className="text-white/70">Resolved Cases</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommandsTab() {
  return (
    <div className="space-y-8">
      <div className="glass-card card-padding text-center">
        <div className="text-6xl mb-6 animate-float">⚙️</div>
        <h2 className="text-4xl font-bold heading-gradient mb-4">Command Arsenal</h2>
        <p className="text-xl text-white/80 mb-8">Comprehensive toolkit for server management and automation</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-purple-500/20 rounded-2xl p-6 border border-purple-400/30">
            <div className="text-4xl mb-3">🎵</div>
            <div className="text-xl font-bold text-white mb-2">Music</div>
            <div className="text-white/70">15 commands</div>
          </div>
          <div className="bg-red-500/20 rounded-2xl p-6 border border-red-400/30">
            <div className="text-4xl mb-3">🛡️</div>
            <div className="text-xl font-bold text-white mb-2">Moderation</div>
            <div className="text-white/70">22 commands</div>
          </div>
          <div className="bg-blue-500/20 rounded-2xl p-6 border border-blue-400/30">
            <div className="text-4xl mb-3">🎮</div>
            <div className="text-xl font-bold text-white mb-2">Fun</div>
            <div className="text-white/70">8 commands</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModerationTab() {
  return (
    <div className="space-y-8">
      <div className="glass-card card-padding text-center">
        <div className="text-6xl mb-6 animate-float">🛡️</div>
        <h2 className="text-4xl font-bold heading-gradient mb-4">Moderation Hub</h2>
        <p className="text-xl text-white/80 mb-8">Advanced server protection and user management</p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-green-500/20 rounded-2xl p-6 border border-green-400/30">
            <div className="text-3xl font-bold text-white mb-2">98.7%</div>
            <div className="text-white/70">Server Health</div>
          </div>
          <div className="bg-yellow-500/20 rounded-2xl p-6 border border-yellow-400/30">
            <div className="text-3xl font-bold text-white mb-2">3</div>
            <div className="text-white/70">Active Warnings</div>
          </div>
          <div className="bg-red-500/20 rounded-2xl p-6 border border-red-400/30">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-white/70">Security Threats</div>
          </div>
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