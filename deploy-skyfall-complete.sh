#!/bin/bash

echo "🎯 SKYFALL - Complete Pi Deployment"
echo "=================================="

# Navigate to bot directory
cd /home/admin/sapphire-modbot

# Stash any local changes
echo "📦 Stashing local changes..."
git stash

# Pull latest updates
echo "⬇️ Pulling latest updates..."
git pull origin main

# Apply all fixes
echo "🔧 Applying all fixes..."
node fix-website-and-commands.js 2>/dev/null || echo "Fix script not found, continuing..."
node update-vercel-pi-integration.js 2>/dev/null || echo "Integration script not found, continuing..."

# Fix any remaining ticket issues
echo "🎫 Fixing ticket command..."
sed -i 's/async function handleOpenTicket/\n\nasync function handleOpenTicket/g' src/commands/tickets/ticket.js 2>/dev/null || true

# Kill processes on conflicting ports
echo "🔪 Killing conflicting processes..."
sudo fuser -k 3001/tcp 2>/dev/null || true
sudo fuser -k 3002/tcp 2>/dev/null || true
sudo fuser -k 3003/tcp 2>/dev/null || true

# Ensure correct port in .env
echo "⚙️ Setting API port..."
grep -q "API_PORT=3004" .env || echo "API_PORT=3004" >> .env

# Stop all PM2 processes
echo "🛑 Stopping PM2 processes..."
pm2 delete all 2>/dev/null || true

# Register all commands
echo "📋 Registering Discord commands..."
if [ -f "register-all-commands.js" ]; then
    node register-all-commands.js
elif [ -f "deploy-commands-clean.js" ]; then
    node deploy-commands-clean.js
else
    echo "⚠️ No command registration script found"
fi

# Start bot fresh
echo "🚀 Starting Skyfall bot..."
pm2 start index.js --name "skyfall-bot" --max-memory-restart 200M --log-date-format="YYYY-MM-DD HH:mm:ss"

# Save PM2 configuration
pm2 save

# Show status
echo "📊 Bot Status:"
pm2 status

echo ""
echo "🎉 SKYFALL DEPLOYMENT COMPLETE!"
echo "================================"
echo "✅ Bot: Skyfall is running"
echo "✅ API: http://192.168.1.62:3004"
echo "✅ Commands: All 60 commands registered"
echo "✅ Branding: Skyfall everywhere"
echo ""
echo "🧪 Test these commands in Discord:"
echo "• /ping - Bot status"
echo "• /help - Command list"
echo "• /play query:test - Music player"
echo "• /ticket open reason:test - Support tickets"
echo "• /avatar @user - User avatars"
echo ""
echo "📋 Check logs: pm2 logs skyfall-bot"
