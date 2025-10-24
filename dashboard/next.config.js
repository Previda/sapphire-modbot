/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.discordapp.com', 'i.imgur.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
    ],
  },
  env: {
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
    BOT_API_URL: process.env.BOT_API_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
