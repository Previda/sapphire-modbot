#!/bin/bash

echo "🔧 Fixing Pi Bot Dependencies..."

# Stop bot
pm2 stop discord-bot

# Remove problematic node_modules
rm -rf node_modules package-lock.json

# Clean npm cache
npm cache clean --force

# Install dependencies
npm install --legacy-peer-deps

# Restart bot
pm2 restart discord-bot

echo "✅ Fixed! Bot restarting..."
pm2 logs discord-bot --lines 20
