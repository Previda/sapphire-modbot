import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Skyfall - Advanced Discord Management</title>
        <meta name="description" content="Skyfall - Advanced Discord Management with comprehensive features" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-white font-semibold text-lg">Skyfall</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Advanced Discord
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {' '}Moderation
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                Powerful moderation tools, advanced security features, and comprehensive server management 
                all in one sophisticated Discord bot.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/invite"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg"
                >
                  Add to Server
                </Link>
                
                <Link 
                  href="/dashboard"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 backdrop-blur-sm border border-white/20"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🛡️</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Advanced Security</h3>
              <p className="text-white/70">
                Anti-raid, anti-nuke, and comprehensive threat detection to keep your server safe.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎫</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Ticket System</h3>
              <p className="text-white/70">
                Professional support ticket system with transcripts and case management.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Analytics Dashboard</h3>
              <p className="text-white/70">
                Real-time server analytics and moderation insights through our web dashboard.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎵</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Music Player</h3>
              <p className="text-white/70">
                High-quality music streaming with playlist support and audio controls.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Lightning Fast</h3>
              <p className="text-white/70">
                Optimized performance with minimal latency and maximum reliability.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🔧</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Easy Setup</h3>
              <p className="text-white/70">
                Simple configuration with intuitive commands and comprehensive documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-white/60">
              <p>&copy; 2024 Skyfall. Advanced Discord server management.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
