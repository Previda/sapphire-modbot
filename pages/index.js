import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ModernDashboard from '../components/ModernDashboard'

export default function Home() {
  const { data: session, status } = useSession()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check NextAuth session
    if (status === 'loading') return
    
    if (session) {
      setUser(session.user)
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
      setUser(null)
    }
    
    setIsLoading(false)
  }, [session, status])

  const handleLogin = () => {
    signIn('discord')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading Sapphire...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Sapphire Modbot - Professional Discord Bot Dashboard</title>
        <meta name="description" content="Advanced Discord Bot Management with Live Analytics, Music & Verification" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoggedIn ? (
        <ModernDashboard user={user} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Landing Navigation */}
          <nav className="absolute top-0 left-0 right-0 z-10 p-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="flex justify-between items-center max-w-6xl mx-auto px-8 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-white">S</span>
                  </div>
                  <span className="text-xl font-bold text-white">Sapphire</span>
                </div>
                <div className="flex items-center space-x-8">
                  <a href="#features" className="text-white/80 hover:text-white transition-colors font-medium">Features</a>
                  <a href="#docs" className="text-white/80 hover:text-white transition-colors font-medium">Docs</a>
                  <button 
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Login with Discord
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="flex items-center justify-center min-h-screen px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-16">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl mx-auto mb-8 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">S</span>
                </div>
                <h1 className="text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6">
                  Sapphire
                </h1>
                <p className="text-2xl text-white/80 font-light mb-12 leading-relaxed">
                  Professional Discord Bot Management Platform
                </p>
                
                <button 
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xl font-bold px-12 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  🚀 Get Started
                </button>
              </div>

              {/* Features Preview */}
              <div className="grid md:grid-cols-3 gap-8 mt-20">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">🎵</div>
                  <h3 className="text-xl font-bold text-white mb-3">Advanced Music</h3>
                  <p className="text-white/70">High-quality audio streaming with queue management</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">🛡️</div>
                  <h3 className="text-xl font-bold text-white mb-3">Smart Moderation</h3>
                  <p className="text-white/70">AI-powered protection and automated enforcement</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-white mb-3">Live Analytics</h3>
                  <p className="text-white/70">Real-time insights and performance monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
