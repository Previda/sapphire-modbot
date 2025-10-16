import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Invite() {
  const router = useRouter()
  const [step, setStep] = useState('terms')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      })
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  const handleInviteBot = () => {
    if (!acceptedTerms) {
      alert('Please accept the Terms of Service to continue')
      return
    }
    
    // Direct Discord invite
    window.open(
      'https://discord.com/api/oauth2/authorize?client_id=1358527215020544222&permissions=8&scope=bot%20applications.commands',
      '_blank'
    )
    
    // Show success with smooth transition
    setStep('success')
  }

  const handleContinue = () => {
    setFadeOut(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 600)
  }

  return (
    <>
      <Head>
        <title>Invite Skyfall - Discord Bot</title>
        <meta name="description" content="Add Skyfall to your Discord server" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {step === 'terms' && (
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <span className="text-3xl font-bold text-white">S</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Add Skyfall to Your Server</h1>
                <p className="text-white/70">Please review our terms before adding the bot</p>
              </div>

              {/* Terms of Service */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Terms of Service</h2>
                
                <div className="space-y-4 text-white/80 text-sm max-h-96 overflow-y-auto">
                  <div>
                    <h3 className="font-semibold text-white mb-2">1. Bot Usage</h3>
                    <p>By adding Skyfall to your Discord server, you agree to use the bot responsibly and in accordance with Discord's Terms of Service.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">2. Data Collection</h3>
                    <p>Skyfall may collect and store server configuration data, user IDs, and message content for moderation purposes. We do not store personal information beyond what's necessary for bot functionality.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">3. Permissions</h3>
                    <p>The bot requires Administrator permissions to function properly. These permissions are used solely for moderation, music playback, and server management features.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">4. Availability</h3>
                    <p>We strive for 99.9% uptime but cannot guarantee uninterrupted service. The bot is provided "as is" without warranties.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">5. Support</h3>
                    <p>Support is provided on a best-effort basis. For issues or questions, please contact us through our support channels.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">6. Termination</h3>
                    <p>You may remove the bot from your server at any time. We reserve the right to terminate service for violations of these terms.</p>
                  </div>
                </div>
              </div>

              {/* Privacy Policy */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Privacy Policy</h2>
                
                <div className="space-y-4 text-white/80 text-sm">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Data We Collect</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Server ID and configuration settings</li>
                      <li>User IDs for moderation actions</li>
                      <li>Message content for automod filtering</li>
                      <li>Command usage statistics</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">How We Use Data</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Provide bot functionality and features</li>
                      <li>Improve service quality and performance</li>
                      <li>Enforce server rules and moderation</li>
                      <li>Generate usage analytics</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">Data Security</h3>
                    <p>We implement appropriate security measures to protect your data. Data is encrypted in transit and at rest.</p>
                  </div>
                </div>
              </div>

              {/* Acceptance */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-purple-400 bg-transparent checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-400"
                  />
                  <span className="text-white">
                    I have read and agree to the Terms of Service and Privacy Policy
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteBot}
                  disabled={!acceptedTerms}
                  className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
                    acceptedTerms
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white hover:scale-105'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Add Skyfall to Server
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className={`max-w-md mx-auto text-center transition-all duration-600 ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 shadow-2xl animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 animate-slide-up">Bot Added Successfully!</h2>
                <p className="text-white/80 mb-8 text-lg animate-slide-up" style={{animationDelay: '0.1s'}}>
                  {isAuthenticated 
                    ? 'Skyfall is now active in your server. Ready to manage your Discord!'
                    : 'Skyfall is ready! Login with Discord to access your dashboard.'}
                </p>
                <button
                  onClick={handleContinue}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-slide-up"
                  style={{animationDelay: '0.2s'}}
                >
                  {isAuthenticated ? 'Continue to Dashboard →' : 'Login with Discord →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
