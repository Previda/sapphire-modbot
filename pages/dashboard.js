import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const router = useRouter()
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user came from successful bot invite
    if (router.query.success === 'true') {
      // Show success message
      setTimeout(() => {
        setServers([
          { id: 'new-server', name: '✨ Your New Server', members: 1, online: 1, hasSapphire: true, isNew: true },
          { id: 'demo-1', name: '🎮 Gaming Hub', members: 1337, online: 420, hasSapphire: true },
          { id: 'demo-2', name: '💼 Business Server', members: 256, online: 89, hasSapphire: true }
        ])
        setLoading(false)
      }, 1000)
    } else {
      // Regular server list
      setTimeout(() => {
        setServers([
          { id: 'demo-1', name: '🎮 Gaming Hub', members: 1337, online: 420, hasSapphire: true },
          { id: 'demo-2', name: '💼 Business Server', members: 256, online: 89, hasSapphire: true },
          { id: 'demo-3', name: '🎨 Creative Community', members: 892, online: 234, hasSapphire: false }
        ])
        setLoading(false)
      }, 1000)
    }
  }, [router.query])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading your servers...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - Sapphire Modbot</title>
        <meta name="description" content="Manage your Discord servers with Sapphire" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Your Dashboard</h1>
            <p className="text-white/70">Manage your Discord servers with Sapphire</p>
          </div>

          {/* Server Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server, index) => (
              <div 
                key={server.id}
                className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer transform hover:-translate-y-2 opacity-0 animate-slide-in-right delay-${index * 100}`}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{server.name}</h3>
                  {server.hasSapphire ? (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Members</span>
                    <span className="text-white font-semibold">{server.members.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Online</span>
                    <span className="text-green-400 font-semibold">{server.online}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Status</span>
                    <span className={`font-semibold ${server.hasSapphire ? 'text-green-400' : 'text-gray-400'}`}>
                      {server.hasSapphire ? 'Active' : 'Invite Bot'}
                    </span>
                  </div>
                </div>

                {server.hasSapphire ? (
                  <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105">
                    Manage Server
                  </button>
                ) : (
                  <a 
                    href={`https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands&guild_id=${server.id}&redirect_uri=https://skyfall-omega.vercel.app/dashboard?success=true`}
                    className="block w-full mt-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105 text-center"
                  >
                    Add Sapphire
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <button 
              onClick={() => router.push('/')}
              className="text-white/70 hover:text-white transition-colors duration-300"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
