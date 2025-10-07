import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

const isConfigured = !!(process.env.DISCORD_CLIENT_SECRET && process.env.NEXTAUTH_SECRET)

export default NextAuth({
  providers: isConfigured ? [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1358527215020544222',
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify email guilds'
        }
      }
    })
  ] : [],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.discordId = profile?.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken
      }
      if (token.discordId) {
        session.user.discordId = token.discordId
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  debug: false,
  session: {
    strategy: 'jwt'
  }
})
