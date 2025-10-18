#!/bin/bash

echo "🚀 Starting Skyfall Bot..."
echo ""

# Navigate to bot directory
cd ~/sapphire-modbot

# Stop existing bot
echo "🛑 Stopping existing bot..."
pm2 stop discord-bot 2>/dev/null
pm2 delete discord-bot 2>/dev/null

# Start bot
echo "▶️  Starting bot..."
pm2 start src/bot-with-api.js --name discord-bot

# Save PM2 configuration
pm2 save

echo ""
echo "✅ Bot started!"
echo ""
echo "📋 Checking status..."
pm2 status

echo ""
echo "📝 Showing logs (press Ctrl+C to exit)..."
sleep 2
pm2 logs discord-bot --lines 30
