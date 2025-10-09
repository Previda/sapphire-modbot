/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent hydration issues
  swcMinify: true,
  
  // Experimental features to help with hydration
  experimental: {
    esmExternals: false,
    // Force client-side rendering for problematic components
    forceSwcTransforms: true,
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  
  // Environment variables
  env: {
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    PI_BOT_API_URL: process.env.PI_BOT_API_URL,
    DASHBOARD_API_URL: process.env.DASHBOARD_API_URL,
  },
  
  // Webpack configuration to prevent hydration issues
  webpack: (config, { isServer, dev }) => {
    // Client-side fallbacks
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
    
    // Prevent hydration issues with dynamic imports
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
  // Image configuration
  images: {
    domains: ['cdn.discordapp.com', 'i.ytimg.com'],
    unoptimized: true,
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
  
  // Headers to prevent caching issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  
  // Output configuration
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  
  // Disable x-powered-by
  generateEtags: false,
};

module.exports = nextConfig;
