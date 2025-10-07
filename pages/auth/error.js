import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  useEffect(() => {
    // Auto-redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">❌</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
        <p className="text-white/70 mb-6">
          {error === 'Configuration' && 'There was a problem with the server configuration.'}
          {error === 'AccessDenied' && 'Access was denied. Please try again.'}
          {error === 'Verification' && 'The verification link was invalid or has expired.'}
          {!error && 'An authentication error occurred.'}
        </p>
        <p className="text-white/50 text-sm">Redirecting to home page...</p>
      </div>
    </div>
  )
}
