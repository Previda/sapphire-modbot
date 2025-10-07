import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Sapphire Modbot - Discord Bot Dashboard</title>
        <meta name="description" content="Advanced Discord moderation bot with music, tickets, and more" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Sapphire Modbot</h1>
            <p className="text-xl text-white/70 mb-8">
              Advanced Discord bot with 60+ commands, music, tickets, and moderation
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-white mb-2">Music System</h3>
              <p className="text-white/70">Play music from YouTube, Spotify, and more with queue management</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🎫</div>
              <h3 className="text-xl font-bold text-white mb-2">Ticket System</h3>
              <p className="text-white/70">Advanced ticket system with transcripts and role management</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-2">Moderation</h3>
              <p className="text-white/70">Complete moderation suite with automod and anti-raid protection</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">Economy</h3>
              <p className="text-white/70">Full economy system with daily rewards and work commands</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-2">Fun Commands</h3>
              <p className="text-white/70">Entertainment commands including 8ball, roll, and games</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-white mb-2">Customizable</h3>
              <p className="text-white/70">Fully customizable with per-server settings and configurations</p>
            </div>
          </div>

          {/* Invite Button */}
          <div className="text-center">
            <a
              href="https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200 shadow-lg text-lg"
            >
              🚀 Invite Sapphire to Your Server
            </a>
          </div>

          {/* Status */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Bot Online - All Systems Operational
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
