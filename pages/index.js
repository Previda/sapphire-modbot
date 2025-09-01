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
    // Discord OAuth URL - you need to set NEXT_PUBLIC_DISCORD_CLIENT_ID in Vercel
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1358527215020544222'
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback')
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`
    
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
        {/* Hero Section */}
        {!isLoggedIn && (
          <div className="flex items-center justify-center min-h-screen px-4 animate-fade-in">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo/Title */}
              <div className="mb-8">
                <h1 className="text-6xl font-bold text-white mb-4 animate-slide-in">
                  🌌 SKYFALL
                </h1>
                <p className="text-xl text-white opacity-90 animate-fade-in" style={{animationDelay: '0.3s'}}>
                  Ultimate Skyfall Bot Command Center
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
                <div className="glass rounded-xl p-6 card-hover">
                  <div className="text-4xl mb-4">🎵</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Skyfall Music</h3>
                  <p className="text-white opacity-75">Control Skyfall's music system with live updates and queue management</p>
                </div>
                
                <div className="glass rounded-xl p-6 card-hover">
                  <div className="text-4xl mb-4">⚖️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Skyfall Appeals</h3>
                  <p className="text-white opacity-75">Manage appeals and justice through Skyfall's advanced system</p>
                </div>
                
                <div className="glass rounded-xl p-6 card-hover">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Skyfall Commands</h3>
                  <p className="text-white opacity-75">Configure and customize Skyfall's powerful command arsenal</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.9s'}}>
                <button
                  onClick={handleDiscordLogin}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🌌 Access Skyfall Command Center
                </button>
              </div>

              {/* Status Indicator */}
              <div className="mt-12 animate-fade-in" style={{animationDelay: '1.2s'}}>
                <div className="glass rounded-lg p-4 inline-block">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-custom"></div>
                    <span className="text-white font-medium">Skyfall Status: Online</span>
                  </div>
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
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header with User Profile */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">🌌 Skyfall Control Room</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <img 
                src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png?size=64`}
                alt={user?.username || 'User'}
                className="w-10 h-10 rounded-full border-2 border-indigo-400"
                onError={(e) => {
                  e.target.src = `https://cdn.discordapp.com/embed/avatars/${(user?.id || '0') % 5}.png`
                }}
              />
              <div className="text-right">
                <div className="text-white font-semibold">Welcome, {user?.username || 'User'}!</div>
                <div className="text-white opacity-75 text-sm">#{user?.discriminator || '0000'}</div>
              </div>
            </div>
            
            {/* Status */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-custom"></div>
              <span className="text-white">Skyfall Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass rounded-xl p-2 mb-6">
        <nav className="flex space-x-2">
          {[
            { id: 'overview', name: 'Skyfall Overview', icon: '🌌' },
            { id: 'music', name: 'Skyfall Music', icon: '🎵' },
            { id: 'appeals', name: 'Skyfall Justice', icon: '⚖️' },
            { id: 'commands', name: 'Skyfall Arsenal', icon: '⚙️' },
            { id: 'moderation', name: 'Skyfall Guard', icon: '🛡️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
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
  const elevatedGuilds = userGuilds.elevatedGuilds || []
  const totalGuilds = userGuilds.totalGuilds || 0

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">👤 Commander Profile</h2>
        <div className="flex items-center space-x-6">
          <img 
            src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png?size=128`}
            alt={user?.username || 'User'}
            className="w-20 h-20 rounded-full border-4 border-indigo-400"
            onError={(e) => {
              e.target.src = `https://cdn.discordapp.com/embed/avatars/${(user?.id || '0') % 5}.png`
            }}
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{user?.username || 'Unknown User'}</h3>
            <p className="text-white opacity-75">#{user?.discriminator || '0000'}</p>
            <p className="text-indigo-300 mt-2">Discord ID: {user?.id || 'Unknown'}</p>
          </div>
          <div className="text-right">
            <div className="text-white opacity-75 text-sm mb-1">Access Level</div>
            <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-semibold">
              Skyfall Commander
            </div>
          </div>
        </div>
      </div>

      {/* Server Permissions */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🏰 Your Kingdoms</h2>
        {loading ? (
          <div className="text-white opacity-75">Loading your server permissions...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-indigo-600/20 rounded-lg p-4 border border-indigo-400/30">
                <div className="text-2xl font-bold text-white">{totalGuilds}</div>
                <div className="text-white opacity-75">Total Servers</div>
              </div>
              <div className="bg-emerald-600/20 rounded-lg p-4 border border-emerald-400/30">
                <div className="text-2xl font-bold text-white">{elevatedGuilds.length}</div>
                <div className="text-white opacity-75">Elevated Access</div>
              </div>
            </div>
            
            {elevatedGuilds.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Servers with Elevated Access:</h3>
                <div className="grid gap-3">
                  {elevatedGuilds.slice(0, 5).map((guild) => (
                    <div key={guild.id} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      {guild.icon ? (
                        <img 
                          src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=32`}
                          alt={guild.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {guild.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-white font-medium">{guild.name}</div>
                        <div className="text-white opacity-60 text-sm">
                          {guild.owner ? 'Owner' : 'Administrator'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {elevatedGuilds.length > 5 && (
                    <div className="text-white opacity-75 text-sm text-center">
                      +{elevatedGuilds.length - 5} more servers...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-white opacity-75 text-center py-4">
                No servers with elevated permissions found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="👥" title="Total Users" value="1,234" />
        <StatCard icon="🎵" title="Songs Played" value="5,678" />
        <StatCard icon="⚖️" title="Pending Appeals" value="12" />
        <StatCard icon="🛡️" title="Active Moderation" value="3" />
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
          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Songs Played Today:</span>
              <span className="font-semibold">42</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Queue Length:</span>
              <span className="font-semibold">{queue.length}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Active Listeners:</span>
              <span className="font-semibold">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppealsTab() {
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">⚖️ Skyfall Justice System</h2>
      <div className="text-white opacity-75">
        <p>No appeals requiring Skyfall's judgment</p>
      </div>
    </div>
  )
}

function CommandsTab() {
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">⚙️ Skyfall Command Arsenal</h2>
      <div className="text-white opacity-75">
        <p>Configure Skyfall's powerful command arsenal</p>
      </div>
    </div>
  )
}

function ModerationTab() {
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">🛡️ Skyfall Guardian Systems</h2>
      <div className="text-white opacity-75">
        <p>Skyfall's protection protocols and guardian logs</p>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value }) {
  return (
    <div className="glass rounded-xl p-6 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white opacity-75 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}
/ /   F o r c e   r e b u i l d   0 8 / 3 1 / 2 0 2 5   2 1 : 2 2 : 2 2  
 / /   C a c h e   b u s t   0 9 / 0 1 / 2 0 2 5   0 9 : 0 7 : 1 7  
 