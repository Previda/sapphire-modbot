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
      console.log('Starting Discord auth exchange...')
      const response = await fetch('/api/auth/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Auth successful, storing data...')
        localStorage.setItem('discord_token', data.access_token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        localStorage.setItem('auth_completed', 'true')
        
        console.log('Redirecting to dashboard...')
        // Set a flag to force dashboard view
        localStorage.setItem('force_dashboard', 'true')
        
        // Use setTimeout to ensure localStorage is written
        setTimeout(() => {
          window.location.replace(window.location.origin + '/')
        }, 200)
      } else {
        console.error('Auth failed:', response)
        window.location.href = window.location.origin + '/?error=auth_failed'
      }
    } catch (error) {
      console.error('Auth error:', error)
      window.location.href = window.location.origin + '/?error=auth_failed'
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
