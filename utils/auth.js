import { useState, useEffect } from 'react'

// Authentication utilities for Discord OAuth

export const getDiscordToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('discord_token')
}

export const getDiscordUser = () => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('discord_user')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = () => {
  return getDiscordToken() !== null
}

export const logout = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('discord_token')
  localStorage.removeItem('discord_user')
  window.location.href = '/login'
}

export const handleDiscordLogin = () => {
  const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  const REDIRECT_URI = encodeURIComponent(window.location.origin + '/login')
  const SCOPE = encodeURIComponent('identify guilds')
  
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`
  
  window.location.href = discordAuthUrl
}

export const requireAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const [isChecking, setIsChecking] = useState(true)
    const [isAuthed, setIsAuthed] = useState(false)

    useEffect(() => {
      const token = getDiscordToken()
      if (token) {
        setIsAuthed(true)
      } else {
        handleDiscordLogin()
      }
      setIsChecking(false)
    }, [])

    if (isChecking) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4 text-xl">Loading...</p>
          </div>
        </div>
      )
    }

    if (!isAuthed) {
      return null // Will redirect to login
    }

    return <WrappedComponent {...props} />
  }
}
