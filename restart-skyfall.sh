#!/bin/bash

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
