import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('discord_token')
    if (token) {
      router.push('/')
    }

    // Handle OAuth callback
    const { code } = router.query
    if (code) {
      handleOAuthCallback(code)
    }
  }, [router.query])

  const handleOAuthCallback = async (code) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      const data = await response.json()
      
      // Store token and user data
      localStorage.setItem('discord_token', data.access_token)
      localStorage.setItem('skyfall_auth', JSON.stringify(data))
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('OAuth callback error:', error);
      alert('Authentication failed. Please try again.')
    }
    
    setLoading(false);
  };

  const handleDiscordLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1358527215020544222'
    const redirectUri = encodeURIComponent(`${window.location.origin}/login`)
    const scope = encodeURIComponent('identify guilds')
    
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
    
    window.location.href = discordAuthUrl
  };

  const handleQuickAccess = () => {
    setLoading(true)
    
    // Create demo user for quick access
    const demoUser = {
      id: 'demo_user',
      username: 'Demo Admin',
      discriminator: '0001',
      avatar: null,
      isAdmin: true,
      access_token: 'demo_token'
    }
    
    localStorage.setItem('skyfall_auth', JSON.stringify(demoUser))
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  };

  return (
    <>
      <Head>
        <title>Login - Skyfall Dashboard</title>
        <meta name="description" content="Login to Skyfall Discord Management Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-50">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <span className="text-4xl font-bold text-white">S</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Skyfall
            </h1>
            <p className="text-gray-300 text-xl font-medium">
              Ultra Modern Discord Management
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Professional • Seamless • Beautiful
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            {/* Discord Login Button */}
            <button
              onClick={handleDiscordLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 mb-4 border border-transparent text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Connecting to Discord...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                  </svg>
                  Continue with Discord
                </div>
              )}
            </button>

            {/* Quick Access Button */}
            <button
              onClick={handleQuickAccess}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 border border-white/30 text-base font-medium rounded-2xl text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Access (Demo)
              </div>
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Secure authentication with Discord OAuth 2.0
              </p>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">🚀</div>
              <p className="text-xs text-gray-300">Modern UI</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-xs text-gray-300">Secure Auth</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-xs text-gray-300">Real-time</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Professional Discord Server Management • Built with ❤️
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}
