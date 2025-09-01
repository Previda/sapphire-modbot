import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('discord_token')
    const userData = localStorage.getItem('user_data')
    
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
      setShowDashboard(true)
    }

    // Check URL for login success
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('logged_in') === 'true') {
      setIsLoggedIn(true)
      setShowDashboard(true)
    }
  }, [])

  const handleDiscordLogin = () => {
    // Discord OAuth URL - you need to set NEXT_PUBLIC_DISCORD_CLIENT_ID in Vercel
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1358527215020544222'
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback')
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`
    
    window.location.href = discordUrl
  }

  const openDashboard = () => {
    setShowDashboard(true)
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
        {!showDashboard && (
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
                {!isLoggedIn ? (
                  <button
                    onClick={handleDiscordLogin}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🌌 Access Skyfall Command Center
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-white text-lg">
                      Welcome back, {user?.username || 'User'}!
                    </div>
                    <button
                      onClick={openDashboard}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      🌌 Enter Skyfall Control Room
                    </button>
                  </div>
                )}
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
        {showDashboard && (
          <DashboardMain />
        )}
      </div>
    </>
  )
}

// Dashboard Component
function DashboardMain() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">🌌 Skyfall Control Room</h1>
          <div className="flex space-x-4">
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
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'music' && <MusicTab />}
        {activeTab === 'appeals' && <AppealsTab />}
        {activeTab === 'commands' && <CommandsTab />}
        {activeTab === 'moderation' && <ModerationTab />}
      </div>
    </div>
  )
}

// Tab Components
function OverviewTab() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon="👥" title="Total Users" value="1,234" />
      <StatCard icon="🎵" title="Songs Played" value="5,678" />
      <StatCard icon="⚖️" title="Pending Appeals" value="12" />
      <StatCard icon="🛡️" title="Active Moderation" value="3" />
    </div>
  )
}

function MusicTab() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🌌 Skyfall Music Engine</h2>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Skyfall is silent</h3>
            <p className="text-white opacity-75">Music queue awaits your command</p>
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
