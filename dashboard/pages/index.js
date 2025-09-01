import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  const handleDiscordLogin = () => {
    // Discord OAuth URL - you need to set NEXT_PUBLIC_DISCORD_CLIENT_ID in Vercel
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1292235331921334324'
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
        <meta name="description" content="Modern Discord Bot Management Dashboard" />
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
                  🌌 Skyfall
                </h1>
                <p className="text-xl text-white opacity-90 animate-fade-in" style={{animationDelay: '0.3s'}}>
                  Advanced Discord Bot Management Dashboard
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
                <div className="glass rounded-xl p-6 card-hover">
                  <div className="text-4xl mb-4">🎵</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Music Control</h3>
                  <p className="text-white opacity-75">Manage music playback, queue, and live updates</p>
                </div>
                
                <div className="glass rounded-xl p-6 card-hover">
                  <div className="text-4xl mb-4">⚖️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Appeal Management</h3>
                  <p className="text-white opacity-75">Review and process user appeals with ease</p>
                </div>
                
                <div className="glass rounded-xl p-6 card-hover">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Command Control</h3>
                  <p className="text-white opacity-75">Toggle and customize bot commands dynamically</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.9s'}}>
                {!isLoggedIn ? (
                  <button
                    onClick={handleDiscordLogin}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🔐 Login with Discord
                  </button>
                ) : (
                  <button
                    onClick={openDashboard}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    📊 Open Dashboard
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              <div className="mt-12 animate-fade-in" style={{animationDelay: '1.2s'}}>
                <div className="glass rounded-lg p-4 inline-block">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-custom"></div>
                    <span className="text-white font-medium">Bot Status: Online</span>
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
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-custom"></div>
              <span className="text-white">Bot Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass rounded-xl p-2 mb-6">
        <nav className="flex space-x-2">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'music', name: 'Music', icon: '🎵' },
            { id: 'appeals', name: 'Appeals', icon: '⚖️' },
            { id: 'commands', name: 'Commands', icon: '⚙️' },
            { id: 'moderation', name: 'Moderation', icon: '🛡️' }
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
        <h2 className="text-2xl font-bold text-white mb-4">🎵 Now Playing</h2>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">No music playing</h3>
            <p className="text-white opacity-75">Queue is empty</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppealsTab() {
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">⚖️ Appeal Management</h2>
      <div className="text-white opacity-75">
        <p>No pending appeals</p>
      </div>
    </div>
  )
}

function CommandsTab() {
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">⚙️ Command Management</h2>
      <div className="text-white opacity-75">
        <p>Command toggles and settings will appear here</p>
      </div>
    </div>
  )
}

function ModerationTab() {
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">🛡️ Moderation Tools</h2>
      <div className="text-white opacity-75">
        <p>Moderation actions and logs will appear here</p>
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
