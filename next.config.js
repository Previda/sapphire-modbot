/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
  experimental: {
    esmExternals: false,
    forceSwcTransforms: true,
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  
  env: {
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '1358527215020544222',
    PI_BOT_API_URL: process.env.PI_BOT_API_URL || 'http://192.168.1.62:3004',
    PI_BOT_TOKEN: process.env.PI_BOT_TOKEN || '95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af',
    DASHBOARD_API_URL: process.env.DASHBOARD_API_URL || 'https://skyfall-omega.vercel.app',
    NEXT_PUBLIC_BOT_NAME: 'Skyfall',
  },
  
  async rewrites() {
    return [
      {
        source: '/api/bot/:path*',
        destination: process.env.PI_BOT_API_URL + '/:path*'
      }
    ];
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    return config;
  },
  
  images: {
    domains: ['cdn.discordapp.com', 'i.ytimg.com'],
    unoptimized: true,
  },
  
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  generateEtags: false,
};

module.exports = nextConfig;
