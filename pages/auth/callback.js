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
      console.log(' Starting Discord auth exchange with code:', code)
      const response = await fetch('/api/auth/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      console.log(' Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(' Auth API error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log(' Auth successful, user data received')
      
      if (data.access_token && data.user) {
        localStorage.setItem('discord_token', data.access_token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        localStorage.setItem('auth_completed', 'true')
        
        console.log(' Redirecting to dashboard...')
        window.location.replace('/')
      } else {
        throw new Error('Missing token or user data in response')
      }
    } catch (error) {
      console.error(' Auth exchange failed:', error)
      const errorMsg = error.message.includes('redirect_uri') ? 
        'OAuth redirect URI mismatch. Please contact support.' : 
        `Authentication failed: ${error.message}`
      
      alert(` ${errorMsg}`)
      window.location.href = '/?error=auth_failed'
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <div className="text-4xl mb-4 animate-pulse-custom">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
        <p className="text-white opacity-75">Please wait while we log you in</p>
      </div>
    </div>
  )
}
