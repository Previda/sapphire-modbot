import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify email guilds'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.discordId = profile.id
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.discordId = token.discordId
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
})
