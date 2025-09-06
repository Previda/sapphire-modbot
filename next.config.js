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
            value: "default-src 'self' 'unsafe-eval' 'unsafe-inline' chrome-extension: moz-extension: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live chrome-extension: moz-extension: 'wasm-unsafe-eval' blob: data: 'unsafe-hashes'; style-src 'self' 'unsafe-inline' chrome-extension: moz-extension: 'unsafe-hashes'; img-src 'self' data: https: blob: chrome-extension: moz-extension:; font-src 'self' data: chrome-extension: moz-extension:; connect-src 'self' https: wss: chrome-extension: moz-extension: blob: data:; media-src 'self' blob: data:; frame-src 'self' https://vercel.live chrome-extension: moz-extension:; object-src 'self' chrome-extension: moz-extension:; base-uri 'self'; frame-ancestors 'self'; worker-src 'self' blob: 'unsafe-eval' chrome-extension: moz-extension:; child-src 'self' blob: chrome-extension: moz-extension:;"
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
