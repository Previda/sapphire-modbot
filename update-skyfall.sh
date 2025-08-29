#!/bin/bash

# Skyfall Bot Update Script
echo "🚀 Updating Sapphire Bot on Skyfall..."

# Navigate to bot directory (create if doesn't exist)
cd /home/admin || exit 1

# Remove old nested directory if it exists
if [ -d "sapphire-modbot/sapphire-modbot" ]; then
    echo "🧹 Cleaning up nested directory..."
    rm -rf sapphire-modbot/sapphire-modbot
fi

# Clone fresh copy if directory doesn't exist properly
if [ ! -d "sapphire-modbot" ] || [ ! -f "sapphire-modbot/package.json" ]; then
    echo "📥 Cloning fresh repository..."
    rm -rf sapphire-modbot
    git clone https://github.com/Previda/sapphire-modbot.git
fi

cd sapphire-modbot || exit 1

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Register commands
echo "🔧 Registering Discord commands..."
node scripts/register-commands.js

# Stop old bot instances
echo "🛑 Stopping old bot instances..."
pm2 delete sapphire-bot 2>/dev/null || echo "No existing bot to stop"

# Start bot
echo "🚀 Starting bot..."
pm2 start index.js --name sapphire-bot

# Show status
echo "📊 Bot status:"
pm2 list

echo "✅ Update complete! Check logs with: pm2 logs sapphire-bot"
