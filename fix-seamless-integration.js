#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔗 CREATING SEAMLESS WEBSITE-BOT INTEGRATION');
console.log('==========================================\n');

async function createAuthSystem() {
    console.log('🔐 Creating Discord OAuth authentication...\n');
    
    // Create auth API endpoint
    const authContent = `import { NextApiRequest, NextApiResponse } from 'next';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DASHBOARD_API_URL + '/api/auth/callback';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Redirect to Discord OAuth
    const discordAuthUrl = \`https://discord.com/api/oauth2/authorize?client_id=\${DISCORD_CLIENT_ID}&redirect_uri=\${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds\`;
    
    res.redirect(discordAuthUrl);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}`;

    const authDir = path.join(__dirname, 'pages', 'api', 'auth');
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(authDir, 'login.js'), authContent);
    console.log('✅ Created Discord OAuth login');
}

async function createAppealsSystem() {
    console.log('📋 Creating appeals system integration...\n');
    
    const appealsContent = `import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Appeals() {
  const [appeals, setAppeals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchAppeals();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchAppeals = async () => {
    try {
      const response = await fetch('/api/appeals');
      const data = await response.json();
      setAppeals(data.appeals || []);
    } catch (error) {
      console.error('Failed to fetch appeals:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitAppeal = async (appealData) => {
    try {
      const response = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appealData)
      });
      
      if (response.ok) {
        fetchAppeals(); // Refresh appeals
      }
    } catch (error) {
      console.error('Failed to submit appeal:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-white/70 mb-6">Please login with Discord to access appeals</p>
          <a href="/api/auth/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
            Login with Discord
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-6">Appeals System</h1>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {appeals.length === 0 ? (
                <p className="text-white/70 text-center py-8">No appeals found</p>
              ) : (
                appeals.map((appeal, index) => (
                  <motion.div
                    key={appeal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-semibold">{appeal.type} Appeal</h3>
                        <p className="text-white/60 text-sm">Submitted: {new Date(appeal.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={\`px-3 py-1 rounded-full text-xs font-medium \${
                        appeal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        appeal.status === 'denied' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }\`}>
                        {appeal.status}
                      </span>
                    </div>
                    <p className="text-white/80">{appeal.reason}</p>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}`;

    fs.writeFileSync(path.join(__dirname, 'pages', 'appeals.js'), appealsContent);
    console.log('✅ Created appeals system page');
}

async function createBotIntegrationAPI() {
    console.log('🤖 Creating bot integration API...\n');
    
    const botAPIContent = `export default async function handler(req, res) {
  const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3005';
  const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN;
  
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;
      
      const response = await fetch(\`\${PI_BOT_API_URL}/api/\${action}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${PI_BOT_TOKEN}\`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      res.status(200).json(result);
      
    } catch (error) {
      res.status(500).json({ error: 'Bot integration failed', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}`;

    fs.writeFileSync(path.join(__dirname, 'pages', 'api', 'bot-integration.js'), botAPIContent);
    console.log('✅ Created bot integration API');
}

async function fixPortIssues() {
    console.log('🔧 Creating port fix for Pi...\n');
    
    const portFixScript = `#!/bin/bash
echo "🔧 FIXING ALL PORT ISSUES"
echo "========================"

# Kill processes on all relevant ports
for port in {3001..3010}; do
    sudo fuser -k \${port}/tcp 2>/dev/null || true
done

# Stop PM2
pm2 delete all 2>/dev/null || true

# Set new port
echo "API_PORT=3005" > .env

# Start bot on new port
pm2 start index.js --name "skyfall-bot"

echo "✅ Bot restarted on port 3005"
echo "🌐 API: http://192.168.1.62:3005"`;

    fs.writeFileSync(path.join(__dirname, 'fix-ports-final.sh'), portFixScript);
    console.log('✅ Created port fix script');
}

async function updateVercelConfig() {
    console.log('🌐 Updating Vercel configuration...\n');
    
    const vercelConfig = {
        "version": 2,
        "builds": [{ "src": "package.json", "use": "@vercel/next" }],
        "env": {
            "DISCORD_CLIENT_ID": "1358527215020544222",
            "PI_BOT_API_URL": "http://192.168.1.62:3005",
            "PI_BOT_TOKEN": "95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af",
            "DASHBOARD_API_URL": "https://skyfall-omega.vercel.app",
            "NEXT_PUBLIC_BOT_NAME": "Skyfall"
        }
    };
    
    fs.writeFileSync(path.join(__dirname, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Updated Vercel config for port 3005');
}

async function main() {
    try {
        await createAuthSystem();
        await createAppealsSystem();
        await createBotIntegrationAPI();
        await fixPortIssues();
        await updateVercelConfig();
        
        console.log('\n🎉 SEAMLESS INTEGRATION CREATED!');
        console.log('\n📋 What was created:');
        console.log('✅ Discord OAuth authentication');
        console.log('✅ Appeals system with login');
        console.log('✅ Bot integration API');
        console.log('✅ Port fix for Pi (3005)');
        console.log('✅ Updated Vercel config');
        
        console.log('\n🚀 DEPLOYMENT:');
        console.log('1. Pi: curl -O https://raw.githubusercontent.com/Previda/sapphire-modbot/main/fix-ports-final.sh && chmod +x fix-ports-final.sh && ./fix-ports-final.sh');
        console.log('2. Vercel: vercel --prod');
        
        console.log('\n🌟 FEATURES:');
        console.log('• Discord login integration');
        console.log('• Appeals system with authentication');
        console.log('• Real-time bot communication');
        console.log('• Seamless website-bot integration');
        
    } catch (error) {
        console.error('💥 Integration setup failed:', error);
    }
}

main();
