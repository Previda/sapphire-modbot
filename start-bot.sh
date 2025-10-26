#!/bin/bash

echo "🚀 Starting Skyfall Bot..."
echo ""

# Navigate to bot directory
cd ~/sapphire-modbot

# Check if node_modules exists and install if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/play-dl" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check for port conflicts
echo "🔍 Checking for port conflicts..."
PORT_PID=$(lsof -ti:3001 2>/dev/null)
if [ ! -z "$PORT_PID" ]; then
    echo "⚠️  Port 3001 is in use by process $PORT_PID"
    echo "🔪 Killing process..."
    kill -9 $PORT_PID 2>/dev/null
    sleep 1
fi

# Stop existing bot instances
echo "🛑 Stopping existing bot instances..."
pm2 stop skyfall-bot 2>/dev/null
pm2 delete skyfall-bot 2>/dev/null
pm2 stop discord-bot 2>/dev/null
pm2 delete discord-bot 2>/dev/null

# Start bot
echo "▶️  Starting bot..."
pm2 start src/index.js --name skyfall-bot

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
pm2 logs skyfall-bot --lines 30
