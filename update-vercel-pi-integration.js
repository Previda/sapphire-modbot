#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 Updating Vercel to Pi Integration');
console.log('===================================\n');

async function updateVercelConfig() {
    console.log('⚙️ Updating Vercel configuration...\n');
    
    const vercelConfig = {
        "version": 2,
        "builds": [
            {
                "src": "package.json",
                "use": "@vercel/next"
            }
        ],
        "env": {
            "DISCORD_CLIENT_ID": "1358527215020544222",
            "PI_BOT_API_URL": "http://192.168.1.62:3004",
            "PI_BOT_TOKEN": "95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af",
            "DASHBOARD_API_URL": "https://skyfall-omega.vercel.app",
            "NEXT_PUBLIC_BOT_NAME": "Skyfall",
            "NEXT_PUBLIC_API_URL": "http://192.168.1.62:3004"
        },
        "functions": {
            "pages/api/**/*.js": {
                "maxDuration": 30
            }
        },
        "headers": [
            {
                "source": "/api/(.*)",
                "headers": [
                    {
                        "key": "Access-Control-Allow-Origin",
                        "value": "*"
                    },
                    {
                        "key": "Access-Control-Allow-Methods", 
                        "value": "GET, POST, PUT, DELETE, OPTIONS"
                    },
                    {
                        "key": "Access-Control-Allow-Headers",
                        "value": "Content-Type, Authorization, X-Requested-With"
                    },
                    {
                        "key": "Access-Control-Allow-Credentials",
                        "value": "true"
                    }
                ]
            }
        ],
        "rewrites": [
            {
                "source": "/api/bot/:path*",
                "destination": "http://192.168.1.62:3004/:path*"
            }
        ]
    };
    
    const vercelPath = path.join(__dirname, 'vercel.json');
    fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Updated vercel.json with new Pi port (3004)');
}

async function updateNextConfig() {
    console.log('⚙️ Updating Next.js configuration...\n');
    
    const nextConfig = `/** @type {import('next').NextConfig} */
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
`;

    const nextConfigPath = path.join(__dirname, 'next.config.js');
    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log('✅ Updated Next.js config with Pi integration');
}

async function updateApiTestLive() {
    console.log('🔧 Updating test-live API endpoint...\n');
    
    const testLiveContent = `// API endpoint to test Pi bot connection
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3004';
    const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN || '95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af';
    
    console.log('Testing connection to:', PI_BOT_API_URL);
    
    // Test connection to Pi bot
    const response = await fetch(\`\${PI_BOT_API_URL}/api/status\`, {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${PI_BOT_TOKEN}\`,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    if (response.ok) {
      const data = await response.json();
      
      return res.status(200).json({
        success: true,
        message: 'Pi bot connection successful',
        botName: 'Skyfall',
        piUrl: PI_BOT_API_URL,
        data: data,
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error(\`Pi bot responded with status: \${response.status}\`);
    }
    
  } catch (error) {
    console.error('Pi bot connection error:', error);
    
    return res.status(200).json({
      success: false,
      message: 'Using fallback data - Pi bot unavailable',
      error: error.message,
      botName: 'Skyfall',
      piUrl: process.env.PI_BOT_API_URL || 'http://192.168.1.62:3004',
      fallbackData: {
        status: 'online',
        guilds: 5,
        users: 1250,
        commands: 60,
        uptime: '2d 14h 32m',
        version: '1.0.0',
        lastUpdate: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }
}
`;

    const testLivePath = path.join(__dirname, 'pages', 'api', 'test-live.js');
    const apiDir = path.dirname(testLivePath);
    
    if (!fs.existsSync(apiDir)) {
        fs.mkdirSync(apiDir, { recursive: true });
    }
    
    fs.writeFileSync(testLivePath, testLiveContent);
    console.log('✅ Updated test-live API endpoint');
}

async function updateDashboardComponent() {
    console.log('📊 Updating dashboard component...\n');
    
    const dashboardPath = path.join(__dirname, 'components', 'ModernGlassDashboard.js');
    
    if (fs.existsSync(dashboardPath)) {
        let content = fs.readFileSync(dashboardPath, 'utf8');
        
        // Update API URLs and bot name
        content = content.replace(/http:\/\/192\.168\.1\.62:3001/g, 'http://192.168.1.62:3004');
        content = content.replace(/Sapphire/g, 'Skyfall');
        content = content.replace(/sapphire-modbot/g, 'skyfall');
        
        // Update fetch URLs
        content = content.replace(
            /fetch\(['"`]\/api\/test-live['"`]\)/g,
            "fetch('/api/test-live')"
        );
        
        fs.writeFileSync(dashboardPath, content);
        console.log('✅ Updated dashboard component');
    }
}

async function createVercelDeployScript() {
    console.log('🚀 Creating Vercel deployment script...\n');
    
    const deployScript = `#!/bin/bash

echo "🌐 Deploying Skyfall to Vercel with Pi Integration"
echo "================================================"

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Set environment variables
echo "⚙️ Setting Vercel environment variables..."

vercel env add DISCORD_CLIENT_ID production <<< "1358527215020544222"
vercel env add PI_BOT_API_URL production <<< "http://192.168.1.62:3004"
vercel env add PI_BOT_TOKEN production <<< "95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af"
vercel env add DASHBOARD_API_URL production <<< "https://skyfall-omega.vercel.app"
vercel env add NEXT_PUBLIC_BOT_NAME production <<< "Skyfall"

echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your Skyfall dashboard is now live with Pi integration"
echo "🔗 URL: https://skyfall-omega.vercel.app"
echo "🤖 Bot API: http://192.168.1.62:3004"
`;

    const deployPath = path.join(__dirname, 'deploy-vercel-complete.sh');
    fs.writeFileSync(deployPath, deployScript);
    
    try {
        fs.chmodSync(deployPath, '755');
    } catch (error) {
        // Ignore chmod errors on Windows
    }
    
    console.log('✅ Created Vercel deployment script');
}

async function main() {
    try {
        console.log('🚀 Starting Vercel to Pi integration update...\n');
        
        await updateVercelConfig();
        await updateNextConfig();
        await updateApiTestLive();
        await updateDashboardComponent();
        await createVercelDeployScript();
        
        console.log('\n🎉 Vercel to Pi integration updated!');
        console.log('\n📋 What was updated:');
        console.log('✅ Vercel config updated to use Pi port 3004');
        console.log('✅ Next.js config updated with proper rewrites');
        console.log('✅ API endpoints updated for Pi integration');
        console.log('✅ Dashboard component updated with Skyfall branding');
        console.log('✅ Environment variables configured');
        
        console.log('\n🚀 Deploy to Vercel:');
        console.log('1. Commit: git add . && git commit -m "Update Vercel Pi integration"');
        console.log('2. Push: git push origin main');
        console.log('3. Deploy: chmod +x deploy-vercel-complete.sh && ./deploy-vercel-complete.sh');
        console.log('4. Or manually: vercel --prod');
        
        console.log('\n🎯 Expected results:');
        console.log('• Website shows "Skyfall" everywhere');
        console.log('• Dashboard connects to Pi on port 3004');
        console.log('• Real-time bot data from Pi');
        console.log('• All API endpoints working');
        
        console.log('\n🌐 Your Skyfall ecosystem will be fully integrated!');
        
    } catch (error) {
        console.error('💥 Update process failed:', error);
    }
}

main();
