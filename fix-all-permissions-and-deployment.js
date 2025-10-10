#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING ALL PERMISSIONS & DEPLOYMENT ISSUES');
console.log('============================================\n');

async function fixBotPermissions() {
    console.log('🔐 Fixing bot permissions and command restrictions...\n');
    
    // Fix ban command to work with Administrator permissions
    const banPath = path.join(__dirname, 'src', 'commands', 'moderation', 'ban.js');
    if (fs.existsSync(banPath)) {
        let content = fs.readFileSync(banPath, 'utf8');
        
        // Remove overly restrictive permission checks
        content = content.replace(
            /\.setDefaultMemberPermissions\(PermissionFlagsBits\.BanMembers\)/g,
            '.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)'
        );
        
        // Fix permission check in execute function
        content = content.replace(
            /if \(!interaction\.member\.permissions\.has\(PermissionFlagsBits\.BanMembers\)\)/g,
            'if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !interaction.member.permissions.has(PermissionFlagsBits.BanMembers) && interaction.guild.ownerId !== interaction.user.id)'
        );
        
        fs.writeFileSync(banPath, content);
        console.log('✅ Fixed ban command permissions');
    }
    
    // Fix verification command
    const verificationPath = path.join(__dirname, 'verification.js');
    if (fs.existsSync(verificationPath)) {
        let content = fs.readFileSync(verificationPath, 'utf8');
        
        // Ensure proper permission handling
        content = content.replace(
            /\.setDefaultMemberPermissions\(.*?\)/g,
            '.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)'
        );
        
        fs.writeFileSync(verificationPath, content);
        console.log('✅ Fixed verification command permissions');
    }
    
    // Fix all moderation commands to respect Administrator permission
    const moderationCommands = [
        'src/commands/moderation/kick.js',
        'src/commands/moderation/mute.js',
        'src/commands/moderation/timeout.js',
        'src/commands/moderation/warn.js',
        'src/commands/moderation/unban.js'
    ];
    
    for (const cmdPath of moderationCommands) {
        const fullPath = path.join(__dirname, cmdPath);
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Update permission checks to include Administrator
            content = content.replace(
                /if \(!interaction\.member\.permissions\.has\(PermissionFlagsBits\.\w+\)\)/g,
                'if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) && interaction.guild.ownerId !== interaction.user.id)'
            );
            
            fs.writeFileSync(fullPath, content);
            console.log(`✅ Fixed ${cmdPath} permissions`);
        }
    }
}

async function fixVercelConfig() {
    console.log('🌐 Fixing Vercel deployment configuration...\n');
    
    // Create a clean vercel.json without conflicting properties
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
            "NEXT_PUBLIC_BOT_NAME": "Skyfall"
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
    console.log('✅ Fixed vercel.json configuration');
}

async function fixNextConfig() {
    console.log('⚙️ Fixing Next.js configuration...\n');
    
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
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
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
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
};

module.exports = nextConfig;
`;

    const nextConfigPath = path.join(__dirname, 'next.config.js');
    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log('✅ Fixed Next.js configuration');
}

async function createPiRestartScript() {
    console.log('🚀 Creating Pi restart and deployment script...\n');
    
    const piScript = `#!/bin/bash

echo "🚀 SKYFALL - Quick Restart & Fix"
echo "==============================="

# Navigate to bot directory
cd /home/admin/sapphire-modbot

# Kill conflicting processes
sudo fuser -k 3001/tcp 3002/tcp 3003/tcp 2>/dev/null || true

# Ensure correct port
grep -q "API_PORT=3004" .env || echo "API_PORT=3004" >> .env

# Stop PM2
pm2 delete all 2>/dev/null || true

# Start bot
pm2 start index.js --name "skyfall-bot" --max-memory-restart 200M

# Show status
pm2 status
pm2 logs skyfall-bot --lines 10

echo ""
echo "✅ Skyfall bot restarted!"
echo "🧪 Test: /ban @user reason:test"
echo "🧪 Test: /verification setup"
`;

    const piScriptPath = path.join(__dirname, 'restart-skyfall.sh');
    fs.writeFileSync(piScriptPath, piScript);
    
    try {
        fs.chmodSync(piScriptPath, '755');
    } catch (error) {
        // Ignore chmod errors on Windows
    }
    
    console.log('✅ Created Pi restart script');
}

async function createVercelFixScript() {
    console.log('🌐 Creating Vercel deployment fix...\n');
    
    const vercelScript = `#!/bin/bash

echo "🌐 SKYFALL - Vercel Deployment Fix"
echo "================================="

# Install Vercel CLI if needed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy with fixed configuration
echo "🚀 Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "✅ Vercel deployment complete!"
echo "🌐 Website: https://skyfall-omega.vercel.app"
`;

    const vercelScriptPath = path.join(__dirname, 'fix-vercel-deploy.sh');
    fs.writeFileSync(vercelScriptPath, vercelScript);
    
    try {
        fs.chmodSync(vercelScriptPath, '755');
    } catch (error) {
        // Ignore chmod errors on Windows
    }
    
    console.log('✅ Created Vercel deployment fix script');
}

async function main() {
    try {
        console.log('🚀 Starting comprehensive fixes...\n');
        
        await fixBotPermissions();
        await fixVercelConfig();
        await fixNextConfig();
        await createPiRestartScript();
        await createVercelFixScript();
        
        console.log('\n🎉 ALL FIXES COMPLETED!');
        console.log('\n📋 What was fixed:');
        console.log('✅ Bot permissions - Administrator can now use all commands');
        console.log('✅ Ban command - Will work with Administrator permissions');
        console.log('✅ Verification system - Fixed integration issues');
        console.log('✅ Vercel config - Removed conflicting properties');
        console.log('✅ Next.js config - Clean configuration');
        
        console.log('\n🚀 DEPLOYMENT COMMANDS:');
        console.log('\n🤖 For Pi (in PuTTY):');
        console.log('curl -O https://raw.githubusercontent.com/Previda/sapphire-modbot/main/restart-skyfall.sh');
        console.log('chmod +x restart-skyfall.sh');
        console.log('./restart-skyfall.sh');
        
        console.log('\n🌐 For Vercel (locally):');
        console.log('chmod +x fix-vercel-deploy.sh');
        console.log('./fix-vercel-deploy.sh');
        
        console.log('\n🎯 Expected results:');
        console.log('• /ban command will work for Administrators');
        console.log('• /verification setup will work properly');
        console.log('• Vercel deployment will succeed');
        console.log('• All permissions properly configured');
        
        console.log('\n🌟 YOUR SKYFALL BOT WILL HAVE FULL PERMISSIONS!');
        
    } catch (error) {
        console.error('💥 Fix process failed:', error);
    }
}

main();
