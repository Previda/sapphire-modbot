// Environment configuration with fallbacks
export const env = {
  // NextAuth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // Discord OAuth
  DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1358527215020544222',
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
  
  // Pi Connection
  PI_BOT_API_URL: process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001',
  PI_BOT_TOKEN: process.env.PI_BOT_TOKEN || '',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Check if we're in production
  isProduction: process.env.NODE_ENV === 'production',
  
  // Check if OAuth is configured
  isOAuthConfigured: !!(process.env.DISCORD_CLIENT_SECRET && process.env.NEXTAUTH_SECRET)
}

// Validate required environment variables in production
if (env.isProduction) {
  const required = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`)
  }
}
