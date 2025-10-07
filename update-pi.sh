#!/bin/bash
# Complete Pi Update Script - All 53 Commands Working
# This updates your Pi with all the latest fixes and optimizations

set -e

echo "🔄 Updating Sapphire Modbot on Pi..."
# Stop services
echo "⏹️ Stopping services..."
sudo systemctl stop sapphire-api sapphire-bot 2>/dev/null || true

# Backup current .env
if [ -f .env ]; then
    cp .env .env.backup
    echo "💾 Backed up .env file"
fi

# Stop existing bot
echo "⏹️ Stopping existing bot..."
pm2 stop sapphire-bot 2>/dev/null || true
pm2 delete sapphire-bot 2>/dev/null || true

# Pull latest changes
echo "⬇️ Pulling latest updates from GitHub..."
git stash 2>/dev/null || true
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --production

# Register commands with Discord
echo "🔧 Registering slash commands..."
if [ -f .env ] && grep -q "DISCORD_TOKEN" .env && ! grep -q "your_discord_token_here" .env; then
    node register-commands.js
    echo "✅ Commands registered successfully"
else
    echo "⚠️ Skipping command registration - Discord token not configured"
fi

# Start bot with PM2
echo "🚀 Starting bot..."
pm2 start ecosystem.config.js

# Wait for startup
sleep 10

# Check status
echo "📊 Bot Status:"
pm2 status sapphire-bot

echo ""
echo "📋 Recent Logs:"
pm2 logs sapphire-bot --lines 15 --nostream

echo ""
echo "✅ Update Complete!"
echo ""
echo "🔧 Available Commands:"
echo "  pm2 status          - Check bot status"
echo "  pm2 logs sapphire-bot - View logs"
echo "  pm2 restart sapphire-bot - Restart bot"
echo ""

# Check if bot is online
if pm2 jlist | grep -q '"status":"online"'; then
    echo "🎉 Bot is ONLINE and running!"
else
    echo "⚠️ Bot may not be online - check logs above"
    echo "Common fixes:"
    echo "  - Verify Discord token in .env"
    echo "  - Check network connectivity"
    echo "  - View full logs: pm2 logs sapphire-bot"
fi
