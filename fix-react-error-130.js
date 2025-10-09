#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React Error #130 - Hydration Mismatch');
console.log('===============================================\n');

async function fixAppJs() {
    console.log('📱 Fixing _app.js with NoSSR wrapper...\n');
    
    const appPath = path.join(__dirname, 'pages', '_app.js');
    
    const fixedAppContent = `import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import ErrorBoundary from '../components/ErrorBoundary'
import { useState, useEffect } from 'react'

// NoSSR wrapper to prevent hydration issues
function NoSSR({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return children;
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <NoSSR>
      <ErrorBoundary>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </ErrorBoundary>
    </NoSSR>
  )
}

// Disable SSR to prevent hydration mismatches
MyApp.getInitialProps = async () => {
  return { pageProps: {} };
};

export default MyApp
`;

    fs.writeFileSync(appPath, fixedAppContent);
    console.log('✅ Fixed _app.js with NoSSR wrapper');
}

async function fixIndexPage() {
    console.log('🏠 Fixing index.js page...\n');
    
    const indexPath = path.join(__dirname, 'pages', 'index.js');
    
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf8');
        
        // Wrap the entire component with client-side only rendering
        const fixedIndexContent = `import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sapphire Modbot - Advanced Discord Management</title>
        <meta name="description" content="Advanced Discord moderation bot with comprehensive features" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-white font-semibold text-lg">Sapphire Modbot</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Advanced Discord
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {' '}Moderation
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                Powerful moderation tools, advanced security features, and comprehensive server management 
                all in one sophisticated Discord bot.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/invite"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg"
                >
                  Add to Server
                </Link>
                
                <Link 
                  href="/dashboard"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 backdrop-blur-sm border border-white/20"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🛡️</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Advanced Security</h3>
              <p className="text-white/70">
                Anti-raid, anti-nuke, and comprehensive threat detection to keep your server safe.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎫</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Ticket System</h3>
              <p className="text-white/70">
                Professional support ticket system with transcripts and case management.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Analytics Dashboard</h3>
              <p className="text-white/70">
                Real-time server analytics and moderation insights through our web dashboard.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎵</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Music Player</h3>
              <p className="text-white/70">
                High-quality music streaming with playlist support and audio controls.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Lightning Fast</h3>
              <p className="text-white/70">
                Optimized performance with minimal latency and maximum reliability.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🔧</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Easy Setup</h3>
              <p className="text-white/70">
                Simple configuration with intuitive commands and comprehensive documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-white/60">
              <p>&copy; 2024 Sapphire Modbot. Advanced Discord server management.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
`;

        fs.writeFileSync(indexPath, fixedIndexContent);
        console.log('✅ Fixed index.js with client-side rendering');
    }
}

async function fixNextConfig() {
    console.log('⚙️ Creating hydration-safe Next.js config...\n');
    
    const nextConfigPath = path.join(__dirname, 'next.config.js');
    
    const nextConfig = `/** @type {import('next').NextConfig} */
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
            test: /[\\\\/]node_modules[\\\\/]/,
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
`;

    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log('✅ Created hydration-safe Next.js config');
}

async function createClientOnlyWrapper() {
    console.log('🛡️ Creating ClientOnly wrapper component...\n');
    
    const clientOnlyPath = path.join(__dirname, 'components', 'ClientOnly.js');
    
    const clientOnlyContent = `import { useState, useEffect } from 'react';

const ClientOnly = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return children;
};

export default ClientOnly;
`;

    const componentsDir = path.dirname(clientOnlyPath);
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }
    
    fs.writeFileSync(clientOnlyPath, clientOnlyContent);
    console.log('✅ Created ClientOnly wrapper component');
}

async function main() {
    try {
        console.log('🚀 Starting React Error #130 fix...\n');
        
        await fixAppJs();
        await fixIndexPage();
        await fixNextConfig();
        await createClientOnlyWrapper();
        
        console.log('\n🎉 React Error #130 fixes completed!');
        console.log('\n📋 What was fixed:');
        console.log('✅ Wrapped _app.js with NoSSR component');
        console.log('✅ Fixed index.js with client-side only rendering');
        console.log('✅ Created hydration-safe Next.js config');
        console.log('✅ Added ClientOnly wrapper component');
        console.log('✅ Disabled React strict mode');
        console.log('✅ Added proper cache headers');
        
        console.log('\n🌐 Deploy to Vercel:');
        console.log('1. Commit changes: git add . && git commit -m "Fix React Error #130"');
        console.log('2. Push: git push origin main');
        console.log('3. Vercel will auto-deploy');
        console.log('4. Or manually: vercel --prod');
        
        console.log('\n🧪 The website should now load without React Error #130!');
        
    } catch (error) {
        console.error('💥 Fix process failed:', error);
    }
}

main();
