#!/bin/bash

echo "🚀 Quick Deploy Script for Pi"

# Stop bot
echo "⏹️ Stopping bot..."
pm2 stop sapphire-bot

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Register commands
echo "🔧 Registering commands..."
node scripts/register-commands.js

# Start bot
echo "🚀 Starting bot..."
pm2 restart sapphire-bot

# Show status
echo "📊 Bot status:"
pm2 status sapphire-bot

# Show recent logs
echo "📋 Recent logs:"
pm2 logs sapphire-bot --lines 5 --nostream

echo "✅ Deployment complete!"
