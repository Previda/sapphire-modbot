#!/bin/bash

echo "🔄 Updating Skyfall Bot..."
echo ""

cd ~/sapphire-modbot

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install any new dependencies
echo "📦 Checking dependencies..."
npm install

# Restart bot
echo "🔄 Restarting bot..."
pm2 restart skyfall-bot

# Wait a moment
sleep 2

# Show status
echo ""
echo "✅ Bot updated and restarted!"
echo ""
pm2 status skyfall-bot

echo ""
echo "📊 Watch logs with:"
echo "   pm2 logs skyfall-bot"
echo ""
echo "🎵 Test music with:"
echo "   /play https://www.youtube.com/watch?v=dQw4w9WgXcQ"
