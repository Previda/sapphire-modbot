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
      const response = await fetch('/api/auth/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('discord_token', data.access_token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        // Clear URL and redirect to dashboard
        window.history.replaceState({}, document.title, '/')
        router.push('/?logged_in=true')
      } else {
        router.push('/?error=auth_failed')
      }
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/?error=auth_failed')
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
