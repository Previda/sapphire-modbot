/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.discordapp.com', 'discord.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live chrome-extension: moz-extension: 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' chrome-extension: moz-extension:; img-src 'self' data: https: blob: chrome-extension: moz-extension:; font-src 'self' data: chrome-extension: moz-extension:; connect-src 'self' https: wss: chrome-extension: moz-extension:; media-src 'self' blob:; frame-src 'self' https://vercel.live; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
