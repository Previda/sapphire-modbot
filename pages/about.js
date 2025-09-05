import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function About() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      icon: '🛡️',
      title: 'Advanced Moderation',
      description: 'Comprehensive moderation tools including bans, kicks, timeouts, warnings, and automated moderation with case tracking.'
    },
    {
      icon: '🎵',
      title: 'Music Player',
      description: 'High-quality music playback with queue management, playlists, lyrics, and controls for an enhanced listening experience.'
    },
    {
      icon: '🎫',
      title: 'Ticket System',
      description: 'Professional support ticket system with categories, transcripts, and automated management for community support.'
    },
    {
      icon: '📊',
      title: 'Server Analytics',
      description: 'Detailed server statistics, member activity tracking, command usage analytics, and growth insights.'
    },
    {
      icon: '💰',
      title: 'Economy System',
      description: 'Complete economy with currency, jobs, daily rewards, leaderboards, and engaging economic activities.'
    },
    {
      icon: '⚡',
      title: 'Utility Commands',
      description: 'Essential utility tools including server info, user info, polls, reminders, and administrative functions.'
    }
  ];

  const stats = [
    { label: 'Total Commands', value: '42+' },
    { label: 'Servers Supported', value: '1000+' },
    { label: 'Uptime', value: '99.9%' },
    { label: 'Response Time', value: '<50ms' }
  ];

  return (
    <>
      <Head>
        <title>About • Skyfall Bot</title>
        <meta name="description" content="Learn about Skyfall Discord Bot - Advanced moderation, music, and utility features for your Discord server" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.07l7 3.5v7.36l-7-3.5V9.07zm16 0v7.36l-7 3.5v-7.36l7-3.5z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Skyfall
              </span>
              <span className="text-white/90"> Bot</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate Discord bot for server management, moderation, music, and community engagement. 
              Designed with modern features and optimized for performance.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
              >
                Open Dashboard
              </a>
              <a 
                href="https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 px-8 py-3 rounded-xl text-white font-medium transition-all duration-200"
              >
                Invite to Server
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Powerful Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Technical Excellence</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🚀 Performance Optimized</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Built with Discord.js v14 for optimal performance</li>
                  <li>• Raspberry Pi optimized for low-resource environments</li>
                  <li>• Advanced caching and rate limit handling</li>
                  <li>• Sub-50ms response times for most commands</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🔒 Security & Reliability</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Comprehensive permission system</li>
                  <li>• Data encryption and secure storage</li>
                  <li>• Regular backups and failover systems</li>
                  <li>• GDPR compliant data handling</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Open Source Section */}
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Open Source & Community Driven</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Skyfall Bot is open source and welcomes contributions from developers worldwide. 
                Join our community to help improve and expand the bot's capabilities.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="https://github.com/yourusername/skyfall-modbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
                <a 
                  href="https://discord.gg/your-support-server"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#5865F2] hover:bg-[#4752C4] px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                  </svg>
                  Join Discord
                </a>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <a 
                href="/" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                ← Back to Dashboard
              </a>
              <a 
                href="/terms" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="/privacy" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Privacy Policy
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Skyfall Bot. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
