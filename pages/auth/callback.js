import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { code } = router.query
    
    if (code) {
      // Handle Discord OAuth callback
      exchangeCodeForToken(code)
    }
  }, [router.query])

  const exchangeCodeForToken = async (code) => {
    try {
      console.log('🔐 Starting Discord auth exchange with code:', code)
      const response = await fetch('/api/auth/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Auth API error:', errorText)
        
        // Clear any existing auth data
        localStorage.removeItem('discord_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('auth_completed')
        
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Auth successful, user data received:', data)
      
      if (data.access_token && data.user) {
        localStorage.setItem('discord_token', data.access_token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        localStorage.setItem('auth_completed', 'true')
        
        console.log('🚀 Redirecting to dashboard...')
        // Use replace to prevent back button issues
        window.location.replace('/')
      } else {
        console.error('Missing data in response:', data)
        throw new Error('Missing token or user data in response')
      }
    } catch (error) {
      console.error('❌ Auth exchange failed:', error)
      
      // Clear any existing auth data
      localStorage.removeItem('discord_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('auth_completed')
      
      // Redirect back to home with error
      window.location.replace('/?error=auth_failed')
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="glass-card card-padding text-center animate-fade-in max-w-md mx-auto">
        <div className="text-6xl mb-8 animate-float">🔐</div>
        <h2 className="text-3xl font-bold heading-gradient mb-4">Authenticating</h2>
        <p className="text-white/70 text-lg leading-relaxed mb-6">Securing your connection to Skyfall...</p>
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}
