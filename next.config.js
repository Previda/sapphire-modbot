/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Fix hydration issues
  experimental: {
    esmExternals: false,
    // Disable SSR for problematic components
    optimizeCss: true,
  },
  
  // Compiler options to help with hydration
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Environment variables
  env: {
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    PI_BOT_API_URL: process.env.PI_BOT_API_URL,
    DASHBOARD_API_URL: process.env.DASHBOARD_API_URL,
  },
  
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/bot/:path*',
        destination: process.env.PI_BOT_API_URL + '/:path*'
      }
    ];
  },
  
  // Headers for CORS and hydration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
  
  // Webpack configuration for hydration fixes
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Fix for hydration issues with dynamic imports
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
        },
      },
    };
    
    return config;
  },
  
  // Image optimization
  images: {
    domains: ['cdn.discordapp.com', 'i.ytimg.com'],
    unoptimized: true
  },
  
  // Output configuration
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  
  // Disable x-powered-by for security
  generateEtags: false,
};

module.exports = nextConfig;
