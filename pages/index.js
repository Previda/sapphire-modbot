import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    
    // Check if user came back from Discord OAuth (bot added)
    if (router.query.success === 'true' || router.query.guild_id) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [router.query])

  return (
    <>
      <Head>
        <title>Sapphire Modbot - Discord Bot Dashboard</title>
        <meta name="description" content="Advanced Discord moderation bot with music, tickets, and more" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-ping delay-2000"></div>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-green-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400/30">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold">Bot Added Successfully!</p>
                  <p className="text-sm text-green-100">Sapphire is now active in your server</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-110 group">
              <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300">S</span>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4 hover:scale-105 transition-transform duration-300">
              Sapphire Modbot
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Advanced Discord bot with <span className="text-purple-300 font-semibold">60+ commands</span>, music, tickets, and intelligent moderation
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              { icon: "🎵", title: "Music System", desc: "High-quality audio streaming with queue management and Spotify integration", delay: "delay-100" },
              { icon: "🎫", title: "Ticket System", desc: "Advanced support tickets with transcripts and role-based permissions", delay: "delay-200" },
              { icon: "🛡️", title: "Smart Moderation", desc: "AI-powered automod with anti-raid protection and threat detection", delay: "delay-300" },
              { icon: "💰", title: "Economy System", desc: "Complete virtual economy with daily rewards, work commands, and leaderboards", delay: "delay-400" },
              { icon: "🎮", title: "Fun & Games", desc: "Entertainment commands, mini-games, and interactive features", delay: "delay-500" },
              { icon: "⚙️", title: "Fully Customizable", desc: "Per-server settings, custom commands, and flexible configuration", delay: "delay-600" }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 group cursor-pointer transform hover:-translate-y-2 ${isLoaded ? `opacity-100 translate-y-0 ${feature.delay}` : 'opacity-0 translate-y-10'}`}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:animate-bounce">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300 leading-relaxed">
                  {feature.desc}
                </p>
                <div className="mt-6 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 group-hover:via-purple-400 transition-all duration-500 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Invite Button */}
          <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0 delay-700' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-6">
              <p className="text-white/60 mb-4">Ready to supercharge your Discord server?</p>
            </div>
            <a
              href="https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands&redirect_uri=https://skyfall-omega.vercel.app/?success=true"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white transition-all duration-500 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-2xl hover:from-purple-500 hover:via-blue-500 hover:to-purple-600 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-1"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500"></span>
              <span className="relative flex items-center space-x-3">
                <span className="text-2xl group-hover:animate-bounce">🚀</span>
                <span>Add Sapphire to Your Server</span>
                <span className="text-lg opacity-75 group-hover:opacity-100 transition-opacity">→</span>
              </span>
            </a>
            <p className="text-white/50 text-sm mt-4">
              Takes less than 30 seconds • No setup required
            </p>
          </div>

          {/* Stats & Status */}
          <div className={`mt-16 text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0 delay-800' : 'opacity-0 translate-y-10'}`}>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-green-400/30 transition-all duration-300">
                <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
                <div className="text-white/70">Uptime</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300">
                <div className="text-3xl font-bold text-blue-400 mb-2">5+</div>
                <div className="text-white/70">Active Servers</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300">
                <div className="text-3xl font-bold text-purple-400 mb-2">59</div>
                <div className="text-white/70">Commands</div>
              </div>
            </div>
            
            <div className="inline-flex items-center bg-green-500/10 backdrop-blur-sm text-green-400 px-6 py-3 rounded-full border border-green-400/20 hover:border-green-400/40 transition-all duration-300">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="font-semibold">Bot Online</span>
              <span className="mx-2">•</span>
              <span className="text-green-300">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
